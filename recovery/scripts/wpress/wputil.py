"""Helpers: PHP unserialize + sqlite access for the recovered WP database."""
import sqlite3, os, json, sys

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, "wp.sqlite")


def conn():
    return sqlite3.connect(DB)


# ---------- PHP unserialize ----------
class PhpParseError(Exception):
    pass


def php_unserialize(s, pos=0):
    val, pos = _parse(s, pos)
    return val


def _parse(s, i):
    t = s[i]
    if t == "N":
        return None, i + 2
    if t == "b":
        j = s.index(";", i)
        return s[i + 2 : j] == "1", j + 1
    if t == "i":
        j = s.index(";", i)
        return int(s[i + 2 : j]), j + 1
    if t == "d":
        j = s.index(";", i)
        raw = s[i + 2 : j]
        try:
            return float(raw), j + 1
        except ValueError:
            return raw, j + 1
    if t == "s":
        j = s.index(":", i + 2)
        n = int(s[i + 2 : j])
        start = j + 2  # skip :"
        # n is BYTE length in PHP; recover by encoding
        b = s[start:].encode("utf-8", "surrogatepass")
        chunk = b[:n].decode("utf-8", "replace")
        # advance by character count of chunk
        end = start + len(chunk)
        return chunk, end + 2  # skip ";
    if t == "a":
        j = s.index(":", i + 2)
        n = int(s[i + 2 : j])
        i = j + 2  # skip :{
        out = {}
        for _ in range(n):
            k, i = _parse(s, i)
            v, i = _parse(s, i)
            out[k] = v
        return out, i + 1  # skip }
    if t == "O":
        j = s.index(":", i + 2)
        nlen = int(s[i + 2 : j])
        i = j + 2 + nlen + 2
        j = s.index(":", i)
        n = int(s[i:j])
        i = j + 2
        out = {}
        for _ in range(n):
            k, i = _parse(s, i)
            v, i = _parse(s, i)
            out[k] = v
        return out, i + 1
    raise PhpParseError("unknown token %r at %d" % (t, i))


# ---------- db shortcuts ----------
def meta(c, pid, key=None):
    if key:
        r = c.execute(
            "SELECT meta_value FROM postmeta WHERE post_id=? AND meta_key=?", (str(pid), key)
        ).fetchone()
        return r[0] if r else None
    return {
        k: v for k, v in c.execute("SELECT meta_key,meta_value FROM postmeta WHERE post_id=?", (str(pid),))
    }


def option(c, name):
    r = c.execute("SELECT option_value FROM options WHERE option_name=?", (name,)).fetchone()
    return r[0] if r else None


def post(c, pid):
    return c.execute(
        "SELECT ID,post_title,post_name,post_type,post_status,post_content,post_excerpt,post_date,post_modified,post_parent FROM posts WHERE ID=?",
        (str(pid),),
    ).fetchone()


def elementor_data(c, pid):
    raw = meta(c, pid, "_elementor_data")
    return json.loads(raw) if raw else None
