"""Inventory: which media URLs the REAL pages reference, and whether the file
actually exists in the extracted uploads folder."""
import sys, os, re, json
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn, meta, post, php_unserialize, option

BASE = os.path.dirname(os.path.abspath(__file__))
UP = os.path.join(BASE, "site", "uploads")
c = conn()
SITE = "https://aquamarine-gnat-712272.hostingersite.com"

REAL = ["15", "23", "25", "29", "35", "3821", "2582", "2686", "3510", "3513", "2141", "3888",
        "3531", "3537", "3541", "3544", "3548", "3551", "3554", "3689", "3898", "3902"]

urls = {}


def add(u, src):
    u = u.strip()
    if not u:
        return
    if u.startswith("/wp-content"):
        u = SITE + u
    if "/wp-content/uploads/" not in u:
        return
    urls.setdefault(u.split("?")[0], set()).add(src)


# from elementor data + postmeta + content (raw regex sweep = safest)
for pid in REAL:
    p = post(c, pid)
    src = "%s:%s" % (pid, (p[1] if p else "?")[:26])
    blobs = [p[5] if p else ""]
    for k, v in meta(c, pid).items():
        if k in ("_elementor_element_cache",):
            continue
        blobs.append(v or "")
    for b in blobs:
        for u in re.findall(r"https?:\\?/\\?/[^\s\"'<>\\)]+?/wp-content/uploads/[^\s\"'<>\\)]+", b or ""):
            add(u.replace("\\/", "/"), src)

# theme options
for name in ("avista_theme_options", "site_logo"):
    v = option(c, name) or ""
    for u in re.findall(r"https?:\\?/\\?/[^\s\"'<>\\)]+?/wp-content/uploads/[^\s\"'<>\\)]+", v):
        add(u.replace("\\/", "/"), "theme_options")

print("#" * 96)
print("# MEDIA REFERENCED BY THE REAL PAGES: %d distinct URLs" % len(urls))
print("#" * 96)
missing, present = [], []
for u in sorted(urls):
    rel = u.split("/wp-content/uploads/", 1)[1]
    fp = os.path.join(UP, rel.replace("/", os.sep))
    ok = os.path.exists(fp)
    size = os.path.getsize(fp) if ok else 0
    (present if ok else missing).append((rel, size, sorted(urls[u])))
    print("%s %-92s %8s  <- %s" % ("OK " if ok else "MISS", rel, size if ok else "-", ", ".join(sorted(urls[u]))[:60]))

print("\n\nSUMMARY: %d present, %d MISSING from archive" % (len(present), len(missing)))
if missing:
    print("\nMISSING FILES:")
    for rel, _, s in missing:
        print("   %-90s <- %s" % (rel, ", ".join(s)[:60]))

print("\n\n=== attachment count in DB: %s ===" % c.execute(
    "SELECT COUNT(*) FROM posts WHERE post_type='attachment'").fetchone()[0])
print("=== files on disk in uploads: %d ===" % sum(len(f) for _, _, f in os.walk(UP)))
print("\n=== SVG / logo assets present ===")
for root, _, files in os.walk(UP):
    for f in files:
        if f.lower().endswith(".svg") and ("logo" in f.lower() or "font" in f.lower()):
            print("   ", os.path.relpath(os.path.join(root, f), UP).replace(os.sep, "/"))
