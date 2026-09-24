"""Several 'SVG' assets are just a base64-embedded JPEG/PNG in an SVG wrapper
(3-5 MB each). Extract the real raster and re-encode as WebP so the site ships
reasonable images. Originals stay untouched in recovery/assets/."""
import os, re, base64, io, glob
from PIL import Image

PUB = r"C:\Users\omlsa\Desktop\piris_road\public"
MAXW = 1600
rx = re.compile(r'data:image/(png|jpeg|jpg);base64,([A-Za-z0-9+/=\s]+)')

targets = sorted(glob.glob(os.path.join(PUB, "services", "*.svg"))) + \
          sorted(glob.glob(os.path.join(PUB, "industries", "*.svg"))) + \
          sorted(glob.glob(os.path.join(PUB, "blog", "*.svg")))

total_before = total_after = 0
for fp in targets:
    raw = open(fp, encoding="utf-8", errors="replace").read()
    m = rx.search(raw)
    before = os.path.getsize(fp)
    if not m:
        print("SKIP (real vector): %-46s %8.2f MB" % (os.path.basename(fp), before / 1048576))
        continue
    data = base64.b64decode(re.sub(r"\s+", "", m.group(2)))
    im = Image.open(io.BytesIO(data))
    if im.mode in ("P", "LA"):
        im = im.convert("RGBA")
    # flatten transparency onto white only for JPEG-sourced art; keep alpha for PNG
    has_alpha = im.mode in ("RGBA", "LA")
    if im.width > MAXW:
        h = round(im.height * MAXW / im.width)
        im = im.resize((MAXW, h), Image.LANCZOS)
    out = os.path.splitext(fp)[0] + ".webp"
    im.save(out, "WEBP", quality=82, method=6, lossless=False)
    after = os.path.getsize(out)
    os.remove(fp)
    total_before += before
    total_after += after
    print("%-46s %8.2f MB -> %7.2f MB  (%dx%d%s)" % (
        os.path.basename(out), before / 1048576, after / 1048576,
        im.width, im.height, ", alpha" if has_alpha else ""))

print("\ntotal: %.1f MB -> %.1f MB (saved %.1f MB)" % (
    total_before / 1048576, total_after / 1048576, (total_before - total_after) / 1048576))
