"""Original 500-day room assets, generated in Blender 5.2. Re-runnable in a new scene.
Game coordinates are X right, Y up, -Z north. No user's existing objects are deleted.
"""
import bpy, math, random, os
from mathutils import Vector
random.seed(500)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT,'public','assets')
os.makedirs(OUT,exist_ok=True)
scene=bpy.data.scenes.new('500_Memory_Room')
bpy.context.window.scene=scene
def xyz(p): return (p[0],-p[2],p[1])
def mat(n,c,metal=0,rough=.5,emission=0):
 m=bpy.data.materials.new(n);m.use_nodes=True
 bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 bs.inputs['Base Color'].default_value=(*c,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 if emission:bs.inputs['Emission Color'].default_value=(*c,1);bs.inputs['Emission Strength'].default_value=emission
 return m
wood=mat('Walnut | fine satin',(0.20,.085,.036),0,.37)
darkwood=mat('Dark walnut',(0.09,.037,.02),0,.34)
teal=mat('Petrol painted plaster',(.035,.115,.106),0,.88)
panel=mat('Panel | midnight jade',(.025,.058,.05),0,.43)
gold=mat('Aged brass',(.56,.33,.105),.78,.28)
lightgold=mat('Brass edges',(.8,.56,.22),.67,.24)
cream=mat('Ivory linen',(.68,.60,.45),0,.88)
paper=mat('Letter paper',(.85,.76,.58),0,.93)
black=mat('Charcoal',(.018,.02,.018),0,.52)
red=mat('Oxblood velvet',(.26,.026,.04),0,.86)
glass=mat('Blue rain glass',(.075,.21,.27),.4,.17)
glow=mat('Warm bulb', (1,.62,.25),0,.4,3)
skin=mat('Porcelain warm skin',(.68,.42,.3),0,.52)
hair=mat('Dark chestnut hair',(.035,.018,.012),0,.29)
pink=mat('Dusty rose knit',(.42,.16,.15),0,.86)
blue=mat('Denim indigo',(.055,.085,.135),0,.83)
white=mat('Ceramic cream',(.8,.79,.69),0,.25)
meat=mat('Steak seared',(.19,.06,.025),0,.36)
raw=mat('Beef marbling',(.5,.08,.095),0,.45)
green=mat('Sage foliage',(.09,.17,.055),0,.72)
framecols=[mat('Frame yellow',(.7,.43,.055),.35,.3),mat('Frame green',(.07,.31,.15),.35,.3),mat('Frame blue',(.035,.15,.4),.35,.3),mat('Frame red',(.55,.055,.07),.35,.3)]
def texture(m,kind):
 import numpy as np
 n=512;rng=np.random.default_rng(500);x,y=np.meshgrid(np.arange(n)/n,np.arange(n)/n)
 bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');base=np.array(bs.inputs['Base Color'].default_value[:3])
 if kind=='wood':
  t=.85+.1*np.sin(x*180+np.sin(y*13)*2)+.06*np.sin(x*600+np.sin(y*22)*4)+rng.random((n,n))*.09
 else:t=.85+rng.random((n,n))*.22
 pix=np.ones((n,n,4),dtype=np.float32);pix[:,:,:3]=np.clip(base[None,None,:]*t[:,:,None],0,1)
 im=bpy.data.images.new(m.name+' texture',n,n);im.pixels.foreach_set(pix.flatten());im.filepath_raw=os.path.join(OUT,m.name.split('|')[0].strip().replace(' ','_')+'.png');im.file_format='PNG';im.save();im.pack()
 tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
texture(wood,'wood');texture(darkwood,'wood');texture(teal,'noise');texture(cream,'noise')
def parent(o,g):
 if g:o.parent=g
 return o
def group(n,p=(0,0,0)):
 o=bpy.data.objects.new(n,None);scene.collection.objects.link(o);o.location=xyz(p);return o
def box(n,p,s,m,bev=.025,g=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(p));o=bpy.context.object;o.name=n;o.dimensions=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bev:
  mod=o.modifiers.new('Hand eased edges','BEVEL');mod.width=bev;mod.segments=2
  mod=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 o.data.materials.append(m);return parent(o,g)
def sphere(n,p,s,m,g=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=xyz(p));o=bpy.context.object;o.name=n;o.scale=(s[0],s[2],s[1]);o.data.materials.append(m)
 for f in o.data.polygons:f.use_smooth=True
 return parent(o,g)
def cyl(n,p,r,d,m,g=None,r2=None):
 if r2 is None:bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=r,depth=d,location=xyz(p))
 else:bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=r,radius2=r2,depth=d,location=xyz(p))
 o=bpy.context.object;o.name=n;o.data.materials.append(m);b=o.modifiers.new('Rim bevel','BEVEL');b.width=.012;b.segments=2
 for f in o.data.polygons:f.use_smooth=True
 return parent(o,g)
