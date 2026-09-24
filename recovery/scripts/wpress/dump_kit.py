import sys, os, json
sys.stdout.reconfigure(encoding="utf-8")
from wputil import conn, meta, php_unserialize, option

c = conn()

print("#" * 90)
print("# ELEMENTOR ACTIVE KIT (post 12) — global design tokens")
print("#" * 90)
raw = meta(c, "12", "_elementor_page_settings")
d = php_unserialize(raw) if raw else {}
INTEREST = (
    "system_colors", "custom_colors", "system_typography", "custom_typography",
    "container_width", "container_padding", "space_between_widgets", "viewport_",
    "body_", "h1_", "h2_", "h3_", "h4_", "button_", "link_", "default_generic_fonts",
    "page_title_selector", "activeItemIndex",
)
for k, v in sorted(d.items()):
    if any(k.startswith(p) or k == p for p in INTEREST) or "color" in k or "typography" in k or "font" in k:
        print("\n%s:" % k)
        print("   " + json.dumps(v, ensure_ascii=False, indent=2).replace("\n", "\n   ")[:2600])

print("\n\nALL KIT KEYS:", sorted(d.keys()))

print("\n\n" + "#" * 90)
print("# AVISTA THEME OPTIONS (Codestar framework)")
print("#" * 90)
for name in ("avista_options", "avista_opt", "cs_framework_options", "avista"):
    v = option(c, name)
    if v:
        print("\n=== option: %s (%d chars) ===" % (name, len(v)))
        try:
            d2 = php_unserialize(v)
            print(json.dumps(d2, ensure_ascii=False, indent=1, default=str)[:9000])
        except Exception as e:
            print("parse fail:", e)
            print(v[:3000])

print("\n\n=== candidate theme-option rows ===")
for n, in c.execute(
    "SELECT option_name FROM options WHERE option_name LIKE '%avista%' OR option_name LIKE '%_options%' "
    "OR option_name LIKE 'tx_%' OR option_name LIKE '%theme_mods%' ORDER BY option_name"
):
    print("  ", n)
