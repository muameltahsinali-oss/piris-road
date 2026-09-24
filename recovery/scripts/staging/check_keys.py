import json, re, sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = r"C:\Users\omlsa\Desktop\piris_road"
d = json.load(open(ROOT + r"\content\ar-dictionary.json", encoding="utf-8"))
files = sys.argv[1:] or [ROOT + r"\content\company.ts"]
for f in files:
    src = open(f, encoding="utf-8").read()
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//[^\n]*", "", src, flags=re.M)
    vals = []
    for m in re.finditer(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|t\(`([^`]*)`\)", src):
        v = (m.group(1) or m.group(2) or m.group(3) or "").replace("\\'", "'").replace('\\"', '"')
        if v.startswith(("/", "@", "http", "mailto")) or not re.search(r"[A-Za-z]{2}", v):
            continue
        if re.fullmatch(r"[a-z][A-Za-z0-9-]*", v) or re.search(r"[{}<>=]|\b(bg|text|flex|grid|rounded|px|py|mt|mb)-", v):
            continue
        vals.append(v)
    miss = [v for v in dict.fromkeys(vals) if v not in d]
    print("%s: %d strings, %d without Arabic" % (f.split("\\")[-1], len(set(vals)), len(miss)))
    for v in miss:
        print("   -", v[:110])
