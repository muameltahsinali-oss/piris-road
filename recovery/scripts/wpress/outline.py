"""Compact top-level outline of each Elementor page: sections, widgets,
their headline text, and responsive-visibility flags."""
import sys, os, json, re
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn, post, elementor_data

c = conn()

HEAD = ("title", "sub_title", "heading", "big_title", "title_2", "description", "button_text", "shortcode")


def vis(st):
    f = []
    for k, tag in (("hide_desktop", "NO-DESKTOP"), ("hide_tablet", "NO-TABLET"), ("hide_mobile", "NO-MOBILE")):
        if st.get(k):
            f.append(tag)
    return (" [" + ",".join(f) + "]") if f else ""


def brief(st):
    out = []
    for k in HEAD:
        v = st.get(k)
        if isinstance(v, str) and v.strip():
            s = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", v)).strip()
            if s and s.lower() not in ("big title", "heading title", "default text", "button text"):
                out.append("%s=%r" % (k, s[:90]))
    return "  ".join(out)


def walk(nodes, depth, lines):
    for n in nodes or []:
        st = n.get("settings") or {}
        if not isinstance(st, dict):
            st = {}
        et = n.get("elType")
        label = n.get("widgetType") or et
        cls = st.get("css_classes") or st.get("_css_classes") or ""
        eid = st.get("_element_id") or ""
        meta = []
        if cls:
            meta.append("class=%s" % cls)
        if eid:
            meta.append("#%s" % eid)
        if st.get("design_style"):
            meta.append("style=%s" % st["design_style"])
        lines.append(
            "%s%-22s%s%s"
            % ("  " * depth, label, ("  {" + " ".join(meta) + "}") if meta else "", vis(st))
        )
        b = brief(st)
        if b:
            lines.append("%s    %s" % ("  " * depth, b))
        walk(n.get("elements"), depth + 1, lines)


TARGETS = [
    ("2582", "Header 1  (ACTIVE HEADER)"),
    ("15", "Home  (FRONT PAGE)"),
    ("23", "About"),
    ("25", "Our Services"),
    ("29", "Contact us"),
    ("3821", "Get a Quote"),
    ("3510", "Single service (library)"),
    ("3513", "Single-page template -> singular/services"),
    ("2141", "Faq H_1 (section library)"),
    ("2686", "Footer 1  (ACTIVE FOOTER)"),
]
for pid, name in TARGETS:
    p = post(c, pid)
    lines = []
    print("\n" + "#" * 92)
    print("# %s  [id %s]  modified %s" % (name, pid, p[8]))
    print("#" * 92)
    walk(elementor_data(c, pid), 0, lines)
    print("\n".join(lines))
