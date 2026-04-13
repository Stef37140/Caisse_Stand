#!/usr/bin/env python3
"""
build-portable.py — Génère une variante auto-suffisante de Caisse Stand.

Produit un unique fichier HTML (~400 Ko) qui contient Tailwind inliné, pas de
service worker, pas de manifest externe. Utilisable :
  - en double-clic (file://) dans un navigateur moderne
  - via n'importe quel hébergement HTTP statique
  - en clé USB / pièce jointe email / AirDrop

Ne remplace PAS la version PWA multi-fichiers à la racine, qui reste le chemin
recommandé (offline complet via service worker, installable, mises à jour auto).

Usage :
  python3 scripts/build-portable.py
  python3 scripts/build-portable.py --tailwind-file /chemin/vers/tailwind.js
  python3 scripts/build-portable.py --output /autre/chemin/caisse.html
"""

from __future__ import annotations

import argparse
import re
import sys
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = REPO_ROOT / "index.html"
DEFAULT_OUTPUT = REPO_ROOT / "dist" / "caisse-stand-portable.html"
TAILWIND_CDN = "https://cdn.tailwindcss.com"

# Marqueurs posés dans index.html pour permettre un stripping fiable
PWA_CARDS_RE = re.compile(
    r"[ \t]*<!-- PWA-CARDS-START.*?-->\n(.*?)[ \t]*<!-- PWA-CARDS-END -->\n",
    re.DOTALL,
)
PWA_JS_RE = re.compile(
    r"[ \t]*// PWA-JS-START.*?\n(.*?)[ \t]*// PWA-JS-END\n",
    re.DOTALL,
)
TAILWIND_TAG_RE = re.compile(
    r'<script src="https://cdn\.tailwindcss\.com"></script>'
)
MANIFEST_AND_ICONS_RE = re.compile(
    r'<link rel="manifest"[^>]*>\n|'
    r'<link rel="icon"[^>]*>\n|'
    r'<link rel="apple-touch-icon"[^>]*>\n'
)
TITLE_RE = re.compile(r"<title>.*?</title>")


def fetch_tailwind() -> bytes:
    print(f"→ Téléchargement de Tailwind depuis {TAILWIND_CDN} ...")
    try:
        req = urllib.request.Request(
            TAILWIND_CDN,
            headers={"User-Agent": "caisse-stand-build/1.0"},
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        print(f"  ✓ {len(data) // 1024} Ko récupérés")
        return data
    except Exception as e:
        raise RuntimeError(
            f"Impossible de récupérer Tailwind depuis {TAILWIND_CDN} : {e}\n"
            f"Soit ta machine n'a pas accès à internet, soit le CDN est\n"
            f"momentanément indisponible. Workarounds :\n"
            f"  1. Réessayer avec une connexion internet\n"
            f"  2. Télécharger {TAILWIND_CDN} dans un fichier local puis\n"
            f"     passer --tailwind-file <chemin> à ce script"
        ) from e


def load_tailwind(file_path: Path | None) -> str:
    if file_path:
        print(f"→ Utilisation de Tailwind depuis {file_path}")
        data = file_path.read_bytes()
        print(f"  ✓ {len(data) // 1024} Ko lus")
    else:
        data = fetch_tailwind()
    return data.decode("utf-8", errors="replace")


def strip_section(html: str, pattern: re.Pattern, label: str) -> str:
    new_html, n = pattern.subn("", html, count=1)
    if n == 0:
        print(f"  ⚠ Marqueur {label} non trouvé — le stripping a été sauté")
        return html
    print(f"  ✓ {label} retiré")
    return new_html


def build(input_path: Path, output_path: Path, tailwind_file: Path | None) -> None:
    print(f"→ Lecture de {input_path.relative_to(REPO_ROOT)}")
    html = input_path.read_text(encoding="utf-8")
    original_size = len(html)

    print("→ Stripping des éléments PWA incompatibles avec un fichier unique")
    html = strip_section(html, PWA_CARDS_RE, "Cards install/update (HTML)")
    html = strip_section(html, PWA_JS_RE, "Bloc service worker + installabilité (JS)")

    html, n = MANIFEST_AND_ICONS_RE.subn("", html)
    print(f"  ✓ {n} liens manifest/icônes retirés")

    html, n = TITLE_RE.subn("<title>Caisse Stand v3.0 · portable</title>", html, count=1)
    if n:
        print("  ✓ Titre mis à jour")

    print("→ Inlining de Tailwind")
    tailwind = load_tailwind(tailwind_file)
    replacement = (
        "<script>/* Tailwind inliné — généré par scripts/build-portable.py */\n"
        + tailwind.replace("</script>", "<\\/script>")
        + "\n</script>"
    )
    html, n = TAILWIND_TAG_RE.subn(lambda m: replacement, html, count=1)
    if n == 0:
        raise RuntimeError(
            "Balise <script src=\"https://cdn.tailwindcss.com\"> introuvable "
            "dans index.html. Impossible d'inliner Tailwind."
        )
    print(f"  ✓ Tailwind inliné ({len(tailwind) // 1024} Ko)")

    # Petit bandeau visible pour rappeler la nature du fichier
    banner = (
        "<!--\n"
        "  Caisse Stand — version PORTABLE auto-suffisante.\n"
        "  Généré par scripts/build-portable.py. Ne pas éditer à la main.\n"
        "  Pour la version PWA installable (recommandée), voir index.html\n"
        "  à la racine du repo.\n"
        "-->\n"
    )
    html = banner + html

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding="utf-8")
    new_size = len(html)
    try:
        displayed = output_path.relative_to(REPO_ROOT)
    except ValueError:
        displayed = output_path
    print(
        f"→ Écrit : {displayed} "
        f"({new_size // 1024} Ko, delta vs index.html : +{(new_size - original_size) // 1024} Ko)"
    )
    print("✅ Build terminé. Le fichier est autonome (offline complet, sauf PWA install).")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help=f"Fichier source (défaut : {DEFAULT_INPUT.relative_to(REPO_ROOT)})",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Fichier de sortie (défaut : {DEFAULT_OUTPUT.relative_to(REPO_ROOT)})",
    )
    parser.add_argument(
        "--tailwind-file",
        type=Path,
        help="Utilise un fichier Tailwind local au lieu de télécharger depuis le CDN",
    )
    args = parser.parse_args()

    try:
        build(args.input, args.output, args.tailwind_file)
    except Exception as e:
        print(f"\n❌ Échec du build : {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
