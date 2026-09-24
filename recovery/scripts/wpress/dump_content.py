import sys, os, re, json
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn, meta, post, php_unserialize

c = conn()


def att_url(pid):
    if not pid:
        return None
    r = c.execute("SELECT guid,post_title FROM posts WHERE ID=? AND post_type='attachment'", (str(pid),)).fetchone()
    return r[0] if r else "(attachment %s not found)" % pid


for pt in ("services", "post", "teams"):
    print("\n" + "#" * 96)
    print("#  POST TYPE: %s" % pt)
    print("#" * 96)
    for pid, title, slug, content, excerpt, date, mod in c.execute(
        "SELECT ID,post_title,post_name,post_content,post_excerpt,post_date,post_modified FROM posts "
        "WHERE post_type=? AND post_status='publish' ORDER BY CAST(ID AS INT)",
        (pt,),
    ):
        m = meta(c, pid)
        print("\n" + "=" * 90)
        print("[%s] %s" % (pid, title))
        print("slug: /%s/   published %s   modified %s" % (slug, date, mod))
        print("=" * 90)
        thumb = m.get("_thumbnail_id")
        if thumb:
            print("FEATURED IMAGE: %s" % att_url(thumb))
        # taxonomies
        terms = list(
            c.execute(
                "SELECT tt.taxonomy,t.name FROM term_relationships tr "
                "JOIN term_taxonomy tt ON tt.term_taxonomy_id=tr.term_taxonomy_id "
                "JOIN terms t ON t.term_id=tt.term_id WHERE tr.object_id=?",
                (str(pid),),
            )
        )
        if terms:
            print("TERMS: %s" % ", ".join("%s=%s" % t for t in terms))
        interesting = {
            k: v
            for k, v in m.items()
            if not k.startswith("_el")
            and k not in ("_edit_lock", "_edit_last", "_thumbnail_id", "_wp_page_template")
            and not k.startswith("_wxr")
            and not k.startswith("_aioseo")
            and v
        }
        if interesting:
            print("META:")
            for k, v in sorted(interesting.items()):
                print("   %-26s %s" % (k, (v or "")[:300].replace("\n", " ")))
        if excerpt and excerpt.strip():
            print("EXCERPT:\n%s" % excerpt)
        print("CONTENT (%d chars):" % len(content or ""))
        print(content)

print("\n\n" + "#" * 96)
print("#  AIOSEO metadata for the real pages")
print("#" * 96)
cols = [r[1] for r in c.execute("PRAGMA table_info(aioseo_posts)")]
for pid in ("15", "23", "25", "29", "35", "3821", "3531", "3537", "3541", "3544", "3548", "3551", "3554", "3689", "3898", "3902"):
    r = c.execute("SELECT * FROM aioseo_posts WHERE post_id=?", (pid,)).fetchone()
    if not r:
        continue
    d = dict(zip(cols, r))
    p = post(c, pid)
    print("\n[%s] %s" % (pid, p[1] if p else "?"))
    for k in ("title", "description", "keyphrases", "og_title", "og_description", "canonical_url", "robots_noindex"):
        if d.get(k):
            print("   %-16s %s" % (k, str(d[k])[:260]))