def line(n,a,b,r,m,g=None):
 aa,bb=Vector(xyz(a)),Vector(xyz(b));mid=(aa+bb)/2
 bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=r,depth=(bb-aa).length,location=mid);o=bpy.context.object;o.name=n;o.rotation_euler=(bb-aa).to_track_quat('Z','Y').to_euler();o.data.materials.append(m);return parent(o,g)
def torus(n,p,r,t,m,g=None,vertical=False):
 bpy.ops.mesh.primitive_torus_add(major_radius=r,minor_radius=t,major_segments=36,minor_segments=8,location=xyz(p));o=bpy.context.object;o.name=n;o.data.materials.append(m)
 if vertical:o.rotation_euler[0]=math.pi/2
 return parent(o,g)
def text(n,body,p,size,m,rot=(math.pi/2,0,0),g=None):
 cu=bpy.data.curves.new(n,'FONT');cu.body=body;cu.size=size;cu.align_x='CENTER';cu.extrude=.001;ob=bpy.data.objects.new(n,cu);scene.collection.objects.link(ob);ob.location=xyz(p);ob.rotation_euler=rot;ob.data.materials.append(m);return parent(ob,g)
def frame(n,p,w,h,m,g=None):
 x,y,z=p
 box(n+' backing',(x,y,z),(w,h,.10),darkwood,.025,g)
 for dx in [-w/2,w/2]:box(n+' side',(x+dx,y,z+.05),(.09,h+.1,.1),m,.015,g)
 for dy in [-h/2,h/2]:box(n+' rail',(x,y+dy,z+.05),(w,.09,.1),m,.015,g)
 box(n+' mat',(x,y,z+.065),(w-.13,h-.13,.014),cream,.005,g)
def table(n,p,w,d,h=1.02):
 g=group(n,p);box('polished top',(0,h,0),(w,.13,d),wood,.055,g)
 box('apron',(0,h-.17,0),(w-.16,.23,d-.18),darkwood,.025,g)
 for x in [-w/2+.15,w/2-.15]:
  for z in [-d/2+.15,d/2-.15]:
   cyl('turned leg',(x,h/2-.08,z),.065,h-.2,darkwood,g);sphere('leg bulb',(x,.25,z),(.09,.12,.09),wood,g);cyl('brass foot',(x,.06,z),.069,.08,gold,g)
 return g
# Architecture with individual staggered planks, detailed coffered ceiling and wainscot.
box('foundation',(0,-.12,0),(12.3,.2,12.3),darkwood,0)
floorMats=[]
for j in range(6):
 m=wood.copy();m.name='Walnut plank '+str(j);floorMats.append(m)
for row in range(32):
 z=-5.82+row*.375
 for col in range(7):
  x=-6.0+col*2+(.9 if row%2 else 0);left=max(-6,x);right=min(6,x+1.99)
  if right>left:box('parquet plank',((left+right)/2,-.015,z),(right-left,.07,.363),random.choice(floorMats),.008)
