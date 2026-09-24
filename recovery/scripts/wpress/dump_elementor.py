"""Walk Elementor _elementor_data trees and emit a readable outline of every
section/widget plus its text content and media references."""
import sys, os, json, re
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn, meta, post, elementor_data

c = conn()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "recovered")
os.makedirs(OUT, exist_ok=True)

TEXTKEYS = re.compile(
    r"(title|text|desc|description|content|label|caption|name|heading|sub_title|subtitle|"
    r"before|after|prefix|suffix|number|count|placeholder|button|quote|word|tag|excerpt|"
    r"address|phone|email|time|value|item_)",
    re.I,
)
SKIPKEYS = re.compile(
    r"^(_|__globals__$|__dynamic__$)|(color|size|width|height|margin|padding|gap|radius|"
    r"typography|font|align|shadow|border|background|opacity|position|animation|delay|"
    r"transform|filter|zindex|z_index|flex|order|blend|space|offset|rotate|direction|"
    r"transition|duration|css|_inline)",
    re.I,
)


def is_url(v):
    return isinstance(v, str) and re.search(r"https?://|/wp-content/", v)


def collect(settings, prefix=""):
    """Yield (path, kind, value) for text + media inside a settings dict."""
    out = []

    def walk(v, path):
        if isinstance(v, dict):
            # image / media object
            if "url" in v and isinstance(v.get("url"), str) and v["url"]:
                out.append((path, "MEDIA", v["url"] + (" (id=%s)" % v["id"] if v.get("id") else "")))
                return
            for k, vv in v.items():
                if SKIPKEYS.search(str(k)) and not TEXTKEYS.search(str(k)):
                    continue
                walk(vv, path + "." + str(k) if path else str(k))
        elif isinstance(v, list):
            for i, vv in enumerate(v):
                walk(vv, "%s[%d]" % (path, i))
        elif isinstance(v, str):
            s = v.strip()
            if not s:
                return
            leaf = path.split(".")[-1].split("[")[0]
            if is_url(s):
                out.append((path, "URL", s))
            elif TEXTKEYS.search(leaf) and not SKIPKEYS.search(leaf):
                if len(s) > 1 and not re.fullmatch(r"[\d\s.,%#-]*", s):
                    out.append((path, "TEXT", s))
            elif leaf in ("shortcode", "html", "editor", "selected_icon", "icon"):
                out.append((path, "RAW", s))

    walk(settings, prefix)
    return out


def walk_tree(nodes, depth, lines):
    for n in nodes or []:
        et = n.get("elType", "?")
        wt = n.get("widgetType", "")
        st = n.get("settings", {}) or {}
        if not isinstance(st, dict):
            st = {}
        label = wt if et == "widget" else et
        extra = []
        for k in ("_element_id", "css_classes", "_css_classes", "view", "style", "layout", "design_style"):
            if st.get(k):
                extra.append("%s=%s" % (k, st[k]))
        # container/section direction hints
        if st.get("flex_direction"):
            extra.append("dir=%s" % st["flex_direction"])
        lines.append(
            "%s%s [%s]%s" % ("  " * depth, label, n.get("id", ""), ("  {" + ", ".join(extra) + "}") if extra else "")
        )
        for path, kind, val in collect(st):
            v = val if len(val) < 400 else val[:400] + " …"
            lines.append("%s  · %-7s %-34s %s" % ("  " * depth, kind, path[:34], v.replace("\n", " ")))
        walk_tree(n.get("elements"), depth + 1, lines)


TARGETS = [
    ("15", "Home (FRONT PAGE)"),
    ("23", "About"),
    ("25", "Our Services"),
    ("29", "Contact us"),
    ("3821", "Get a Quote"),
    ("2582", "Header 1 (ACTIVE HEADER)"),
    ("2686", "Footer 1 (ACTIVE FOOTER)"),
    ("3510", "Single service template"),
    ("3513", "Single Page tmpl (services singular)"),
    ("3888", "Loop Item"),
    ("2141", "Faq H_1 section"),
]

for pid, name in TARGETS:
    p = post(c, pid)
    d = elementor_data(c, pid)
    lines = []
    lines.append("=" * 100)
    lines.append("PAGE %s — %s   (type=%s status=%s modified=%s)" % (pid, name, p[3], p[4], p[8]))
    lines.append("=" * 100)
    if not d:
        lines.append("  (no _elementor_data)")
    else:
        walk_tree(d, 0, lines)
    txt = "\n".join(lines)
    with open(os.path.join(OUT, "elementor_%s.txt" % pid), "w", encoding="utf-8") as f:
        f.write(txt)
    print(txt)
    print()
