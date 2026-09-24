import re, sqlite3, os, sys
BASE = r"C:\Users\omlsa\AppData\Local\Temp\claude\C--Users-omlsa-Desktop-piris-road\3248b268-d131-47e8-9ac0-b182d7dbe886\scratchpad"
SQL = os.path.join(BASE, "site", "database.sql")
DB = os.path.join(BASE, "wp.sqlite")
if os.path.exists(DB):
    os.remove(DB)

WANT = {"posts", "postmeta", "options", "terms", "term_taxonomy", "term_relationships",
        "termmeta", "snippets", "users", "usermeta", "aioseo_posts", "e_submissions",
        "e_submissions_values", "woocommerce_attribute_taxonomies", "trp_dictionary_en_us_ar"}

# --- pass 1: DDL column names ---
cols = {}
ddl_re = re.compile(r"^CREATE TABLE `SERVMASK_PREFIX_([^`]+)`")
cur_t = None
with open(SQL, encoding="utf-8", errors="replace") as f:
    for line in f:
        m = ddl_re.match(line)
        if m:
            cur_t = m.group(1) if m.group(1) in WANT else None
            if cur_t:
                cols[cur_t] = []
            continue
        if cur_t:
            if line.startswith(")"):
                cur_t = None
                continue
            c = re.match(r"\s+`([^`]+)`\s", line)
            if c:
                cols[cur_t].append(c.group(1))

con = sqlite3.connect(DB)
con.execute("PRAGMA journal_mode=OFF")
con.execute("PRAGMA synchronous=OFF")
for t, cl in cols.items():
    con.execute('CREATE TABLE "%s" (%s)' % (t, ",".join('"%s"' % c for c in cl)))

UNESC = {
    "0": "\x00", "n": "\n", "r": "\r", "t": "\t",
    "Z": "\x1a", "b": "\b",
}


def parse_values(s):
    """s = content after 'VALUES (' up to the final ');' -- returns list of values"""
    out = []
    i = 0
    n = len(s)
    while i < n:
        while i < n and s[i] in " ,":
            i += 1
        if i >= n:
            break
        if s.startswith("NULL", i):
            out.append(None)
            i += 4
            continue
        if s[i] != "'":
            j = i
            while j < n and s[j] not in ",)":
                j += 1
            out.append(s[i:j].strip())
            i = j
            continue
        i += 1
        buf = []
        while i < n:
            c = s[i]
            if c == "\\":
                nxt = s[i + 1] if i + 1 < n else ""
                buf.append(UNESC.get(nxt, nxt))
                i += 2
            elif c == "'":
                i += 1
                break
            else:
                buf.append(c)
                i += 1
        out.append("".join(buf))
    return out


ins_re = re.compile(r"^INSERT INTO `SERVMASK_PREFIX_([^`]+)` VALUES \((.*)\);\s*$", re.S)
counts = {}
buf = None
with open(SQL, encoding="utf-8", errors="replace") as f:
    for line in f:
        if buf is None:
            if not line.startswith("INSERT INTO"):
                continue
            buf = line
        else:
            buf += line
        if not buf.rstrip().endswith(");"):
            continue
        m = ins_re.match(buf)
        buf = None
        if not m:
            continue
        t = m.group(1)
        if t not in cols:
            continue
        vals = parse_values(m.group(2))
        cl = cols[t]
        if len(vals) != len(cl):
            vals = (vals + [None] * len(cl))[: len(cl)]
        con.execute('INSERT INTO "%s" VALUES (%s)' % (t, ",".join("?" * len(cl))), vals)
        counts[t] = counts.get(t, 0) + 1
con.commit()
for t in sorted(cols):
    print("%7d  %s" % (counts.get(t, 0), t))
con.close()
