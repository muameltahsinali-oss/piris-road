import sys, os
SRC = r"C:\Users\omlsa\Desktop\aquamarine-gnat-712272.hostingersite.com-20260311-121537-620.wpress"
DST = r"C:\Users\omlsa\AppData\Local\Temp\claude\C--Users-omlsa-Desktop-piris-road\3248b268-d131-47e8-9ac0-b182d7dbe886\scratchpad\site"
HDR = 4377
KEEP = ("package.json","index.php","database.sql","themes/","mu-plugins/","litespeed/",
        "plugins/avista-core/","plugins/code-snippets/","plugins/index.php","uploads/")
def s(b): return b.split(b'\x00',1)[0].decode('utf-8','replace')
n=skip=0
with open(SRC,'rb') as f:
    while True:
        h=f.read(HDR)
        if len(h)<HDR or h[:255]==b'\x00'*255: break
        name=s(h[0:255]); size=int(s(h[255:269]) or 0); path=s(h[281:4377])
        full=((path.rstrip('/')+'/'+name) if path not in ('.','') else name).lstrip('./')
        if not full.startswith(KEEP):
            f.seek(size,1); skip+=1; continue
        out=os.path.join(DST,full.replace('/',os.sep))
        os.makedirs(os.path.dirname(out),exist_ok=True)
        with open(out,'wb') as o:
            left=size
            while left>0:
                b=f.read(min(1<<22,left))
                if not b: break
                o.write(b); left-=len(b)
        n+=1
print("extracted:",n,"skipped:",skip)
