"""For each staging page, list which animation hooks appear in which section."""
import sys, re, os, glob
from collections import OrderedDict
from lxml import html as LH

sys.stdout.reconfigure(encoding="utf-8")
ST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "staging")

HOOKS = [
    "wa_title_spilt_1", "wa_title_split_2", "wa_split_up", "wa-split-up", "wa-split-up2", "wa_btn_split_1", "menu_1_split",
    "wa_magnetic_btn_1", "wa_magnetic_1_trigger", "wa_magnetic_1_elm", "wa_tilt", "wa_tilt_elm", "wa_parallax_bg", "wa_parallax_img",
    "wa_add_class", "wow", "wa_sticky_header", "wa_placeholder", "wa_accordion_item", "wa_marquee_left", "wa_marquee_right",
    "wa_marquee_left_nopause", "wa_marquee_right_nopause", "wa_marquee_down_top", "odometer", "counter",
    "partner1_trigger", "p1_pin_elm", "p1_pin_elm_trigger", "p1_ani_elm", "cta1_trigger", "portfolio1_pin_elm",
    "portfolio1_pin_elm_trigger", "t1_ani_trigger", "as-team-1-member-ani", "as_t2_item1", "as-pr-btn-2", "wa_backToTop",
]
IDS = ["wa_liquid_img", "wa_cursor_noise"]

for f in sorted(glob.glob(os.path.join(ST, "*.html"))):
    name = os.path.basename(f)
    if name.endswith("_ar.html") or not name.startswith(("home", "about", "our-services", "contact-us", "blog.", "services_sea", "elementor-page", "iraqs")):
        continue
    doc = LH.parse(f).getroot()
    print("\n########", name)
    secs = doc.xpath("//header | //section[contains(@class,'-area')] | //footer")
    for s in secs:
        found = OrderedDict()
        for el in s.iter():
            if not isinstance(el.tag, str):
                continue
            cls = (el.get("class") or "").split()
            for h in HOOKS:
                if h in cls:
                    extra = []
                    for a in ("data-wow-delay", "data-wow-duration", "data-speed", "data-delay", "data-split-delay", "data-count"):
                        if el.get(a):
                            extra.append("%s=%s" % (a, el.get(a)))
                    anims = [c for c in cls if c in ("fadeInUp", "fadeInLeft", "fadeInRight", "fadeInDown", "zoomIn", "fadeIn", "slideInUp", "bounceIn", "flipInX")]
                    key = h + (("(" + ",".join(anims) + ")") if anims else "")
                    found.setdefault(key, []).append(" ".join(extra))
            if el.get("id") in IDS:
                found.setdefault("#" + el.get("id"), []).append(" ".join("%s=%s" % kv for kv in el.attrib.items() if kv[0].startswith("data")))
        if found:
            label = (s.get("class") or s.tag).split()[0]
            print("  [%s]" % label)
            for k, v in found.items():
                vv = sorted(set(x for x in v if x))
                print("     %-42s x%-3d %s" % (k, len(v), "; ".join(vv)[:120]))
