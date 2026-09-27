#!/usr/bin/env python3
"""Run after changing any app file (before uploading):  python3 scripts/update_version.py

- computes a version from the contents of all app files,
- writes that version and the file list into sw.js (so installed apps download the update),
- updates the ?v=… cache-busting parameter on every file in index.html.
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
PATTERNS = ["index.html", "manifest.webmanifest", "css/*.css", "js/*.js", "js/data/*.js",
            "vendor/*.js", "fonts/*.woff2", "icons/*.png"]

files = sorted({p for pat in PATTERNS for p in ROOT.glob(pat)})
index = ROOT / "index.html"
html = index.read_text(encoding="utf-8")

# Hash everything except the ?v= values themselves (so the version doesn't depend on itself).
h = hashlib.sha256()
for p in files:
    data = p.read_bytes()
    if p == index:
        data = re.sub(rb"\?v=[\w-]+", b"", data)
    h.update(p.relative_to(ROOT).as_posix().encode() + b"\0" + data)
version = h.hexdigest()[:10]

html = re.sub(r'((?:href|src)="(?:css|js|vendor)/[^"?]+)(\?v=[\w-]+)?"', rf'\1?v={version}"', html)
index.write_text(html, encoding="utf-8")

sw = ROOT / "sw.js"
src = sw.read_text(encoding="utf-8")
listing = ",\n".join(f'  "./{p.relative_to(ROOT).as_posix()}"' for p in files)
generated = f'const VERSION = "{version}";\nconst FILES = [\n  "./",\n{listing}\n];\n// @generated-end'
src = re.sub(r'const VERSION = .*?// @generated-end', lambda _: generated, src, flags=re.S)
sw.write_text(src, encoding="utf-8")

size = sum(p.stat().st_size for p in files)
print(f"version {version}: {len(files)} files, {size / 1e6:.1f} MB cached for offline use")
