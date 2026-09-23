"""A playable Hello Kitty cloud palace. Original editable Blender meshes; game coordinates Y-up."""
import bpy, math, os, random, json
from mathutils import Vector
random.seed(500)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'public','assets')
scene=bpy.data.scenes.new('Hayoung_Hello_Kitty_Heaven')
bpy.context.window.scene=scene
def xyz(p):return (p[0],-p[2],p[1])
def material(n,c,metal=0,rough=.5,emission=0):
 m=bpy.data.materials.new(n);m.use_nodes=True
 bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 bs.inputs['Base Color'].default_value=(*c,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 if emission:bs.inputs['Emission Color'].default_value=(*c,1);bs.inputs['Emission Strength'].default_value=emission
 return m
ivory=material('Pearl porcelain',(1,.91,.83),.12,.29)
white=material('Kitty soft white plush',(.97,.95,.93),0,.94)
pink=material('Rose quartz silk',(.88,.31,.49),.05,.39)
blush=material('Blush velvet',(.95,.57,.67),0,.91)
pale=material('Petal pink plaster',(.89,.69,.75),0,.8)
gold=material('Champagne gold',(.77,.54,.25),.72,.27)
rose=material('Ribbon rose',(.67,.08,.25),.12,.35)
lilac=material('Lilac silk',(.64,.43,.76),.06,.45)
mint=material('Pistachio porcelain',(.58,.80,.72),.03,.4)
black=material('Kitty embroidered charcoal',(.009,.008,.018),0,.8)
yellow=material('Kitty yellow nose',(1,.60,.065),.04,.36)
sky=material('Cloud window daylight',(.57,.76,1),0,.9,.3)
cloudmat=material('Clouds soft ivory',(.93,.90,1),0,1,.12)
lamp=material('Pearl glow',(1,.79,.53),0,.3,1.4)
mirror=material('Soft silver mirror',(.65,.80,.86),.92,.11)
green=material('Rose leaves',(.27,.49,.37),0,.8)
def parent(o,g):
 if g:o.parent=g
 return o
def group(n,p=(0,0,0),angle=0):
 o=bpy.data.objects.new(n,None);scene.collection.objects.link(o);o.location=xyz(p);o.rotation_euler.z=angle;return o
def box(n,p,s,m,bevel=.035,g=None):
 verts=[(x*s[0]/2,y*s[1]/2,z*s[2]/2) for x,y,z in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
 o=mesh(n,verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],m,g);o.location=xyz(p)
 if bevel:
  b=o.modifiers.new('Soft upholstered edges','BEVEL');b.width=bevel;b.segments=3
  o.modifiers.new('Polished normals','WEIGHTED_NORMAL')
 return o
_spheres={}
def ball(n,p,s,m,g=None,seg=20):
 key=(seg,m.name)
 if key not in _spheres:
  verts=[(math.sin(j*math.pi/12)*math.cos(i*math.tau/seg),math.cos(j*math.pi/12),math.sin(j*math.pi/12)*math.sin(i*math.tau/seg)) for j in range(1,12) for i in range(seg)]
  top=len(verts);verts.extend([(0,1,0),(0,-1,0)]);faces=[]
  for j in range(10):
   for i in range(seg):a=j*seg+i;b=j*seg+(i+1)%seg;faces.append((a,b,b+seg,a+seg))
  for i in range(seg):faces.extend([(top,(i+1)%seg,i),(top+1,10*seg+i,10*seg+(i+1)%seg)])
  me=bpy.data.meshes.new('Reusable plush sphere');me.from_pydata([xyz(v) for v in verts],[],faces);me.materials.append(m)
  for f in me.polygons:f.use_smooth=True
  _spheres[key]=me
 o=bpy.data.objects.new(n,_spheres[key]);scene.collection.objects.link(o);o.location=xyz(p);o.scale=(s[0],s[2],s[1])
 return parent(o,g)
def cylinder(n,p,r,h,m,g=None,top=None):
 rt=r if top is None else top;verts=[(rr*math.cos(i*math.tau/32),y,rr*math.sin(i*math.tau/32)) for rr,y in [(r,-h/2),(rt,h/2)] for i in range(32)]
 faces=[(i,i+32,(i+1)%32+32,(i+1)%32) for i in range(32)]+[tuple(range(32)),tuple(range(63,31,-1))]
 o=mesh(n,verts,faces,m,g);o.location=xyz(p)
 b=o.modifiers.new('Rounded rims','BEVEL');b.width=.012;b.segments=2
 for f in o.data.polygons:f.use_smooth=True
 return parent(o,g)
def curve(n,points,r,m,g=None,closed=False):
 cu=bpy.data.curves.new(n,'CURVE');cu.dimensions='3D';cu.resolution_u=10;cu.bevel_depth=r;cu.bevel_resolution=2
 sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(points)-1);sp.use_cyclic_u=closed
 for b,p in zip(sp.bezier_points,points):b.co=xyz(p);b.handle_left_type='AUTO';b.handle_right_type='AUTO'
 o=bpy.data.objects.new(n,cu);scene.collection.objects.link(o);o.data.materials.append(m);return parent(o,g)
