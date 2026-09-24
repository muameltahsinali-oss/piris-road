import sys, re, os
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn

PAT = re.compile(
    r"eval\s*\(|base64_decode|gzinflate|str_rot13|shell_exec|passthru|popen|"
    r"system\s*\(|assert\s*\(|create_function|preg_replace\s*\(\s*[\"'][^\"']*/e|"
    r"document\.write\s*\(\s*unescape|String\.fromCharCode|wp-vcd|coinhive|"
    r"<iframe[^>]{0,120}(display\s*:\s*none|width\s*=\s*[\"']?0)|"
    r"FilesMan|WSO\s|c99sh|r57shell|/\*\s*wp-?vcd",
    re.I,
)

c = conn()
tot = 0
print("=== DB scan: posts / options / postmeta ===")
for tbl, idc, valc in (("posts", "ID", "post_content"), ("options", "option_name", "option_value"), ("postmeta", "post_id", "meta_value")):
    for i, v in c.execute("SELECT %s,%s FROM %s" % (idc, valc, tbl)):
        if not v:
            continue
        s = str(v)
        for m in PAT.finditer(s):
            tot += 1
            if tot <= 50:
                a = max(0, m.start() - 80)
                print("[%s %s] ...%s..." % (tbl, i, s[a : m.end() + 80].replace("\n", " ")))
print("\nDB total matches:", tot)

print("\n=== FILE scan: theme + mu-plugins + avista-core + code-snippets ===")
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")
hits = 0
for sub in ("themes", "mu-plugins", "plugins", "litespeed", "index.php"):
    root = os.path.join(BASE, sub)
    if os.path.isfile(root):
        files = [root]
    else:
        files = [os.path.join(r, f) for r, _, fs in os.walk(root) for f in fs]
    for fp in files:
        if not fp.lower().endswith((".php", ".js", ".html", ".htaccess", ".css")):
            continue
        try:
            t = open(fp, encoding="utf-8", errors="replace").read()
        except Exception:
            continue
        for m in PAT.finditer(t):
            hits += 1
            if hits <= 60:
                rel = os.path.relpath(fp, BASE)
                a = max(0, m.start() - 60)
                print("[%s] ...%s..." % (rel, t[a : m.end() + 60].replace("\n", " ")[:200]))
print("\nFile total matches:", hits)

print("\n=== users table ===")
cols = [r[1] for r in c.execute("PRAGMA table_info(users)")]
for r in c.execute("SELECT * FROM users"):
    d = dict(zip(cols, r))
    print({k: d.get(k) for k in ("ID", "user_login", "user_email", "user_registered", "user_status", "display_name")})
print("\n=== usermeta roles/caps ===")
for k, v in c.execute("SELECT meta_key,meta_value FROM usermeta WHERE meta_key LIKE '%capabilities%' OR meta_key LIKE '%level%'"):
    print("  %-30s %s" % (k, v))