for x,z,w,d in [(0,-6,12.3,.18),(-6,0,.18,12.3),(6,0,.18,12.3),(0,6,12.3,.18)]:
 box('plaster',(x,2.45,z),(w,4.9,d),teal,.01)
 box('wainscot',(x,.65,z*.985),(w,1.3,d+.045),panel,.01)
 for h in [.1,1.26,1.34,4.48,4.6]:box('continuous moulding',(x*.985,h,z*.985),(w,.055,d+.07),gold if h==1.34 else darkwood,.012)
for side in [-1,1]:
 for k in range(12):
  c=-5.5+k
  box('panel stile',(c,.65,side*5.85),(.045,1.1,.045),gold,.008)
  box('panel stile',(side*5.85,.65,c),(.045,1.1,.045),gold,.008)
box('ceiling',(0,4.83,0),(12.2,.15,12.2),panel,0)
for c in [-4,-2,0,2,4]:
 box('coffer beam',(c,4.68,0),(.13,.16,12),darkwood,.02);box('coffer beam',(0,4.68,c),(12,.16,.13),darkwood,.02)
# The window and woven carpet are built in salon_textiles.py before batching.
# Desk: letter, locked box, glass bottle, books, banker's lamp.
desk=table('Desk',(-3.35,0,-3.65),2.7,1.25)
box('drawer',(-3.35,.77,-2.97),(1.0,.24,.09),wood,.025)
torus('drawer pull',(-3.35,.78,-2.9),.068,.009,gold,vertical=True)
letter=group('Letter',(-3.7,1.115,-3.3));box('envelope',(0,0,0),(.57,.009,.36),paper,.005,letter)
cyl('wax seal',(0,.009,0),.045,.01,red,letter)
lock=group('LockBox',(-2.65,1.22,-3.6));box('casket',(0,0,0),(.72,.36,.5),darkwood,.045,lock)
for x in [-.32,.32]:box('casket edge',(x,0,.26),(.035,.34,.03),gold,.005,lock)
for i in range(7):
 o=cyl('lock dial',(-.24+i*.08,0,.292),.06,.067,gold,lock);o.rotation_euler[1]=math.pi/2
cyl('bottle',(-4.15,1.3,-3.9),.075,.33,glass);cyl('bottle neck',(-4.15,1.53,-3.9),.037,.14,glass);cyl('bottle cap',(-4.15,1.61,-3.9),.04,.04,gold)
cyl('lamp foot',(-3.95,1.12,-4),.21,.04,gold);line('lamp stem',(-3.95,1.14,-4),(-3.95,1.65,-4),.03,gold)
box('banker shade',(-3.95,1.66,-4),(.59,.19,.3),framecols[1],.08);box('lamp light',(-3.95,1.57,-4),(.49,.018,.24),glow,.03)
# The four frames, shuttered until the lock is solved. GLB named roots are animated by the game.
xs=[-4.65,-3.05,-1.45,.15]
for i,x in enumerate(xs):
 g=group('MemoryFrame'+str(i),(x,2.85,-5.79));frame('memory',(0,0,0),1.18,1.47,framecols[[3,0,1,2][i]],g)
 cover=group('FrameCover'+str(i),(x,2.85,-5.65));box('velvet curtain',(0,0,0),(1.06,1.34,.025),red,.01,cover)
 box('picture lamp',(x,3.78,-5.4),(.5,.065,.11),gold,.02);box('picture glow',(x,3.74,-5.39),(.4,.018,.08),glow,.01)