def mesh(n,verts,faces,m,g=None):
 me=bpy.data.meshes.new(n);me.from_pydata([xyz(v) for v in verts],[],faces);me.materials.append(m);o=bpy.data.objects.new(n,me);scene.collection.objects.link(o);return parent(o,g)
def silhouette(n,points,depth,m,g=None):
 # Closed outlines from parametric hearts and mirrored ears can wind either way.
 if sum(points[i][0]*points[(i+1)%len(points)][1]-points[(i+1)%len(points)][0]*points[i][1] for i in range(len(points)))<0:points=list(reversed(points))
 nn=len(points);verts=[(x,y,z) for z in [-depth/2,depth/2] for x,y in points]
 faces=[tuple(range(nn-1,-1,-1)),tuple(range(nn,2*nn))]+[(i,(i+1)%nn,(i+1)%nn+nn,i+nn) for i in range(nn)]
 o=mesh(n,verts,faces,m,g);b=o.modifiers.new('Rounded silhouette','BEVEL');b.width=.025;b.segments=3;o.modifiers.new('Soft normals','WEIGHTED_NORMAL');return o
def heart(n,p,s,m,g=None):
 pts=[]
 for i in range(48):
  t=math.tau*i/48;pts.append((16*math.sin(t)**3/18,(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))/18))
 o=silhouette(n,pts,.18,m,g);o.location=xyz(p);o.scale=(s,s,s);return o
def ring(n,p,rx,rz,r,m,g=None):return curve(n,[(p[0]+rx*math.cos(i*math.tau/24),p[1],p[2]+rz*math.sin(i*math.tau/24)) for i in range(24)],r,m,g,True)
def bow(n,p,s,m,g=None):
 for side in [-1,1]:
  o=ball(n+' loop',(p[0]+side*s*.29,p[1]+s*.025,p[2]),(s*.32,s*.23,s*.12),m,g);o.rotation_euler.y=side*.24
 ball(n+' knot',p,(s*.14,s*.17,s*.15),m,g)
 for side in [-1,1]:
  curve(n+' tail',[(p[0]+side*.08*s,p[1]-.1*s,p[2]),(p[0]+side*.14*s,p[1]-.40*s,p[2]),(p[0]+side*.32*s,p[1]-.50*s,p[2]-.015)],s*.062,m,g)
def roseflower(p,s=.11,g=None):
 ball('Rose heart',p,(s*.55,s*.5,s*.55),pink,g)
 for i in range(5):
  a=i*math.tau/5;ball('Rose petal',(p[0]+math.cos(a)*s*.5,p[1]+math.sin(a)*s*.5,p[2]),(s*.52,s*.43,s*.29),blush,g,16)
