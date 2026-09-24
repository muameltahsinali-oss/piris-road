import sys, re
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn

PAT = re.compile(
    r"eval\s*\(|base64_decode|gzinflate|str_rot13|shell_exec|passthru|popen|"
    r"system\s*\(|assert\s*\(|create_function|"
    r"document\.write\s*\(\s*unescape|String\.fromCharCode|wp-vcd|coinhive|"
    r"<iframe[^>]{0,120}(display\s*:\s*none|width\s*=\s*[\"']?0)|FilesMan",
    re.I,
)
c = conn()
n = 0
for tbl, idc, valc in (("posts", "ID", "post_content"), ("options", "option_name", "option_value"), ("postmeta", "post_id", "meta_value")):
    for i, v in c.execute("SELECT %s,%s FROM %s" % (idc, valc, tbl)):
        if not v:
            continue
        s = str(v)
        for m in PAT.finditer(s):
            n += 1
            a = max(0, m.start() - 100)
            ctx = s[a : m.end() + 100]
            ctx = re.sub(r"[\r\n\t]+", " ", ctx)
            print("%d. [%s id=%s] match=%r" % (n, tbl, i, m.group(0)))
            print("     ...%s..." % ctx)
print("\nTOTAL:", n)
