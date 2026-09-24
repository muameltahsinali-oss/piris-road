"""Harvest EN->AR translations from the staging site by aligning the text nodes of
each English page with its /ar/ counterpart. TranslatePress rewrites text nodes
in place, so the DOM skeleton is the same; we align on (tag, class) signatures
with difflib and pair texts inside matching blocks.

Only pairs where the EN side has Latin letters and the AR side has Arabic
letters are kept. Output merges with the backup dictionary (backup wins on
conflict only if staging is identical; staging is newer, so staging wins)."""
import sys, re, json, glob, os, difflib
from lxml import html as LH

sys.stdout.reconfigure(encoding="utf-8")
BASE = os.path.dirname(os.path.abspath(__file__))
ST = os.path.join(BASE, "staging")
DICT = r"C:\Users\omlsa\Desktop\piris_road\content\ar-dictionary.json"

LATIN = re.compile(r"[A-Za-z]")
ARABIC = re.compile(r"[\u0600-\u06FF]")


def nodes(path):
    doc = LH.parse(path).getroot()
    for bad in doc.xpath("//script|//style|//noscript|//svg|//*[contains(@class,'trp-language-switcher')]|//*[contains(@class,'trp_language_switcher')]"):
        p = bad.getparent()
        if p is not None:
            p.remove(bad)
    body = doc.xpath("//body")[0]
    out = []
    for el in body.iter():
        if not isinstance(el.tag, str):
            continue
        sig = "%s.%s" % (el.tag, " ".join(sorted((el.get("class") or "").split()))[:60])
        for part in ([el.text] if el.text else []):
            t = re.sub(r"\s+", " ", part).strip()
            if t:
                out.append((sig, t))
        for ch in el:
            if ch.tail:
                t = re.sub(r"\s+", " ", ch.tail).strip()
                if t:
                    out.append((sig + "~tail", t))
    # also harvest attribute text (placeholders)
    for el in body.xpath(".//*[@placeholder]"):
        out.append(("attr.placeholder", el.get("placeholder").strip()))
    return out


pairs = {}
conflicts = 0
for en in sorted(glob.glob(os.path.join(ST, "*.html"))):
    if en.endswith("_ar.html"):
        continue
    # post bodies are imported whole (gen_posts_staging.py); their repeated
    # list items are where node alignment is least reliable
    if not os.path.basename(en).startswith(("home", "about", "our-services", "contact-us", "blog", "elementor-page", "services_")):
        continue
    ar = en[:-5] + "_ar.html"
    if not os.path.exists(ar):
        continue
    a, b = nodes(en), nodes(ar)
    sm = difflib.SequenceMatcher(None, [s for s, _ in a], [s for s, _ in b], autojunk=False)
    n = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag != "equal":
            continue
        for k in range(i2 - i1):
            e, r = a[i1 + k][1], b[j1 + k][1]
            if e == r or not LATIN.search(e) or not ARABIC.search(r):
                continue
            if len(e) > 1200:
                continue
            if e in pairs and pairs[e] != r:
                conflicts += 1
                continue
            pairs[e] = r
            n += 1
    print("%-70s %d pairs" % (os.path.basename(en), n))

existing = json.load(open(DICT, encoding="utf-8"))
added = {k: v for k, v in pairs.items() if k not in existing}
changed = {k: v for k, v in pairs.items() if k in existing and existing[k] != v}
print("\nstaging pairs: %d  new: %d  differing from backup: %d  conflicts: %d" % (len(pairs), len(added), len(changed), conflicts))
json.dump(pairs, open(os.path.join(BASE, "staging_ar_pairs.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k in list(added)[:40]:
    print("  +", k[:70], "=>", added[k][:60])