def kitty(n,p,scale=1,dress=pink,crown=False,angle=0):
 g=group(n,p,angle)
 # Hello Kitty's face is wider than tall; no mouth, six whiskers and a yellow nose.
 ball('Plush body',(0,.37,0),(.29,.34,.22),dress,g)
 cylinder('Silk skirt',(0,.26,.005),.39,.30,dress,g,.22)
 for i in range(18):
  a=i*math.tau/18;ball('Skirt pearl lace',(math.cos(a)*.355,.14,math.sin(a)*.355),(.033,.033,.033),ivory,g,12)
 ball('Kitty head',(0,.87,.015),(.47,.365,.29),white,g,28)
 for side in [-1,1]:
  ear=silhouette('Rounded Kitty ear',[(side*.18,.99),(side*.39,1.28),(side*.44,.92)],.32,white,g)
  ball('Kitty arm',(side*.31,.43,.09),(.13,.20,.13),white,g)
  ball('Kitty foot',(side*.185,.105,.18),(.155,.11,.18),white,g)
  ball('Kitty eye',(side*.185,.885,.287),(.036,.057,.021),black,g,16)
  for j in range(3):
   y=.92-j*.105;curve('Embroidered whisker',[(side*.326,y,.254),(side*.447,y+(1-j)*.03,.245),(side*.51,y+(1-j)*.045,.22)],.010,black,g)
 ball('Yellow oval nose',(0,.795,.305),(.048,.031,.022),yellow,g,16)
 bow('Kitty signature bow',(.305,1.15,.225),.52,rose,g)
 bow('Dress waist bow',(0,.40,.245),.26,blush,g)
 if crown:
  ring('Crown base',(0,1.21,.0),.17,.15,.022,gold,g)
  for i in range(5):
   a=i*math.tau/5;curve('Tiara spire',[(math.cos(a-.5)*.15,1.22,math.sin(a-.5)*.13),(math.cos(a)*.13,1.43,math.sin(a)*.12),(math.cos(a+.5)*.15,1.22,math.sin(a+.5)*.13)],.019,gold,g);ball('Tiara pearl',(math.cos(a)*.13,1.43,math.sin(a)*.12),(.033,.033,.033),ivory,g,12)
 g.scale=(scale,scale,scale);return g
def plaque(text,p,size,m,g=None):
 cu=bpy.data.curves.new(text,'FONT');cu.body=text;cu.align_x='CENTER';cu.size=size;cu.extrude=.0015
 o=bpy.data.objects.new('Lettering '+text,cu);scene.collection.objects.link(o);o.location=xyz(p);o.rotation_euler=(math.pi/2,0,0);cu.materials.append(m);return parent(o,g)
def cloud(p,s=1,g=None):
 for i,(x,y,z,r) in enumerate([(-.8,0,0,.6),(0,.25,0,.8),(.8,.03,0,.6),(-.35,-.15,.2,.65),(.5,-.17,.2,.62)]):
  ball('Cloud puff',(p[0]+x*s,p[1]+y*s,p[2]+z*s),(r*s,r*s*.62,r*s*.50),cloudmat,g,16)

# Rose-marble floor and pearl paneling. Plenty of open walking space down the centre.
box('Palace floor',(0,-.12,0),(14.4,.24,14),ivory,.08)
for x in range(-6,7,2):box('Rose floor inlay',(x,.012,0),(.017,.009,13.8),gold,.001)
for z in range(-6,7,2):box('Rose floor inlay',(0,.013,z),(14,.009,.017),gold,.001)
for x in [-7,7]:box('Pink side wall',(x,2.9,0),(.18,5.8,14),pale,.02)
for z in [-7,7]:box('Pink end wall',(0,2.9,z),(14.2,5.8,.18),pale,.02)
box('Heaven ceiling',(0,5.9,0),(14.2,.18,14.2),cloudmat,.04)
for side in [-1,1]:
 for z in [-6,-3,0,3,6]:
  x=side*6.86;box('Fluted pearl pilaster',(x,2.7,z),(.18,5.2,.24),ivory,.055)
  box('Pilaster gold crown',(x,5.30,z),(.3,.10,.4),gold)
  for zz in [z-1.28,z+1.28]:box('Panel vertical',(side*6.87,1.2,zz),(.045,1.95,.035),gold,.01)
  for y in [.23,2.17]:box('Panel horizontal',(side*6.87,y,z),(.045,.035,2.56),gold,.01)
for z in [-6.87,6.87]:
 for y in [.18,1.15,5.55]:box('End wall cornice',(0,y,z),(13.8,.055,.10),ivory,.016)
for x in [-6.85,6.85]:
 for y in [.18,1.15,5.55]:box('Side wall cornice',(x,y,0),(.1,.055,13.8),ivory,.016)

