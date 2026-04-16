/*
 * Cloudflare Pages Function — Sync cloud Caisse Stand
 *
 * Endpoint : /api/sync
 *
 * Modèle KV : un état par appareil sous la clé `state:<deviceId>`.
 *   - POST /api/sync   → upload l'état complet de cet appareil (overwrite)
 *   - GET  /api/sync   → renvoie tous les états enregistrés (un par appareil)
 *
 * Le client fusionne côté navigateur via applySyncPayload(). Pas de logique
 * de merge côté serveur (ça évite les conflits car KV est atomique par clé).
 *
 * Authentification : header `Authorization: Bearer <SYNC_TOKEN>` où
 * SYNC_TOKEN est une env var de Pages (Settings → Environment variables).
 *
 * Bindings Cloudflare attendus :
 *   - KV namespace bindé sous le nom `KV` (Settings → Functions → KV bindings)
 *   - Variable SYNC_TOKEN (Settings → Environment variables, encrypted)
 *
 * Limites du free tier Cloudflare (largement suffisantes pour un stand) :
 *   - KV : 1 000 writes/jour, 100 000 reads/jour, 1 GB stockage
 *   - Pages Functions : 100 000 invocations/jour
 *
 * Pour 3 phones qui synchent toutes les 30 s : ~3 phones × 2 ops × 120 cycles/h
 * × 8 h = 5760 ops/jour → 6 % du quota reads. OK.
 */

const KEY_PREFIX = 'state:';
const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5 MB par appareil (KV limit = 25 MB)

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(body, status = 200, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

function checkAuth(request, env) {
  if (!env.SYNC_TOKEN) return false;
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return false;
  const provided = header.slice(7);
  // Note : la comparaison n'est PAS strictement à temps constant — on
  // court-circuite sur la longueur, ce qui peut trahir la taille du token.
  // Pas un vrai risque en pratique : SYNC_TOKEN est un secret aléatoire
  // long (32+ chars recommandé) généré manuellement. Un attaquant qui
  // connaîtrait la longueur n'en tire rien d'exploitable.
  // La boucle XOR ci-dessous, elle, est bien constant-time sur les tokens
  // de même taille (empêche de deviner caractère par caractère).
  if (provided.length !== env.SYNC_TOKEN.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ env.SYNC_TOKEN.charCodeAt(i);
  }
  return diff === 0;
}

// CORS preflight
export async function onRequestOptions({ request }) {
  return new Response(null, { headers: corsHeaders(request.headers.get('Origin')) });
}

// GET /api/sync → renvoie tous les états des appareils enregistrés
export async function onRequestGet({ request, env }) {
  const origin = request.headers.get('Origin');
  if (!checkAuth(request, env)) return jsonResponse({ error: 'unauthorized' }, 401, origin);
  if (!env.KV) return jsonResponse({ error: 'KV binding manquant' }, 500, origin);

  try {
    const list = await env.KV.list({ prefix: KEY_PREFIX });
    const states = [];
    for (const key of list.keys) {
      const raw = await env.KV.get(key.name);
      if (!raw) continue;
      try { states.push(JSON.parse(raw)); }
      catch (e) { /* clé corrompue, on ignore */ }
    }
    return jsonResponse({ states, count: states.length }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: 'kv_error', message: e.message }, 500, origin);
  }
}

// POST /api/sync → upload l'état d'un appareil
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (!checkAuth(request, env)) return jsonResponse({ error: 'unauthorized' }, 401, origin);
  if (!env.KV) return jsonResponse({ error: 'KV binding manquant' }, 500, origin);

  let body;
  try { body = await request.json(); }
  catch (e) { return jsonResponse({ error: 'invalid_json' }, 400, origin); }

  if (!body || typeof body !== 'object' || !body.from || typeof body.from !== 'string') {
    return jsonResponse({ error: 'missing_from' }, 400, origin);
  }
  // Validation basique : champs attendus présents et tableaux ou null
  if (body.produits !== undefined && !Array.isArray(body.produits)) {
    return jsonResponse({ error: 'produits_must_be_array' }, 400, origin);
  }
  if (body.ventes !== undefined && !Array.isArray(body.ventes)) {
    return jsonResponse({ error: 'ventes_must_be_array' }, 400, origin);
  }

  const serialized = JSON.stringify(body);
  if (serialized.length > MAX_PAYLOAD_BYTES) {
    return jsonResponse({ error: 'payload_too_large', max: MAX_PAYLOAD_BYTES }, 413, origin);
  }

  try {
    const key = KEY_PREFIX + body.from;
    await env.KV.put(key, serialized);
    return jsonResponse({ ok: true, key, bytes: serialized.length }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: 'kv_error', message: e.message }, 500, origin);
  }
}
