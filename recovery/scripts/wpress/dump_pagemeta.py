import sys, json
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn, meta, post, php_unserialize

c = conn()
HDR = {r[0]: r[1] for r in c.execute("SELECT ID,post_title FROM posts WHERE post_type IN ('tf-header','tf-footer')")}

print("=== tx_page_meta per real page (header/footer/breadcrumb overrides) ===\n")
for pid in ("15", "23", "25", "29", "35", "3821", "3531", "3537", "3541", "3544", "3548", "3551", "3554", "3689"):
    raw = meta(c, pid, "tx_page_meta")
    p = post(c, pid)
    if not raw:
        print("[%s] %s -> (no tx_page_meta; uses global header 2582 / footer 2686)" % (pid, p[1]))
        continue
    d = php_unserialize(raw)
    out = {}
    for k, v in d.items():
        if isinstance(v, dict):
            u = v.get("url")
            if u:
                out[k] = u
        elif v not in ("", None, "0"):
            out[k] = v
    hs = d.get("meta_header_style")
    note = ""
    if hs:
        note = "  -> header override: %s (%s)" % (hs, HDR.get(str(hs), "?"))
    print("[%s] %-16s %s%s" % (pid, p[1][:16], json.dumps(out, ensure_ascii=False), note))

print("\n\n=== ACF field group: what fields exist on `services` ===")
for pid, title, content, excerpt, name in c.execute(
    "SELECT ID,post_title,post_content,post_excerpt,post_name FROM posts WHERE post_type='acf-field-group'"
):
    print("GROUP: %s (%s)" % (title, name))
    print("  location/rules:", (content or "")[:600])
for pid, title, content, excerpt, name, parent in c.execute(
    "SELECT ID,post_title,post_content,post_excerpt,post_name,post_parent FROM posts WHERE post_type='acf-field' ORDER BY CAST(menu_order AS INT)"
):
    try:
        cfg = php_unserialize(content)
    except Exception:
        cfg = {}
    print("  FIELD %-14s name=%-12s type=%-10s label=%s" % (name, excerpt, cfg.get("type"), title))
