import sys, os, json, re
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn

c = conn()
OUT = r"C:\Users\omlsa\Desktop\piris_road\recovery"
os.makedirs(OUT, exist_ok=True)

rows = list(c.execute("SELECT original,translated,status FROM trp_dictionary_en_us_ar ORDER BY CAST(id AS INT)"))
done = {o: t for o, t, s in rows if (t or "").strip()}
todo = sorted({o for o, t, s in rows if not (t or "").strip()})

with open(os.path.join(OUT, "ar_dictionary.json"), "w", encoding="utf-8") as f:
    json.dump(done, f, ensure_ascii=False, indent=1, sort_keys=True)
with open(os.path.join(OUT, "ar_untranslated.json"), "w", encoding="utf-8") as f:
    json.dump(todo, f, ensure_ascii=False, indent=1)

print("translated pairs exported:", len(done))
print("untranslated originals  :", len(todo))
print("\n=== untranslated strings longer than 3 chars (the real gaps) ===")
real = [s for s in todo if len(s.strip()) > 3 and not re.fullmatch(r"[\W\d_]+", s.strip())]
for s in real:
    print("  -", s[:120].replace("\n", " "))
print("\nreal untranslated count:", len(real))