# Three tall arched cloud windows; shaped sky panels and sculpted clouds.
for x in [-4.75,0,4.75]:
 g=group('Heaven arched window',(x,0,-6.77));w=1.65;bottom=1.45;spring=3.73
 pts=[(-w,bottom),(w,bottom),(w,spring)]+[(w*math.cos(i*math.pi/24),spring+w*.75*math.sin(i*math.pi/24)) for i in range(25)]
 silhouette('Luminous sky arch',pts,.04,sky,g)
 curve('Arched pearl frame',[(x,y,.06) for x,y in pts],.105,ivory,g,True)
 curve('Arched gold fillet',[(x,y,.12) for x,y in pts],.025,gold,g,True)
 for xx in [-.55,.55]:box('Window mullion',(xx,2.9,.13),(.035,2.7,.04),ivory,.01,g)
 box('Window crossbar',(0,3.2,.14),(3.25,.045,.04),ivory,.01,g)
 cloud((-.5,2.0,.13),.65,g);cloud((.75,3.5,.12),.48,g)
 for side in [-1,1]:
  # Curved fabric surfaces, gathered near the tieback, with visible pleats.
  verts=[];faces=[]
  for j in range(21):
   t=j/20;y=5.25-t*3.8;centre=side*(1.52+.24*math.sin(t*math.pi));width=.46-.20*math.sin(t*math.pi)
   for k in range(15):
    u=k/14;verts.append((centre+(u-.5)*width*2,y,.22+.065*math.cos(u*math.tau*5)))
  for j in range(20):
   for k in range(14):a=j*15+k;faces.append((a,a+1,a+16,a+15))
  curtain=mesh('Rose satin window curtain',verts,faces,blush,g)
  for f in curtain.data.polygons:f.use_smooth=True
  bow('Curtain tie',(side*1.73,2.65,.33),.65,rose,g)

# A scalloped rug and the centrepiece princess canopy bed.
for i in range(44):
 a=i*math.tau/44;ball('Rug scallop',(math.cos(a)*2.45,.027,1.0+math.sin(a)*2.00),(.28,.035,.27),blush)
o=cylinder('Rose oval rug',(0,.035,1),1,.055,blush);o.scale=(2.45,2,.8)
ring('Rug pearl edging',(0,.068,1),2.3,1.85,.016,ivory)
bed=group('Princess canopy bed',(0,0,-3.65))
box('Carved bed base',(0,.40,0),(3.45,.45,3.65),ivory,.14,bed)
box('Mattress',(0,.79,0),(3.34,.43,3.52),white,.2,bed)
box('Rose silk duvet',(0,1.02,.35),(3.37,.18,2.85),blush,.16,bed)
for side in [-1,1]:
 box('Pillow',(side*.72,1.16,-1.13),(1.2,.27,.69),white,.22,bed)
 heart('Heart cushion',(side*.72,1.35,-.90),.36,pink,bed)
 for z in [-1.62,1.62]:
  cylinder('Canopy pearl post',(side*1.67,2.2,z),.055,3.90,ivory,bed)
  ball('Post finial',(side*1.67,4.25,z),(.115,.15,.115),gold,bed)
for x in [-1.67,1.67]:curve('Canopy side rail',[(x,4.18,-1.62),(x,4.38,0),(x,4.18,1.62)],.045,gold,bed)
for z in [-1.62,1.62]:
 curve('Canopy crown', [(-1.67,4.18,z),(-.8,4.44,z),(0,4.70,z),(.8,4.44,z),(1.67,4.18,z)],.055,gold,bed)
 # The satin swag hangs over the crown in a soft catenary.
 verts=[];faces=[]
 for i in range(33):
  x=-1.68+i*3.36/32;top=4.25+.45*(1-abs(x)/1.68);bottom=3.87+.31*(abs(x)/1.68)**2
  verts.extend([(x,top,z),(x,bottom,z+.10*math.cos(x*8))])
 for i in range(32):faces.append((i*2,i*2+1,i*2+3,i*2+2))
 mesh('Canopy satin scallop',verts,faces,blush,bed)
bow('Canopy giant bow',(0,4.53,1.72),1.05,pink,bed)
# Tall cushioned heart headboard, gilded outline and tufted pearls.
h=heart('Royal heart headboard',(0,1.96,-1.61),1.76,pink,bed);h.scale.z=.24
for x in [-.9,-.45,0,.45,.9]:
 for y in [1.5,1.85,2.2]:ball('Headboard pearl tuft',(x,y,-1.41),(.035,.035,.035),ivory,bed,12)
kitty('Royal Kitty on bed',(-.67,1.17,-3.52),.74,pink,True)
kitty('Lilac Kitty on bed',(.64,1.17,-3.56),.65,lilac,False)
plaque('HAYOUNG',(0,3.23,-5.3),.22,gold)
plaque('500 DAYS  /  STILL YOU',(0,2.91,-5.30),.10,rose)