text('Memories heading','THE THINGS WE REMEMBER',(-2.25,4.06,-5.79),.155,lightgold)
# Door opening appears at finale.
door=group('ExitDoor',(3.65,0,-5.77));box('door panel',(0,1.5,0),(1.65,3,.16),darkwood,.045,door)
for y in [.68,2]:box('door inset',(0,y,.10),(1.34,1.02,.045),panel,.035,door)
sphere('door handle',(.61,1.25,.18),(.057,.057,.057),gold,door)
for x in [2.73,4.57]:box('door architrave',(x,1.61,-5.69),(.14,3.3,.18),gold,.02)
box('door lintel',(3.65,3.29,-5.69),(1.98,.15,.18),gold,.02)
text('Door plaque','II',(3.65,3.65,-5.68),.31,gold)
# Bookshelves and musical dolls on west side, with individually bound spines.
shelf=group('MusicCabinet',(-5.28,0,-.9))
box('cabinet back',(0,1.25,0),(.7,2.5,2.6),darkwood,.03,shelf)
for h in [.08,.85,1.65,2.48]:box('shelf plank',(.08,h,0),(.9,.09,2.65),wood,.025,shelf)
for z in [-1.28,1.28]:box('cabinet side',(.08,1.25,z),(.9,2.5,.07),wood,.02,shelf)
bookm=[mat('Book '+str(i),c,0,.78) for i,c in enumerate([(.16,.06,.045),(.075,.14,.12),(.31,.21,.1),(.08,.11,.18),(.35,.12,.1)])]
for k in range(24):
 z=-2.03+k*.097;h=random.uniform(.34,.53)
 box('bound music book',(-4.78,1.7+h/2,z),(.35,h,.082),random.choice(bookm),.008)
 for hh in [1.77,1.7+h-.05]:box('gilt spine',(-4.597,hh,z),(.012,.014,.072),gold,.003)
def doll(name,p,pose):
 g=group(name,p);cyl('plinth',(0,0,0),.20,.055,gold,g)
 cyl('dress',(0,.24,0),.14,.36,cream,g,r2=.075);sphere('head',(0,.57,0),(.105,.125,.1),skin,g)
 sphere('bob',(0,.615,-.025),(.111,.09,.085),hair,g)
 for x in [-.037,.037]:sphere('eye',(x,.585,.092),(.009,.013,.004),black,g)
 if pose=='violinist':
  line('left arm',(-.07,.43,0),(-.18,.52,.13),.031,cream,g);line('right arm',(.075,.43,0),(.18,.48,.15),.031,cream,g)
 else:
  line('arms',(-.07,.43,0),(-.16,.27,.08),.028,cream,g);line('arms',(.07,.43,0),(.16,.27,.08),.028,cream,g)
 return g
doll('Doll_violinist',(-4.75,.925,-.8),'violinist');doll('Doll_bear',(-4.75,.925,-1.65),'other');doll('Doll_dancer',(-4.75,.925,.0),'other')
# Detailed violin separate asset for hand, doll, and secret compartment.
vg=group('ViolinKeyring',(-1.45,2.68,-5.47))
for x,y,s in [(-.05,0,.09),(.05,0,.09),(-.035,.10,.065),(.035,.1,.065)]:sphere('violin belly',(x,y,0),(s,s*.95,.026),wood,vg)
box('fingerboard',(0,.18,.02),(.034,.23,.023),black,.007,vg);box('bridge',(0,.025,.036),(.07,.03,.015),gold,.003,vg)
for x in [-.015,-.005,.005,.015]:line('string',(x,-.06,.04),(x,.3,.04),.0018,gold,vg)
torus('keyring',(0,.36,0),.047,.007,gold,vg,True)
# Carousel music box on south-west console.
table('CarouselConsole',(-4.62,0,1.65),1.2,.9,.87)
car=group('Carousel',(-4.62,.96,1.65))
cyl('music base',(0,0,0),.39,.12,darkwood,car);cyl('gold base',(0,.075,0),.405,.036,gold,car);cyl('ivory floor',(0,.103,0),.37,.035,cream,car)
cyl('central column',(0,.44,0),.049,.67,gold,car)
cyl('striped canopy',(0,.8,0),.44,.25,red,car,r2=.04);sphere('finial',(0,.965,0),(.04,.05,.04),gold,car)
torus('canopy edge',(0,.675,0),.435,.018,gold,car)
for i in range(5):
 a=i*math.tau/5;x,z=math.cos(a)*.265,math.sin(a)*.265
 line('ride pole',(x,.15,z),(x,.68,z),.009,gold,car)
 sphere('horse body',(x,.4,z),(.09,.053,.04),white,car);sphere('horse neck',(x+.065,.45,z),(.029,.07,.033),white,car);sphere('horse face',(x+.09,.50,z),(.055,.028,.03),white,car)
 for dx in [-.045,.045]:line('horse leg',(x+dx,.39,z),(x+dx-.025,.30,z),.013,white,car)
 box('saddle',(x,.451,z),(.064,.015,.059),red,.008,car)
