import sys, os
SRC = r"C:\Users\omlsa\Desktop\aquamarine-gnat-712272.hostingersite.com-20260311-121537-620.wpress"
HDR = 4377
def s(b): return b.split(b'\x00',1)[0].decode('utf-8','replace')
out=[]
with open(SRC,'rb') as f:
    while True:
        h=f.read(HDR)
        if len(h)<HDR or h[:255]==b'\x00'*255: break
        name=s(h[0:255]); size=int(s(h[255:269]) or 0); mtime=s(h[269:281]); path=s(h[281:4377])
        full = (path.rstrip('/')+'/'+name) if path not in ('.','') else name
        out.append((full.lstrip('./'), size, mtime))
        f.seek(size,1)
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'toc.tsv'),'w',encoding='utf-8') as o:
    for n,sz,mt in out: o.write(f"{n}\t{sz}\t{mt}\n")
print("entries:", len(out))
print("total bytes:", sum(x[1] for x in out))