# Plush collection on a stepped display on the left, each with a different gown.
display=group('Kitty collection display',(-5.10,0,-3.45),.40)
for row in range(3):
 box('Display tier',(0,.35+row*.39,-row*.42),(2.6,.4,.8),ivory,.08,display)
 for j in range(3):
  local=kitty('Collection Kitty',((j-1)*.83,.57+row*.39,-row*.42),.50,[pink,lilac,mint][(row+j)%3],row==2)
  local.parent=display
bow('Display bow',(0,.4,.46),.78,pink,display)

# Vanity with a sculpted heart mirror, bulb pearls, stool and tiny cosmetics.
vanity=group('Princess vanity',(5.00,0,-2.00),-math.pi/2)
box('Vanity desk',(0,1.1,0),(2.6,.16,.90),ivory,.10,vanity)
for x in [-1.04,1.04]:
 for z in [-.30,.30]:curve('Cabriole vanity leg',[(x,1.04,z),(x*.92,.60,z),(x*1.05,.10,z+.09)],.07,ivory,vanity)
for x in [-.70,0,.70]:
 box('Vanity drawer',(x,.88,.03),(.64,.29,.75),pale,.06,vanity);bow('Drawer bow handle',(x,.88,.43),.22,gold,vanity)
heart('Gold heart mirror frame',(0,2.25,-.32),1.10,gold,vanity)
heart('Reflective heart mirror',(0,2.25,-.21),1.02,mirror,vanity)
for i in range(18):
 t=i*math.tau/18;x=16*math.sin(t)**3/18;y=(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))/18
 ball('Vanity pearl light',(x*1.13,2.25+y*1.13,-.13),(.057,.057,.057),lamp,vanity,12)
for i,m in enumerate([pink,lilac,rose]):
 ball('Perfume bottle',(-.8+i*.25,1.32,.08),(.09,.13,.065),m,vanity);cylinder('Perfume cap',(-.8+i*.25,1.49,.08),.045,.07,gold,vanity)
box('Vanity stool',(0,.49,.90),(.86,.22,.64),blush,.15,vanity)
for x in [-.30,.30]:
 for z in [.70,1.10]:cylinder('Stool gold leg',(x,.23,z),.025,.43,gold,vanity)
kitty('Vanity mini Kitty',(5.0,1.20,-1.22),.38,ivory,True,-math.pi/2)

# Curved princess reading sofa with giant plush and a tea table.
sofa=group('Cloud sofa',(-4.45,0,1.68),.40)
box('Sofa base',(0,.36,0),(2.6,.47,1.3),ivory,.20,sofa)
box('Sofa velvet seat',(0,.65,.05),(2.4,.27,1.16),blush,.20,sofa)
for x in [-.68,0,.68]:heart('Sofa heart back',(x,1.32,-.46),.73,pink,sofa)
for x in [-1.17,1.17]:ball('Sofa scroll arm',(x,.91,0),(.22,.24,.72),blush,sofa)
kitty('Giant hug Kitty',(-4.38,.77,1.52),1.05,pink,True,.4)
tea=group('Tea party',(-2.85,0,3.38))
cylinder('Tea table pearl top',(0,.79,0),.77,.095,ivory,tea)
cylinder('Tea table pedestal',(0,.42,0),.085,.72,gold,tea)
ring('Tea table gilt rim',(0,.846,0),.74,.74,.018,gold,tea)
for x in [-.36,.34]:
 cylinder('Tea cup',(x,.94,.13),.085,.16,white,tea,.10);ring('Tea saucer',(x,.859,.13),.145,.145,.009,gold,tea)
 curve('Tea cup handle',[(x+.085,1.00,.13),(x+.15,.97,.13),(x+.09,.89,.13)],.015,gold,tea)
ball('Tea pot',(0,1.01,-.25),(.15,.18,.13),pale,tea);ball('Tea lid',(0,1.18,-.25),(.10,.035,.10),gold,tea)
curve('Tea spout',[(.1,1.0,-.25),(.22,1.09,-.25),(.25,1.14,-.25)],.035,ivory,tea)
for i in range(5):
 x=-.35+i*.14;cylinder('Macaron',(x,.89,-.03),.055,.055,[pink,lilac,mint][i%3],tea)

