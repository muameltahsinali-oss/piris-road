"""Dump visible text of each top-level theme section in a staging page,
de-duplicated, in document order (so we can diff copy against the rebuild)."""
import sys, re
from lxml import html as LH

sys.stdout.reconfigure(encoding="utf-8")
doc = LH.parse(sys.argv[1]).getroot()
for bad in doc.xpath("//script|//style|//noscript|//svg|//*[contains(@class,'wa-offcanvas')]|//*[contains(@class,'trp-')]"):
    p = bad.getparent()
    if p is not None:
        p.remove(bad)

sections = doc.xpath(
    "//section[contains(@class,'-area')] | //footer[contains(@class,'-area')] | //div[contains(@class,'elementor-widget-container')][not(ancestor::section[contains(@class,'-area')])][not(ancestor::footer)][not(ancestor::header)]"
)
printed = set()
for s in sections:
    cls = (s.get("class") or "").split()[0]
    lines = []
    for node in s.iter():
        if not isinstance(node.tag, str) or node.tag in ("script", "style"):
            continue
        for piece in [node.text] + [c.tail for c in node]:
            if piece:
                t = re.sub(r"\s+", " ", piece).strip()
                if t and len(t) > 1:
                    lines.append(t)
    uniq = []
    for l in lines:
        if l not in uniq:
            uniq.append(l)
    key = "\n".join(uniq)
    if not key or key in printed:
        continue
    printed.add(key)
    print("\n==== %s ====" % cls)
    for l in uniq:
        print("  " + l)
    imgs = []
    for i in s.xpath(".//img"):
        src = i.get("src") or i.get("data-src") or ""
        if "/uploads/" in src and src not in imgs:
            imgs.append(src.split("/uploads/")[1])
    if imgs:
        print("  IMGS:", imgs)