# East wall canvas: geometry faces west. The painting texture is filled by the runtime.
pg=group('Painting',(5.78,2.48,-1.75));frame('painting',(0,0,0),2.4,1.72,gold,pg);pg.rotation_euler[2]=math.pi/2
# Grid and movable platform. Numbers rendered as sharp runtime decals.
for row in range(3):
 for col in range(3):
  idx=row*3+col+1;box('Tile'+str(idx),(2.4+col*1.05,.06,.65+row*1.05),(.99,.08,.99),cream if idx%2 else darkwood,.016)
bench=group('Bench',(-.55,0,2.45))
for j in range(7):box('bench slat',(-.49+j*.16,.43,0),(.15,.09,.84),wood,.017,bench)
for x in [-.39,.39]:
 for z in [-.29,.29]:
  box('bench leg',(x,.235,z),(.07,.39,.07),darkwood,.01,bench);sphere('caster',(x,.06,z),(.05,.05,.032),black,bench)
for z in [-.39,.39]:box('bench frame',(0,.36,z),(1.14,.07,.055),gold,.01,bench)
# Beef map plaque on east.
cg=group('CowChart',(5.78,2.3,2.5));frame('butcher chart',(0,0,0),2.05,1.45,gold,cg);cg.rotation_euler[2]=math.pi/2
beef=group('BeefToken',(4.5,.55,2.75));sphere('beef',(0,0,0),(.19,.055,.14),raw,beef)
for i in range(8):
 a=random.uniform(-.12,.12);line('marbling',(a,.047,-.08),(a+.045,.05,.065),.007,cream,beef)
# Tasting sideboard, dome lids disappear on steak puzzle activation.
table('TastingTable',(-2.5,0,4.78),3.5,.85,1.02)
for i,x in enumerate([-3.35,-1.67]):
 g=group('Steak'+str(i),(x,1.12,4.78));cyl('plate',(0,0,0),.31,.036,white,g);torus('plate rim',(0,.024,0),.27,.013,gold,g)
 sphere('steak',(0,.067,0),(.18,.045,.125),meat,g)
 for k in range(5):
  o=box('grill line',(-.12+k*.055,.109,0),(.012,.006,.16),black,.002,g);o.rotation_euler[2]=-.4
 for k in range(3):sphere('potato',(.19,.06,-.12+k*.08),(.045,.035,.031),cream,g)
 line('rosemary',(-.14,.12,.08),(.12,.12,.08),.005,green,g)
 cl=group('Cloche'+str(i),(x,1.16,4.78));sphere('silver dome',(0,.08,0),(.34,.23,.34),gold,cl);sphere('dome handle',(0,.32,0),(.045,.045,.045),darkwood,cl)
# Chandelier and sconces.
line('ceiling chain',(0,4.7,-.7),(0,3.75,-.7),.023,gold)
torus('chandelier ring',(0,3.6,-.7),.73,.035,gold)
for i in range(8):
 a=i*math.tau/8;x,z=math.cos(a)*.73,math.sin(a)*.73-.7
 line('chandelier arm',(0,3.82,-.7),(x,3.6,z),.021,gold)
 cyl('candle',(x,3.75,z),.036,.29,cream);sphere('flame',(x,3.925,z),(.025,.055,.025),glow)
