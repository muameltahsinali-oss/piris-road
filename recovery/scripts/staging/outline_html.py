"""Outline a rendered staging page: top-level sections (as-* theme classes),
headings, buttons and images, in document order."""
import sys, re
from lxml import html as LH

sys.stdout.reconfigure(encoding="utf-8")
path = sys.argv[1]
doc = LH.parse(path).getroot()
for bad in doc.xpath("//script|//style|//noscript|//svg"):
    bad.getparent().remove(bad)


def txt(e, n=90):
    return re.sub(r"\s+", " ", e.text_content()).strip()[:n]


def as_classes(e):
    return [c for c in (e.get("class") or "").split() if re.match(r"(as|wa|pr)-", c)]


SECTION_RX = re.compile(r"^as-[a-z]+-\d+-(area|wrap|section|sec)$|^pr-hero$|^as-footer-\d+-area$|^as-header-\d+-area$|^as-breadcrumb")
seen = set()
for e in doc.iter():
    if not isinstance(e.tag, str):
        continue
    cls = as_classes(e)
    hit = [c for c in cls if SECTION_RX.match(c)]
    if hit and id(e) not in seen:
        # skip if an ancestor already printed with same class
        anc = e.getparent()
        skip = False
        while anc is not None:
            if set(hit) & set(as_classes(anc)):
                skip = True
                break
            anc = anc.getparent()
        if skip:
            continue
        print("\n### <%s class=%s>" % (e.tag, " ".join(cls)[:120]))
        for h in e.xpath(".//h1|.//h2|.//h3|.//h4|.//h5|.//h6"):
            t = txt(h)
            if t:
                print("   %s: %s   [%s]" % (h.tag, t, " ".join((h.get("class") or "").split()[:4])))
        btns = [txt(a, 40) for a in e.xpath(".//a[contains(@class,'btn')]|.//button")]
        btns = [b for b in btns if b]
        if btns:
            print("   buttons:", btns[:8])
        imgs = [re.sub(r".*/uploads/", "", i.get("src") or i.get("data-src") or "") for i in e.xpath(".//img")]
        imgs = [i for i in imgs if i]
        if imgs:
            print("   imgs(%d):" % len(imgs), imgs[:10])