# Four photographic artworks share one packed texture atlas.
gallery=material('Hello Kitty photo atlas',(1,1,1),0,.77)
im=bpy.data.images.load(os.path.join(OUT,'kitty-gallery.png'));im.pack()
bs=next(n for n in gallery.node_tree.nodes if n.type=='BSDF_PRINCIPLED');tex=gallery.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;gallery.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
def photo(n,p,size,index,angle=0):
 g=group(n,p,angle);w=size;h=size
 box('Gilded photo backing',(0,0,0),(w+.22,h+.22,.13),gold,.045,g)
 box('Pearl photo mat',(0,0,.08),(w+.11,h+.11,.06),ivory,.025,g)
 ob=mesh('Kitty photograph',[(-w/2,-h/2,.12),(w/2,-h/2,.12),(w/2,h/2,.12),(-w/2,h/2,.12)],[(0,1,2,3)],gallery,g)
 uv=ob.data.uv_layers.new();col=index%2;row=index//2
 for loop,(u,v) in zip(uv.data,[(0,0),(1,0),(1,1),(0,1)]):loop.uv=((col+u)/2,(1-row+v)/2)
 bow('Photo frame ribbon',(0,h/2+.17,.10),.55,pink,g)
 for x in [-w/2-.08,w/2+.08]:
  for y in [-h/2-.08,h/2+.08]:roseflower((x,y,.11),.09,g)
 return g
for i in range(4):photo('Gallery_'+str(i),(6.76,2.95,(i-1.5)*1.85+1.40),1.33,i,-math.pi/2)
for i in range(2):photo('Kitty memory portrait',(-6.76,3.4,1+i*2.65),1.6,i+2,math.pi/2)

# A celebration console: gift, illuminated 500, and a wind-up Kitty music box.
console=group('Anniversary console',(3.12,0,4.65),math.pi)
box('Console top',(0,.95,0),(2.5,.12,.86),ivory,.10,console)
for x in [-1.04,1.04]:curve('Console bowed leg',[(x,.9,0),(x*.9,.48,0),(x,.1,.04)],.065,gold,console)
box('Pink gift',(0,1.23,0),(.65,.45,.53),blush,.055,console)
box('Gift ribbon',(0,1.23,.274),(.075,.46,.015),gold,.006,console)
bow('Gift bow',(0,1.49,.04),.55,pink,console)
plaque('500',(0,1.89,-.20),.30,gold,console)
music=group('Kitty_music_box',(4.01,1.02,4.60))
cylinder('Music box base',(0,.12,0),.37,.20,pale,music)
ring('Music box rim',(0,.23,0),.34,.34,.020,gold,music)
o=kitty('Music box Kitty',(0,.23,0),.42,lilac,True);o.parent=music
photo('Desktop Kitty photo',(2.23,1.40,4.75),.53,3,math.pi)

# An oversized welcoming ribbon above the door and a cloud mobile overhead.
door=group('Cloud return door',(0,0,6.83),math.pi)
box('Rose door',(0,1.60,0),(2.1,3.2,.13),pink,.12,door)
for x in [-1.17,1.17]:box('Door pearl jamb',(x,1.70,.04),(.14,3.5,.18),ivory,.04,door)
bow('Welcome giant ribbon',(0,3.75,.10),2.20,blush,door)
heart('Door heart window',(0,2.12,.13),.50,ivory,door)
ball('Door knob',(.77,1.45,.15),(.065,.065,.065),gold,door)
plaque('A ROOM JUST FOR YOU',(0,3.17,.15),.10,ivory,door)
for a in range(8):
 angle=a*math.tau/8;x=math.cos(angle)*1.40;z=math.sin(angle)*1.40+.4
 curve('Chandelier pearl arm',[(0,5.15,.4),(x*.5,4.60,z*.5),(x,4.72,z)],.022,gold)
 ball('Chandelier pearl',(x,4.77,z),(.11,.13,.11),lamp)
 curve('Hanging pearl strand',[(x,4.70,z),(x*.91,4.24,z),(x*.88,4.00,z)],.006,gold)
 heart('Hanging blush heart',(x*.88,3.93,z),.12,blush)
for y in [5.2,5.35,5.50]:ball('Chandelier centre pearl',(0,y,.4),(.12,.12,.12),ivory)
ring('Ceiling rose ring',(0,5.70,.4),2.15,2.15,.06,gold)
for i in range(12):
 a=i*math.tau/12;cloud((math.cos(a)*4.4,5.20,math.sin(a)*4.8),.55)

