import sys, os
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn, meta, php_unserialize, option, post

c = conn()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "recovered")
os.makedirs(OUT, exist_ok=True)

print("########## ELEMENTOR PAGE-LEVEL CUSTOM CSS ##########")
for pid, in c.execute(
    "SELECT DISTINCT post_id FROM postmeta WHERE meta_key='_elementor_page_settings'"
):
    raw = meta(c, pid, "_elementor_page_settings")
    try:
        d = php_unserialize(raw)
    except Exception as e:
        print("  !! %s parse fail %s" % (pid, e))
        continue
    if isinstance(d, dict) and d.get("custom_css"):
        p = post(c, pid)
        print("\n===== post %s : %s (%s) =====" % (pid, p[1], p[3]))
        print(d["custom_css"])
        with open(os.path.join(OUT, "elementor_custom_css_%s.css" % pid), "w", encoding="utf-8") as f:
            f.write(d["custom_css"])

print("\n\n########## custom_css POSTS (Appearance > Additional CSS) ##########")
for pid, title, content in c.execute(
    "SELECT ID,post_title,post_content FROM posts WHERE post_type='custom_css'"
):
    print("\n===== %s : %s  (%d chars) =====" % (pid, title, len(content or "")))
    print(content)
    with open(os.path.join(OUT, "additional_css_%s.css" % title), "w", encoding="utf-8") as f:
        f.write(content or "")
