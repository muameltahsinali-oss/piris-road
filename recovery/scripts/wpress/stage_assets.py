"""Copy the recovered originals into public/ under clean, readable names.
Mapping is explicit: original uploads path -> public path."""
import os, shutil, json

SRC = r"C:\Users\omlsa\Desktop\piris_road\recovery\assets"
PUB = r"C:\Users\omlsa\Desktop\piris_road\public"

MAP = {
    # logos
    "2025/12/logo-icon-svg-file.svg": "logos/logo-icon.svg",
    "2025/12/black-font-svg-file.svg": "logos/logo-dark.svg",
    "2025/11/logo-png-file-copy-scaled.png": "logos/logo-header.png",
    "2025/11/logo-png-file-scaled.png": "logos/logo-header-alt.png",
    "2026/01/white-font-transparency-png-backgrounduse-for-black-background-scaled.png": "logos/logo-white.png",
    "2026/01/Untitled-design-11.svg": "logos/mark.svg",
    # hero
    "2026/03/Untitled-design-223-scaled-1.webp": "hero/container.webp",
    "2026/01/Untitled-design-223-scaled.png": "hero/container-large.png",
    "2026/01/Untitled-design-224-scaled.webp": "misc/breadcrumb-bg.webp",
    # service featured images (7)
    "2026/01/Sea-Freight-Solutions-FCL-LCL-Shipping.svg": "services/sea-freight.svg",
    "2026/01/yfftghv-1.svg": "services/air-freight.svg",
    "2026/01/effas.svg": "services/road-transport.svg",
    "2026/01/dwfwgre.svg": "services/cold-chain.svg",
    "2026/01/wfegrthyj.svg": "services/warehousing.svg",
    "2026/01/qawees.svg": "services/customs-clearance.svg",
    "2026/01/ihuf.svg": "services/project-cargo.svg",
    # service card photos
    "2026/03/1-sea-freight.png": "services/card-sea-freight.png",
    "2026/03/2-cross-borader.png": "services/card-road-transport.png",
    "2026/03/3-air-cargo.png": "services/card-air-freight.png",
    "2026/03/4-reefer.png": "services/card-cold-chain.png",
    # industries (6)
    "2026/01/4-1.svg": "industries/oil-and-gas.svg",
    "2026/01/6.svg": "industries/technology-telecom.svg",
    "2026/01/2-1.svg": "industries/government-public-sector.svg",
    "2026/01/3-1.svg": "industries/defense-secure-transport.svg",
    "2026/01/Untitlhl.ed-design.png": "industries/commercial-industrial.png",
    "2026/01/5-1.svg": "industries/medical-pharmaceutical.svg",
    # certifications
    "2026/01/927_iso9001_logo.jpeg": "certifications/iso-9001.jpeg",
    "2026/01/What-is-an-ISO-14001-Environmental-Management-System.webp": "certifications/iso-14001.webp",
    "2026/01/What-is-an-ISO-45001-Occupational-Health-and-Safety-Management-System.webp": "certifications/iso-45001.webp",
    "2026/01/e2d.png": "certifications/extra-badge.png",
    # partners
    "2026/01/1.png": "partners/partner-1.png",
    "2026/01/2.png": "partners/partner-2.png",
    "2026/01/3.png": "partners/partner-3.png",
    "2026/01/4.png": "partners/partner-4.png",
    # header offcanvas gallery
    "2026/03/right-pic.png": "misc/gallery-1.png",
    "2026/03/left-pic.png": "misc/gallery-2.png",
    "2026/03/row-1-column-1.png": "misc/row-1.png",
    "2026/03/row-2-column-1.png": "misc/row-2.png",
    "2026/03/row-3-column-1.png": "misc/row-3.png",
    # blog featured
    "2026/01/1.svg": "blog/freight-mode.svg",
    "2026/01/image-1024x444.png": "blog/skoda-logo.png",
    "2026/01/post3.jpg": "blog/iraqi-market-taxes.jpg",
    # font
    "2026/02/Aeonik-Regular.ttf": "fonts/Aeonik-Regular.ttf",
}

ok, miss = [], []
for src_rel, dst_rel in MAP.items():
    s = os.path.join(SRC, src_rel.replace("/", os.sep))
    d = os.path.join(PUB, dst_rel.replace("/", os.sep))
    if os.path.exists(s):
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(s, d)
        ok.append((dst_rel, os.path.getsize(d)))
    else:
        miss.append(src_rel)

print("staged %d files" % len(ok))
for rel, sz in sorted(ok, key=lambda x: -x[1])[:12]:
    print("   %8.2f MB  %s" % (sz / 1048576, rel))
if miss:
    print("\nNOT FOUND in recovery/assets:")
    for m in miss:
        print("   ", m)
with open(os.path.join(PUB, "..", "recovery", "asset_map.json"), "w", encoding="utf-8") as f:
    json.dump(MAP, f, indent=1)