# Side flowers and small bow details make the space feel collected, not empty.
for x,z in [(-2.45,-4.9),(2.45,-4.9),(-5.8,4.7)]:
 cylinder('Pearl flower pedestal',(x,.58,z),.23,1.1,ivory)
 ball('Flower vase',(x,1.27,z),(.19,.25,.19),pale)
 for j in range(8):
  a=j*math.tau/8;roseflower((x+math.cos(a)*.21,1.70+random.random()*.15,z+math.sin(a)*.21),.14)
  curve('Rose stem',[(x,1.4,z),(x+math.cos(a)*.2,1.75,z+math.sin(a)*.2)],.012,green)

# Keep the editable hierarchy in the native file before making web batches.
print('Palace geometry created:',len(scene.objects),flush=True)
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','hayoung-kitty-heaven-editable.blend'))
# Bake all selected geometry in a single operation instead of repeated dependency graph updates.
bpy.ops.object.select_all(action='DESELECT')
for o in list(scene.objects):
 if o.type in {'MESH','CURVE','FONT'}:
  bpy.context.view_layer.objects.active=o;o.select_set(True)
bpy.ops.object.convert(target='MESH')
print('Palace modifiers baked',flush=True)
def under(o,root):
 while o:
  if o==root:return True
  o=o.parent
 return False
batches={}
for o in list(scene.objects):
 if o.type=='MESH':
  # Joining a shared datablock can also mutate an unselected music-box instance.
  # Make web batches independent while keeping linked parts in the editable source.
  o.data=o.data.copy()
  key=('Music' if under(o,music) else 'Palace',o.active_material.name)
  batches.setdefault(key,[]).append(o)
for (kind,matname),obs in batches.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:
  matrix=o.matrix_world.copy();o.parent=None;o.matrix_world=matrix;o.select_set(True)
 bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join();o=bpy.context.object;o.name=kind+'_'+matname
 if kind=='Music':matrix=o.matrix_world.copy();o.parent=music;o.matrix_world=matrix
for o in list(scene.objects):
 if o.type=='EMPTY' and not o.children and o!=music:bpy.data.objects.remove(o,do_unlink=True)

# Native Blender lighting/camera, also usable for high-resolution renders.
scene.world=bpy.data.worlds.new('Pearl sky');scene.world.use_nodes=True
bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs['Color'].default_value=(.66,.75,1,1);bg.inputs['Strength'].default_value=.55
def area(n,p,energy,size,target):
 data=bpy.data.lights.new(n,'AREA');data.energy=energy;data.shape='DISK';data.size=size
 o=bpy.data.objects.new(n,data);scene.collection.objects.link(o);o.location=xyz(p);o.rotation_euler=(Vector(xyz(target))-o.location).to_track_quat('-Z','Y').to_euler()
area('Cloud daylight',(0,5.45,0),1800,8,(0,0,-1))
area('Rose window glow',(-5,3.8,-4),950,5,(0,1,0))
area('Portrait fill',(5,3.9,3),1000,5,(0,1,-3))
data=bpy.data.cameras.new('Princess room camera');cam=bpy.data.objects.new('Princess room camera',data);scene.collection.objects.link(cam)
cam.location=xyz((.4,2.4,6.0));cam.rotation_euler=(Vector(xyz((0,2.4,-3)))-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=20;scene.camera=cam
try:scene.render.engine='CYCLES'
except TypeError:pass
scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1440;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.filepath=os.path.join(ROOT,'test-results','princess-blender.png')
for area_ui in bpy.context.screen.areas:
 if area_ui.type=='VIEW_3D':
  area_ui.spaces.active.region_3d.view_perspective='CAMERA';area_ui.spaces.active.shading.type='MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','hayoung-kitty-heaven.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'kitty-heaven.glb'),export_format='GLB',use_active_scene=True,export_cameras=False,export_lights=False,export_extras=True,export_apply=True)
report={'scene':scene.name,'meshes':sum(o.type=='MESH' for o in scene.objects),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in scene.objects if o.type=='MESH'),'file':'kitty-heaven.glb'}
print(json.dumps(report));open(os.path.join(ROOT,'test-results','princess-model.json'),'w').write(json.dumps(report,indent=2))
if '--render-preview' in __import__('sys').argv:bpy.ops.render.render(write_still=True)