for x,z in [(5.65,-4.2),(5.65,4.9),(-5.65,1.0)]:
 cyl('sconce cup',(x,2.7,z),.14,.11,gold);cyl('sconce shade',(x,2.99,z),.20,.39,cream,r2=.13);sphere('sconce bulb',(x,2.95,z),(.08,.12,.08),glow)
# Plant and pottery to soften corners.
for x,z in [(4.95,4.85),(-4.8,-4.8)]:
 cyl('terracotta pot',(x,.26,z),.26,.5,darkwood,r2=.3);cyl('soil',(x,.515,z),.27,.025,black)
 for k in range(12):
  a=k*2.4;h=random.uniform(.6,1.5);dx,dz=math.cos(a)*.3,math.sin(a)*.3
  line('plant stem',(x,.5,z),(x+dx,h,z+dz),.008,green);ob=sphere('leaf',(x+dx,h,z+dz),(.17,.045,.08),green);ob.rotation_euler[1]=a
# Original stylized adult avatar, with separate pivots for procedural walking.
av=group('Hayoung',(0,0,4.2))
def limb(name,loc,offset,scale,m):
 g=group(name,loc);g.parent=av;sphere(name+' mesh',offset,scale,m,g);return g
limb('LegL',(-.105,.87,0),(0,-.37,0),(.082,.38,.085),blue)
limb('LegR',(.105,.87,0),(0,-.37,0),(.082,.38,.085),blue)
for side,x in [('L',-.105),('R',.105)]:
 leg=bpy.data.objects['Leg'+side];sphere('sneaker',(0,-.78,.035),(.083,.055,.145),white,leg)
sphere('sweater',(0,1.1,0),(.225,.32,.12),cream,av)
armL=limb('ArmL',(-.23,1.31,0),(-.015,-.25,0),(.077,.255,.081),cream)
armR=limb('ArmR',(.23,1.31,0),(.015,-.25,0),(.077,.255,.081),cream)
for arm in [armL,armR]:sphere('hand',(0,-.5,.015),(.05,.073,.035),skin,arm)
cyl('neck',(0,1.45,0),.06,.15,skin,av)
sphere('face',(0,1.63,.015),(.133,.179,.124),skin,av)
sphere('hair crown',(0,1.745,-.029),(.145,.1,.131),hair,av)
sphere('hair back',(0,1.57,-.095),(.145,.21,.053),hair,av)
for side in [-1,1]:
 sphere('side hair',(side*.129,1.61,-.017),(.026,.18,.097),hair,av)
 sphere('ear',(side*.13,1.63,.007),(.018,.031,.016),skin,av)
 sphere('eye white',(side*.047,1.663,.121),(.031,.017,.012),white,av)
 sphere('iris',(side*.047,1.663,.132),(.012,.014,.005),hair,av)
 line('eyebrow',(side*.025,1.695,.126),(side*.074,1.699,.121),.006,hair,av)
