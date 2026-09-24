import sqlite3, sys
c = sqlite3.connect(r"C:\Users\omlsa\AppData\Local\Temp\claude\C--Users-omlsa-Desktop-piris-road\3248b268-d131-47e8-9ac0-b182d7dbe886\scratchpad\wp.sqlite")


def meta(pid):
    d = {}
    for k, v in c.execute("SELECT meta_key,meta_value FROM postmeta WHERE post_id=?", (pid,)):
        d[k] = v
    return d


for term_id, mname in c.execute(
    'SELECT t.term_id,t.name FROM terms t JOIN term_taxonomy tt ON tt.term_id=t.term_id WHERE tt.taxonomy="nav_menu" ORDER BY t.term_id'
):
    print("===== MENU %s (term %s) =====" % (mname, term_id))
    items = []
    for (pid,) in c.execute(
        "SELECT object_id FROM term_relationships WHERE term_taxonomy_id=(SELECT term_taxonomy_id FROM term_taxonomy WHERE term_id=? AND taxonomy='nav_menu')",
        (term_id,),
    ):
        r = c.execute(
            "SELECT ID,post_title,menu_order,post_status FROM posts WHERE ID=? AND post_type='nav_menu_item'",
            (pid,),
        ).fetchone()
        if not r:
            continue
        m = meta(pid)
        items.append(
            {
                "id": r[0],
                "title": r[1],
                "order": int(r[2] or 0),
                "status": r[3],
                "parent": m.get("_menu_item_menu_item_parent", "0"),
                "type": m.get("_menu_item_type", ""),
                "obj": m.get("_menu_item_object", ""),
                "obj_id": m.get("_menu_item_object_id", ""),
                "url": m.get("_menu_item_url", ""),
            }
        )
    items.sort(key=lambda x: x["order"])
    byparent = {}
    for it in items:
        byparent.setdefault(str(it["parent"]), []).append(it)

    def target(it):
        if it["type"] == "custom":
            return it["url"]
        r = c.execute("SELECT post_name,post_type,post_title FROM posts WHERE ID=?", (it["obj_id"],)).fetchone()
        if r:
            return "/%s/  [%s: %s]" % (r[0], r[1], r[2])
        r = c.execute("SELECT slug,name FROM terms WHERE term_id=?", (it["obj_id"],)).fetchone()
        if r:
            return "/%s/  [taxonomy %s: %s]" % (r[0], it["obj"], r[1])
        return "?? obj_id=%s type=%s" % (it["obj_id"], it["obj"])

    def walk(pid="0", d=0):
        for it in byparent.get(pid, []):
            print("%s- %-34s -> %s" % ("   " * d + "  ", it["title"], target(it)))
            walk(str(it["id"]), d + 1)

    walk()
    print()
