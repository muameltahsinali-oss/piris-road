"""Print theme CSS rules (non-media and media) whose selector mentions a prefix
and involves motion: transition / animation / transform / :hover / active states."""
import re, sys

sys.stdout.reconfigure(encoding="utf-8")
CSS = r"C:\Users\omlsa\AppData\Local\Temp\claude\C--Users-omlsa-Desktop-piris-road\3248b268-d131-47e8-9ac0-b182d7dbe886\scratchpad\site\themes\avista\assets\css\avista-core.css"
css = open(CSS, encoding="utf-8", errors="replace").read()
css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
css = re.sub(r"-webkit-[a-z-]+\s*:[^;]+;|-ms-[a-z-]+\s*:[^;]+;|-moz-[a-z-]+\s*:[^;]+;", "", css)

prefixes = sys.argv[1:]
MOTION = re.compile(r"transition|animation|transform|opacity|clip-path|:hover|\.active|is_active|\.show|scale|visibility", re.I)

for m in re.finditer(r"([^{}@]+)\{([^{}]*)\}", css):
    sel, body = m.group(1).strip(), m.group(2).strip()
    if not any(p in sel for p in prefixes):
        continue
    if not (MOTION.search(sel) or MOTION.search(body)):
        continue
    body = re.sub(r"\s+", " ", body)
    print("%s\n    { %s }" % (re.sub(r"\s+", " ", sel)[:200], body[:420]))