sphere('nose',(0,1.624,.138),(.015,.025,.018),skin,av)
sphere('smile',(0,1.574,.125),(.028,.005,.005),pink,av)
box('crossbody strap',(0,1.1,.119),(.031,.49,.021),darkwood,.009,av).rotation_euler[1]=-.4
box('small leather bag',(.13,.88,.17),(.23,.18,.09),wood,.04,av)
torus('bag clasp',(.13,.89,.218),.025,.005,gold,av,True)
# Render camera and lighting are kept in .blend; GLB lights omitted and recreated physically in game.
def area(n,p,target,power,color,size):
 data=bpy.data.lights.new(n,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size;o=bpy.data.objects.new(n,data);scene.collection.objects.link(o);o.location=xyz(p);o.rotation_euler=(Vector(xyz(target))-o.location).to_track_quat('-Z','Y').to_euler()
area('chandelier fill',(0,4.2,-.6),(0,0,0),1400,(1,.72,.43),5)
area('window blue',(-5.4,3.4,3.8),(0,1,0),850,(.35,.65,1),3)
area('desk key',(-3.8,3,-3.3),(-3.2,0,-3),650,(1,.72,.43),2)
camd=bpy.data.cameras.new('Hero camera');cam=bpy.data.objects.new('Hero camera',camd);scene.collection.objects.link(cam);cam.location=xyz((1.0,2.5,5.3));cam.rotation_euler=(Vector(xyz((-1,1.8,-2)))-cam.location).to_track_quat('-Z','Y').to_euler();camd.lens=25;scene.camera=cam
scene.world=bpy.data.worlds.new('Midnight');scene.world.use_nodes=True
bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.1,.14,.18,1);bg.inputs[1].default_value=.3
scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(OUT,'blender-room.png')
exec(compile(open(os.path.join(ROOT,'blender','salon_details.py'),encoding='utf-8').read(),'salon_details.py','exec'))
exec(compile(open(os.path.join(ROOT,'blender','salon_textiles.py'),encoding='utf-8').read(),'salon_textiles.py','exec'))
# Merge static objects per material to reduce browser draw calls. Keep interactive hierarchies intact.
bpy.ops.object.select_all(action='DESELECT')
static=[o for o in scene.objects if o.type=='MESH' and o.parent is None and not o.name.startswith('Tile')]
buckets={}
for o in static:buckets.setdefault(o.data.materials[0].name,[]).append(o)
for name,objs in buckets.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objs:o.select_set(True)
 bpy.context.view_layer.objects.active=objs[0]
 bpy.ops.object.convert(target='MESH');bpy.ops.object.join();objs[0].name='Architecture_'+name.replace(' ','_')
# Join meshes within each dynamic parent; keep avatar limbs articulated.
for root in [o for o in list(scene.objects) if o.type=='EMPTY']:
 children=[c for c in root.children if c.type=='MESH']
 if len(children)>1:
  bpy.ops.object.select_all(action='DESELECT')
  for c in children:c.select_set(True)
  bpy.context.view_layer.objects.active=children[0];bpy.ops.object.convert(target='MESH');bpy.ops.object.join();children[0].name=root.name+'_detail'
# Vertex-painted small models retain colors with one material per mesh.
paint=bpy.data.materials.new('Hand painted miniature');paint.use_nodes=True
bs=next(n for n in paint.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Roughness'].default_value=.46
vc=paint.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='Paint';paint.node_tree.links.new(vc.outputs['Color'],bs.inputs['Base Color'])
for ob in list(scene.objects):
 if ob.type!='MESH':continue
 ancestor=ob.parent;names=[]
 while ancestor:names.append(ancestor.name);ancestor=ancestor.parent
 if not any(n.startswith(('Doll_','Carousel','Hayoung')) and n!='CarouselConsole' for n in names):continue
 attr=ob.data.color_attributes.new(name='Paint',type='BYTE_COLOR',domain='CORNER')
 for poly in ob.data.polygons:
  material=ob.data.materials[poly.material_index];node=next(n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED');color=node.inputs['Base Color'].default_value
  for li in poly.loop_indices:attr.data[li].color=color
  poly.material_index=0
 ob.data.materials.clear();ob.data.materials.append(paint)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','500-memory-room.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'memory-room.glb'),export_format='GLB',use_active_scene=True,export_cameras=False,export_lights=False,export_extras=True,export_apply=True)
for a in (bpy.context.screen.areas if bpy.context.screen else []):
 if a.type=='VIEW_3D':a.spaces.active.region_3d.view_perspective='CAMERA'
print('ASSET_BUILD_OK',len(scene.objects),os.path.getsize(os.path.join(OUT,'memory-room.glb')))
