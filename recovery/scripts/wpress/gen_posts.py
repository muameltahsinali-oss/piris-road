"""Generate content/posts.ts straight from the recovered database so the blog
bodies are byte-accurate rather than hand-transcribed.

Gutenberg block comments are stripped; the inner HTML is kept as-is. Image URLs
are rewritten from the old WordPress uploads paths to the new /public paths.
"""
import sys, os, re, json, html
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wputil import conn, meta

c = conn()
OUT = r"C:\Users\omlsa\Desktop\piris_road\content\posts.ts"

# featured image + in-body image remapping (originals -> staged public paths)
IMG = {
    "2026/01/1.svg": "/blog/freight-mode.webp",
    "2026/01/image-1024x444.png": "/blog/skoda-logo-inline.webp",
    "2026/01/image.png": "/blog/skoda-logo-inline.webp",
    "2026/01/post3.jpg": "/blog/iraqi-market-taxes.jpg",
}
# featured images had Arabic filenames; matched by token
FEATURED_TOKEN = {
    "02_19_10": "/blog/skoda-logo-featured.webp",
    "02_29_51": "/blog/iraqi-market-taxes-featured.webp",
}
SITE = "https://aquamarine-gnat-712272.hostingersite.com"

SLUG_CAT = {}


def clean(body: str) -> str:
    # drop Gutenberg block delimiters
    body = re.sub(r"<!--\s*/?wp:[^>]*?-->", "", body)
    # rewrite uploads URLs
    def sub(m):
        rel = m.group(1)
        return IMG.get(rel, "/blog/placeholder.webp")
    body = re.sub(re.escape(SITE) + r"/wp-content/uploads/([^\"'\s)]+)", sub, body)
    body = re.sub(r"/wp-content/uploads/([^\"'\s)]+)", sub, body)
    # strip editor bookkeeping attributes that WP/ChatGPT paste left behind
    body = re.sub(r'\s+data-(start|end)="\d+"', "", body)
    # collapse blank lines
    body = re.sub(r"\n{3,}", "\n\n", body).strip()
    return body


rows = list(
    c.execute(
        "SELECT ID,post_title,post_name,post_content,post_excerpt,post_date,post_modified "
        "FROM posts WHERE post_type='post' AND post_status='publish' ORDER BY post_date DESC"
    )
)

posts = []
for pid, title, slug, body, excerpt, date, mod in rows:
    m = meta(c, pid)
    thumb = m.get("_thumbnail_id")
    guid = None
    if thumb:
        r = c.execute("SELECT guid FROM posts WHERE ID=?", (str(thumb),)).fetchone()
        if r:
            guid = r[0]
    img = ""
    if guid:
        rel = guid.split("/wp-content/uploads/")[-1]
        img = IMG.get(rel, "")
        if not img:
            for tok, path in FEATURED_TOKEN.items():
                if tok in rel:
                    img = path
                    break
    assert img, "unmapped featured image for post %s: %s" % (pid, guid)

    terms = list(
        c.execute(
            "SELECT tt.taxonomy,t.name FROM term_relationships tr "
            "JOIN term_taxonomy tt ON tt.term_taxonomy_id=tr.term_taxonomy_id "
            "JOIN terms t ON t.term_id=tt.term_id WHERE tr.object_id=?",
            (str(pid),),
        )
    )
    cats = [html.unescape(n) for tx, n in terms if tx == "category"]
    tags = [html.unescape(n) for tx, n in terms if tx == "post_tag"]

    # first paragraph as the card excerpt when post_excerpt is empty
    ex = (excerpt or "").strip()
    if not ex:
        p = re.search(r"<p[^>]*>(.*?)</p>", clean(body), re.S)
        ex = re.sub(r"<[^>]+>", "", p.group(1)).strip() if p else ""
        ex = re.sub(r"\s+", " ", ex)

    posts.append(
        {
            "slug": slug,
            "title": html.unescape(title),
            "date": date.split(" ")[0],
            "modified": mod.split(" ")[0],
            "category": cats[0] if cats else "Logistics Insights",
            "tags": tags,
            "image": img,
            "excerpt": ex,
            "body": clean(body),
        }
    )

ts = """/**
 * Blog posts, generated from the recovered WordPress database so the bodies are
 * byte-accurate. Source: wp_posts (post_type='post', 3 published posts).
 * Gutenberg block comments stripped; inner HTML preserved; uploads URLs
 * rewritten to the staged /public paths.
 *
 * RECOVERY-GAP: none of these post bodies were translated to Arabic on the
 * original site (the TranslatePress dictionary had no entries for them), so the
 * Arabic locale shows the English body — the same as the live site did.
 *
 * See RECOVERY_REPORT.md §4.8.
 */

export type Post = {
  slug: string;
  title: string;
  /** ISO date (YYYY-MM-DD) from post_date. */
  date: string;
  modified: string;
  category: string;
  tags: string[];
  image: string;
  excerpt: string;
  /** Raw HTML body. */
  body: string;
};

export const posts: Post[] = %s;

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

/** Categories that actually have posts, in the order WordPress listed them. */
export const postCategories = Array.from(new Set(posts.map((p) => p.category)));
""" % json.dumps(posts, ensure_ascii=False, indent=2)

with open(OUT, "w", encoding="utf-8") as f:
    f.write(ts)

print("wrote", OUT)
for p in posts:
    print("  %-62s %s  cat=%-32s body=%d chars img=%s" % (p["slug"][:62], p["date"], p["category"], len(p["body"]), p["image"]))
