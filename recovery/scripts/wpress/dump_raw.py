"""Dump raw html / shortcode / text-editor widget payloads from Elementor data."""
import sys, os, json
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn, post, elementor_data

c = conn()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "recovered")

IDS = ["15", "23", "25", "29", "3821", "2582", "2686", "3510", "3513", "2141", "3888"]
KEYS = ("html", "shortcode", "editor")

for pid in IDS:
    p = post(c, pid)
    found = []

    def walk(nodes):
        for n in nodes or []:
            st = n.get("settings") or {}
            if isinstance(st, dict):
                wt = n.get("widgetType") or n.get("elType")
                for k in KEYS:
                    v = st.get(k)
                    if isinstance(v, str) and v.strip():
                        found.append((wt, n.get("id"), k, v))
            walk(n.get("elements"))

    walk(elementor_data(c, pid))
    if not found:
        continue
    print("\n" + "=" * 96)
    print("POST %s — %s (%s)" % (pid, p[1], p[3]))
    print("=" * 96)
    for wt, eid, k, v in found:
        print("\n--- widget %s [%s] key=%s  (%d chars) ---" % (wt, eid, k, len(v)))
        print(v)
        fn = os.path.join(OUT, "raw_%s_%s_%s.html" % (pid, eid, k))
        with open(fn, "w", encoding="utf-8") as f:
            f.write(v)
