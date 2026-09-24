"""Re-encode the remaining oversized PNG/JPEG assets to WebP (alpha preserved).
Skips small files and anything already WebP. Originals kept in recovery/assets/."""
import os, glob
from PIL import Image

PUB = r"C:\Users\omlsa\Desktop\piris_road\public"
MAXW = 1600
MIN_BYTES = 120 * 1024  # leave small files alone

before = after = 0
for fp in glob.glob(os.path.join(PUB, "**", "*.*"), recursive=True):
    ext = os.path.splitext(fp)[1].lower()
    if ext not in (".png", ".jpg", ".jpeg"):
        continue
    b = os.path.getsize(fp)
    if b < MIN_BYTES:
        print("keep  %-40s %7.0f KB" % (os.path.relpath(fp, PUB), b / 1024))
        continue
    im = Image.open(fp)
    if im.mode == "P":
        im = im.convert("RGBA")
    if im.width > MAXW:
        im = im.resize((MAXW, round(im.height * MAXW / im.width)), Image.LANCZOS)
    out = os.path.splitext(fp)[0] + ".webp"
    im.save(out, "WEBP", quality=84, method=6)
    a = os.path.getsize(out)
    os.remove(fp)
    before += b
    after += a
    print("conv  %-40s %7.0f KB -> %6.0f KB  (%dx%d, %s)" % (
        os.path.relpath(out, PUB), b / 1024, a / 1024, im.width, im.height, im.mode))

print("\nconverted: %.1f MB -> %.1f MB (saved %.1f MB)" % (
    before / 1048576, after / 1048576, (before - after) / 1048576))
