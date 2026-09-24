"""Copy staging-site assets into public/ (WebP where it helps) and keep the
originals under recovery/staging-assets/ as the audit trail."""
import os, shutil
from PIL import Image

SRC = r"C:\Users\omlsa\AppData\Local\Temp\claude\C--Users-omlsa-Desktop-piris-road\3d0fbd94-5fe2-44a5-890a-2b68e276ca49\scratchpad\staging\assets"
PUB = r"C:\Users\omlsa\Desktop\piris_road\public"
REC = r"C:\Users\omlsa\Desktop\piris_road\recovery\staging-assets"

# source -> (dest, max_width or None to copy as-is)
MAP = {
    "2026/05/Screenshot-2026-05-30-at-2.57.55-PM.webp": ("industries/oil-and-gas.webp", 800),
    "2026/05/tech.webp": ("industries/technology-telecom.webp", 800),
    "2026/05/gov.webp": ("industries/government-public-sector.webp", 800),
    "2026/05/military.webp": ("industries/defense-secure-transport.webp", 800),
    "2026/05/commerical.webp": ("industries/commercial-industrial.webp", 800),
    "2026/05/pharma.webp": ("industries/medical-pharmaceutical.webp", 800),
    "2026/05/1-sea-freight.png": ("services/card-sea-freight.webp", 1000),
    "2026/05/2-cross-borader.png": ("services/card-road-transport.webp", 1000),
    "2026/05/3-air-cargo.png": ("services/card-air-freight.webp", 1000),
    "2026/05/4-reefer.png": ("services/card-cold-chain.webp", 1000),
    "2026/05/1.png": ("features/why.webp", 900),
    "2026/05/2.png": ("features/certified.webp", 900),
    "2026/05/left-pic.png": ("misc/cta-left.webp", 900),
    "2026/05/right-pic.png": ("misc/cta-right.webp", 900),
    "2026/05/Our-Philosophy.png": ("misc/our-philosophy.webp", 1000),
    "2026/05/3-1.jpg": ("blog/logistics-new-era.webp", 1200),
    "2025/10/cta1-hand-1.webp": ("decor/hand-1.webp", None),
    "2025/10/cta1-hand-2.webp": ("decor/hand-2.webp", None),
    "2025/10/faqs1-clr.webp": ("decor/faq-glow.webp", None),
    "2025/10/faqs1-illus-1.webp": ("decor/laurel-lg-left.webp", None),
    "2025/10/faqs1-illus-2.webp": ("decor/laurel-lg-right.webp", None),
    "2025/10/a1-shape-1.webp": ("decor/laurel-left.webp", None),
    "2025/10/a1-shape-2.webp": ("decor/laurel-right.webp", None),
    "2025/10/p1-arrow.webp": ("decor/arrow.webp", None),
    "2025/10/p1-cloud.webp": ("decor/cloud-1.webp", None),
    "2025/10/p1-cloud-2.webp": ("decor/cloud-2.webp", None),
    "2025/10/p1-card-shape.webp": ("decor/card-grid-light.webp", None),
    "2025/10/s1-card-shape-1.webp": ("decor/card-grid-dark.webp", None),
    "2025/10/h1-bg-noise-1.gif": ("decor/noise.gif", None),
    "2025/11/a3-icon-1.webp": ("decor/icon-cube.webp", None),
    "2025/11/a3-icon-2.webp": ("decor/icon-cubes.webp", None),
    "2025/11/a3-illus-3.webp": ("decor/ceo-wave.webp", None),
    "2025/11/a4-bg-shape.webp": ("decor/dots.webp", None),
    "2025/11/p2-icon-1.svg": ("decor/feature-icon-1.svg", None),
    "2025/11/p2-icon-2.svg": ("decor/feature-icon-2.svg", None),
    "2025/11/p2-icon-4.svg": ("decor/feature-icon-4.svg", None),
    "2025/12/Untitled-design-213.png": ("logos/logo-3d.webp", 500),
    "2026/01/Untitled-design-11.png": ("decor/badge-ring.png", None),
    "2025/12/Untitled-design-220-scaled.png": ("hero/container-3d.webp", 1200),
    "2026/01/Untitled-design-8-scaled.png": ("blog/containers-bg.webp", 1200),
    "2026/01/Untitled-design-12.png": ("misc/proven-1.webp", 900),
    "2026/01/6.png": ("misc/proven-2.webp", 900),
    "2026/01/7.png": ("misc/proven-3.webp", 900),
    "2026/04/mohamd.png": ("testimonials/mohammad-dawd.png", None),
    "2026/04/ali.png": ("testimonials/ali-sulaiman.png", None),
    "2026/04/assad-1.png": ("testimonials/reviewer-3.png", None),
    "2026/01/blog-pic.png": ("blog/asycuda.webp", 1400),
    "2026/01/blog-picture.png": ("blog/iraqi-market-taxes.webp", 1400),
}

total = 0
for src, (dst, maxw) in MAP.items():
    s = os.path.join(SRC, src.replace("/", os.sep))
    d = os.path.join(PUB, dst.replace("/", os.sep))
    r = os.path.join(REC, src.replace("/", os.sep))
    os.makedirs(os.path.dirname(d), exist_ok=True)
    os.makedirs(os.path.dirname(r), exist_ok=True)
    shutil.copy2(s, r)
    if maxw is None:
        shutil.copy2(s, d)
    else:
        im = Image.open(s)
        if im.mode == "P":
            im = im.convert("RGBA")
        if im.width > maxw:
            im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
        im.save(d, "WEBP", quality=82, method=6)
    total += os.path.getsize(d)
    print("%-44s %6d KB" % (dst, os.path.getsize(d) // 1024))
print("total %.1f MB" % (total / 1048576))
