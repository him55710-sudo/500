"""Deterministic original Aubusson-style wool design and fine woven normal maps."""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
import math

OUT = Path(__file__).resolve().parents[1] / 'public' / 'assets' / 'salon'
OUT.mkdir(parents=True, exist_ok=True)
S = 2048
image = Image.new('RGB', (S, S), '#e6ddc5')
d = ImageDraw.Draw(image)
ivory, blue, gold, rose, leaf = '#e9e0c9', '#426574', '#bc945d', '#a55361', '#6e8066'

def line(points, fill, width=2):
    d.line([(round(x), round(y)) for x,y in points], fill=fill, width=width, joint='curve')

def petal(cx, cy, angle, length, width, color):
    # Pointed, curved leaves, with a stitched vein rather than flat circles.
    a=np.array([math.cos(angle),math.sin(angle)])
    b=np.array([-a[1],a[0]])
    pts=[]
    for side in (1,-1):
        for t in np.linspace(0,1,16)[::side]:
            p=np.array([cx,cy])+a*length*t+b*width*math.sin(math.pi*t)*side
            pts.append(tuple(p))
    d.polygon(pts,fill=color)
    line([(cx,cy),(cx+a[0]*length*.86,cy+a[1]*length*.86)],gold,2)

def flower(x,y,r,rotation=0):
    for i in range(8):
        a=rotation+i*math.tau/8
        petal(x,y,a,r,r*.23,rose if i%2 else '#c68b85')
    for i in range(8):
        a=rotation+i*math.tau/8+.12
        petal(x,y,a,r*.58,r*.13,ivory)
    d.ellipse((x-r*.18,y-r*.18,x+r*.18,y+r*.18),fill=gold,outline=blue,width=2)

def branch(cx,cy,angle,length=120):
    pts=[]
    for t in np.linspace(0,1,40):
        x=length*t; y=math.sin(t*math.pi)*length*.17
        pts.append((cx+x*math.cos(angle)-y*math.sin(angle),cy+x*math.sin(angle)+y*math.cos(angle)))
    line(pts,gold,4)
    for k in range(1,6):
        p=pts[round(k*len(pts)/7)]
        for side in (-1,1):petal(*p,angle+side*.72,length*.27,length*.055,leaf)
    flower(*pts[-1],length*.20,angle)

# Bound selvedge, narrow guard borders, and a broad blue floral border.
for inset,color,width in [(12,blue,16),(33,gold,9),(48,ivory,12),(65,blue,168),(244,gold,8),(260,blue,11),(278,gold,3)]:
    d.rectangle((inset,inset,S-1-inset,S-1-inset),outline=color,width=width)
for t in range(87,S-85,20):
    for x,y in [(t,43),(t,S-44),(43,t),(S-44,t)]:d.ellipse((x-2,y-2,x+2,y+2),fill=ivory)
for t in range(335,1800,146):
    for x,y,a in [(t,149,0),(t,1899,math.pi),(149,t,math.pi/2),(1899,t,-math.pi/2)]:
        flower(x,y,40,a)
        branch(x+math.cos(a)*43,y+math.sin(a)*43,a,75)
for x,y in [(148,148),(1900,148),(148,1900),(1900,1900)]:flower(x,y,74,math.pi/8)

# Curved central cartouche and embroidered wreath.
for rx,ry,color,width in [(440,535,gold,7),(423,518,blue,3),(408,503,gold,3)]:
    d.ellipse((1024-rx,1024-ry,1024+rx,1024+ry),outline=color,width=width)
for i in range(32):
    a=i*math.tau/32
    x,y=1024+385*math.cos(a),1024+476*math.sin(a)
    petal(x,y,a+math.pi/2,57,13,leaf)
    petal(x,y,a+math.pi/2+.62,44,10,gold)
    if i%4==0:flower(x,y,39,a)
for i in range(8):
    a=i*math.tau/8
    branch(1024+85*math.cos(a),1024+85*math.sin(a),a,180)
flower(1024,1024,108,math.pi/8)
for x,y,a in [(490,460,.78),(1558,460,2.36),(490,1588,-.78),(1558,1588,3.93)]:
    flower(x,y,60,a)
    for turn in [-.62,0,.62]:branch(x,y,a+turn,175)
for y in range(400,1700,135):
    for x in range(400,1700,135):
        if ((x-1024)/570)**2+((y-1024)/650)**2<1:continue
        d.ellipse((x-4,y-4,x+4,y+4),fill=gold)

# Subtle yarn variation keeps the design legible at grazing game-camera angles.
rng=np.random.default_rng(100)
y,x=np.mgrid[:S,:S]
weave=(np.sin(x*math.pi)*.01+np.cos(y*math.pi/2)*.018+np.sin(x*math.pi/3)*.013)
noise=rng.normal(0,.008,(S,S))
pixels=np.asarray(image).astype(float)*(1+weave[:,:,None]+noise[:,:,None])
Image.fromarray(np.uint8(np.clip(pixels,0,255))).save(OUT/'aubusson-wool-color.jpg',quality=94,subsampling=0)

# Periodic tangent-space textile normal and roughness maps, shared by cloth/wool.
N=512
y,x=np.mgrid[:N,:N]
height=.5+.19*np.sin(x*math.tau/8)*np.cos(y*math.tau/8)+rng.normal(0,.015,(N,N))
dy,dx=np.gradient(height)
normal=np.stack([-dx,-dy,np.ones_like(dx)],axis=2)
normal/=np.linalg.norm(normal,axis=2,keepdims=True)
Image.fromarray(np.uint8((normal*.5+.5)*255)).save(OUT/'woven-normal.png')
rough=np.clip(215+rng.normal(0,6,(N,N))+np.sin(y*math.tau/8)*7,0,255)
Image.fromarray(np.uint8(rough)).save(OUT/'woven-roughness.jpg',quality=92)

# A softly clouded sky is a depth cue behind the individual arched glass panes.
w,h=768,1024
y,x=np.mgrid[:h,:w];t=y/(h-1)
top=np.array([102,176,219]);bottom=np.array([221,236,234])
sky=top[None,None,:]*(1-t[:,:,None])+bottom[None,None,:]*t[:,:,None]
cloud=np.zeros((h,w))
for cx,cy,rx,ry in [(120,195,130,43),(260,220,125,35),(550,490,200,50),(640,130,160,34)]:
    cloud+=.55*np.exp(-(((x-cx)/rx)**2+((y-cy)/ry)**2)*2)
cloud=np.clip(cloud,0,.7)
sky=sky*(1-cloud[:,:,None])+np.array([250,249,239])*cloud[:,:,None]
Image.fromarray(np.uint8(sky)).save(OUT/'morning-sky.jpg',quality=94)
print('SALON_TEXTURES_OK',OUT)
