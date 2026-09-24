"""401-500 / Stop 01: Sungsimdang-inspired escape-room environment.
Original geometry. Official product catalogue checked 2026-09-24.
Creates a NEW scene; leaves every existing scene untouched. Coordinates: Y up.
"""
import bpy, math, random, os, json
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
random.seed(450)
scene=bpy.data.scenes.new('Day_500_01_Sungsimdang')
bpy.context.window.scene=scene
M={}; B={}; groups={}; collections={}
def xyz(p): return (p[0],-p[2],p[1])
def col(name):
 if name not in collections:
  c=bpy.data.collections.new(name); scene.collection.children.link(c); collections[name]=c
 return collections[name]
def mat(name,color,rough=.5,metal=0,emit=0,noise=0):
 m=bpy.data.materials.new('SSD / '+name); m.diffuse_color=(*color,1);m.use_nodes=True
 n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 n.inputs['Base Color'].default_value=(*color,1);n.inputs['Roughness'].default_value=rough;n.inputs['Metallic'].default_value=metal
 if emit:n.inputs['Emission Color'].default_value=(*color,1);n.inputs['Emission Strength'].default_value=emit
 if noise:
  t=m.node_tree.nodes.new('ShaderNodeTexNoise');t.noise_dimensions='3D';t.inputs['Scale'].default_value=noise;t.inputs['Detail'].default_value=3
  ramp=m.node_tree.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.15;ramp.color_ramp.elements[0].color=(*(v*.48 for v in color),1);ramp.color_ramp.elements[1].position=.84;ramp.color_ramp.elements[1].color=(*(min(1,v*1.26) for v in color),1)
  m.node_tree.links.new(t.outputs['Fac'],ramp.inputs['Fac']);m.node_tree.links.new(ramp.outputs['Color'],n.inputs['Base Color'])
  b=m.node_tree.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=.2;b.inputs['Distance'].default_value=.008
  m.node_tree.links.new(t.outputs['Fac'],b.inputs['Height']);m.node_tree.links.new(b.outputs['Normal'],n.inputs['Normal'])
 M[name]=m;return name
cream=mat('Warm lime plaster',(.79,.70,.55),.86,noise=25)
ivory=mat('Ivory enamel',(.9,.82,.67),.35)
oak=mat('Honey oak',(.38,.18,.065),.5,noise=5)
dark=mat('Roasted walnut',(.105,.044,.016),.5)
gold=mat('Aged brass',(.61,.35,.105),.31,.75)
green=mat('Deep olive',(.12,.16,.085),.65)
ink=mat('Espresso ink',(.04,.026,.015),.8)
paper=mat('Parchment',(.94,.84,.62),.9)
traymat=mat('Brushed baking trays',(.38,.40,.37),.4,.65)
tile1=mat('Cream terrazzo',(.63,.56,.43),.62,noise=90)
tile2=mat('Taupe terrazzo',(.43,.37,.27),.65,noise=90)
yellow=mat('Soboro yellow sleeve',(.92,.59,.075),.83)
purple=mat('Sweet potato purple sleeve',(.35,.12,.27),.8)
glass=mat('Window blue',(.30,.47,.48),.19,.3)
opal=mat('Warm opal',(.99,.82,.48),.28,emit=1.8)
red=mat('Locked amber',(.8,.12,.028),.3,emit=.8)
crust=mat('Golden fried crust',(.58,.24,.038),.75,noise=20)
crumb=mat('Golden crumble',(.77,.38,.085),.78,noise=16)
toast=mat('Deep toasted edges',(.29,.09,.013),.73,noise=24)
bun=mat('Baked bun',(.66,.32,.082),.48,noise=7)
dough=mat('Fresh crumb',(.91,.69,.32),.8,noise=33)
roe=mat('Pollock roe butter',(.73,.32,.11),.57,noise=30)
nori=mat('Seaweed strips',(.023,.058,.013),.75)
chive=mat('Chives',(.09,.20,.028),.72)
sesame=mat('Sesame seeds',(.78,.62,.32),.6)
butter=mat('Glazed pastry',(.62,.28,.047),.34,noise=10)

def add(v,f,m,g,smooth=False):
 vs,fs,ss=B.setdefault((g,m),([],[],[]));o=len(vs);vs.extend(xyz(p) for p in v);fs.extend(tuple(o+i for i in face) for face in f);ss.extend([smooth]*len(f))
def box(p,s,m,g):
 x,y,z=p;a,b,c=[v/2 for v in s]
 v=[(x+i*a,y+j*b,z+k*c) for i,j,k in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
 add(v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],m,g)
def tube(a,b,r,m,g,n=12,r2=None):
 a,b=Vector(a),Vector(b);d=(b-a).normalized();u=d.cross(Vector((0,1,0)) if abs(d.y)<.94 else Vector((1,0,0))).normalized();v=d.cross(u).normalized()
 vv=[p+(u*math.cos(i*math.tau/n)+v*math.sin(i*math.tau/n))*rr for p,rr in [(a,r),(b,r if r2 is None else r2)] for i in range(n)]
 add(vv,[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],m,g,True)
def ball(p,s,m,g,n=20,k=12,wobble=0):
 vv=[]
 for j in range(k+1):
  for i in range(n):
   a=i*math.tau/n;t=j*math.pi/k;w=1+wobble*math.sin(a*7+math.sin(t*9))*math.sin(t)
   vv.append((p[0]+s[0]*math.sin(t)*math.cos(a)*w,p[1]+s[1]*math.cos(t),p[2]+s[2]*math.sin(t)*math.sin(a)*w))
 add(vv,[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(k) for i in range(n)],m,g,True)
def path(points,r,m,g,n=6):
 for a,b in zip(points,points[1:]):tube(a,b,r,m,g,n)
def ring(p,r,w,m,g,vertical=False):
 pts=[(p[0]+r*math.cos(i*math.tau/64),p[1]+(r*math.sin(i*math.tau/64) if vertical else 0),p[2]+(0 if vertical else r*math.sin(i*math.tau/64))) for i in range(65)]
 path(pts,w,m,g)
font=bpy.data.fonts.load('C:/Windows/Fonts/malgun.ttf',check_existing=True)
font_b=bpy.data.fonts.load('C:/Windows/Fonts/malgunbd.ttf',check_existing=True)
def text(body,p,size,m=ink,g='04_Signs',bold=False):
 c=bpy.data.curves.new('SSD text','FONT');c.body=body;c.size=size;c.align_x='CENTER';c.extrude=.0006;c.font=font_b if bold else font
 o=bpy.data.objects.new(body,c);col(g).objects.link(o);o.location=xyz(p);o.rotation_euler=(math.pi/2,0,0);c.materials.append(M[m]);return o
def flush(prefix=None,collection='01_Architecture',bevel=0):
 for (g,m),(vs,fs,ss) in list(B.items()):
  if prefix and not g.startswith(prefix):continue
  mesh=bpy.data.meshes.new(g+' / '+m);mesh.from_pydata(vs,[],fs);mesh.materials.append(M[m]);mesh.update()
  o=bpy.data.objects.new(g+' / '+m,mesh);col(collection).objects.link(o)
  for p,s in zip(mesh.polygons,ss):p.use_smooth=s
  if bevel:
   mod=o.modifiers.new('Soft crafted edges','BEVEL');mod.width=bevel;mod.segments=2
  groups.setdefault(g,[]).append(o);del B[(g,m)]
def tray(x,z,y,w=1.12,d=.82,g='Display'):
 box((x,y,z),(w,.025,d),traymat,g);box((x,y+.016,z),(w-.045,.008,d-.045),paper,g)
 for xx in [x-w/2,x+w/2]:box((xx,y+.04,z),(.018,.07,d),traymat,g)
 for zz in [z-d/2,z+d/2]:box((x,y+.04,zz),(w,.07,.018),traymat,g)
def label(body,x,z,y,index):
 box((x,y,z),(.96,.29,.025),paper,'Labels');box((x,y+.148,z),(.97,.018,.03),gold,'Labels')
 text(body,(x,y+.015,z+.018),.102,bold=True)
 text('성심당   /   '+index,(x,y-.09,z+.019),.048,green)

# Architecture: open front and removable ceiling for editing / presentation.
box((0,-.16,0),(12,.32,10.1),dark,'Architecture')
for i in range(12):
 for j in range(10):box((-5.5+i,-.009,-4.5+j),(.985,.035,.985),tile1 if (i+j)%2 else tile2,'Tiles')
box((-1.3,2.1,-4.85),(9.4,4.2,.22),cream,'Architecture')
box((5.58,2.1,-4.85),(.84,4.2,.22),cream,'Architecture')
box((4.3,3.72,-4.85),(1.74,.96,.22),cream,'Architecture')
box((-5.9,2.1,0),(.22,4.2,9.9),cream,'Architecture')
box((5.9,.68,0),(.22,1.36,9.9),cream,'Cutaway side wall')
for z in [-4.69]:
 box((-1.275,.48,z),(9.35,.88,.09),green,'Wainscot');box((-1.275,.98,z),(9.35,.06,.12),oak,'Wainscot')
 for x in range(-5,4):box((x,.50,z+.055),(.025,.77,.025),gold,'Wainscot')
box((-5.72,.48,0),(.12,.90,9.7),green,'Wainscot')
box((-5.7,.98,0),(.14,.06,9.7),oak,'Wainscot')
for z in [-3.7,-1.3,1.1,3.5]:
 box((-5.71,2.52,z),(.06,2.2,1.85),dark,'Window frames')
 box((-5.65,2.52,z),(.03,2.03,1.67),glass,'Window panes')
 for zz in [z-.87,z,z+.87]:box((-5.61,2.52,zz),(.07,2.14,.055),gold,'Window mullions')
 box((-5.61,2.6,z),(.07,.045,1.8),gold,'Window mullions')
 box((-5.55,1.39,z),(.36,.09,2),oak,'Window sills')
for z in [-4.6,-1.6,1.6,4.6]:box((0,4.07,z),(11.8,.16,.14),dark,'Ceiling beams')
for x in [-5.7,0,5.7]:box((x,4.08,0),(.12,.18,9.7),dark,'Ceiling beams')
box((0,4.24,0),(12,.16,10),cream,'Removable ceiling')
flush('Removable',collection='00_Ceiling_toggle')
col('00_Ceiling_toggle').hide_render=True;col('00_Ceiling_toggle').hide_viewport=True
# Full walls are available for a playable export; hidden only in the dollhouse view.
box((5.9,2.77,0),(.22,2.82,9.9),cream,'Full enclosure')
for x in [-3.55,3.55]:box((x,2.1,4.95),(4.9,4.2,.22),cream,'Full enclosure')
box((0,3.64,4.95),(2.2,1.12,.22),cream,'Full enclosure')
flush('Full enclosure',collection='00_Full_walls_toggle',bevel=.008)
col('00_Full_walls_toggle').hide_render=True;col('00_Full_walls_toggle').hide_viewport=True
# Prominent brand plaque and wheat medallions, original lettering arrangement.
box((-1.0,3.10,-4.62),(6.6,1.37,.13),dark,'Brand plaque')
box((-1.0,3.10,-4.54),(6.44,1.21,.025),ivory,'Brand plaque')
text('성 심 당',(-1,3.13,-4.49),.49,dark,bold=True)
text('S U N G S I M D A N G   ·   D A E J E O N',(-1,2.91,-4.487),.105,dark)
text('1956',(-1,2.69,-4.487),.125,green)
for sx in [-3.5,1.5]:
 for side in [-1,1]:
  path([(sx,2.72,-4.47),(sx+side*.11,3.03,-4.47),(sx+side*.21,3.39,-4.47)],.012,gold,'Wheat insignia')
  for j in range(5):ball((sx+side*(.07+.024*j),2.93+j*.085,-4.47),(.045,.065,.012),gold,'Wheat insignia',12,8)

# Back bakery rack: brass rails and wooden shelves.
for x in [-4.95,-2.3,.35]:box((x,1.42,-4.1),(.08,2.65,.64),dark,'Back rack')
for y in [.21,.84,1.50,2.16]:
 box((-2.3,y,-4.02),(5.4,.095,1.0),oak,'Back rack')
 tube((-5,y+.1,-3.55),(.4,y+.1,-3.55),.014,gold,'Back rack')
for x in [-4.3,-2.3,-.3]:
 for y in [.9,1.56,2.22]:tray(x,-4.00,y,1.64,.68,'Back trays')
text('갓 구운 빵',(-2.3,2.48,-4.00),.20,ivory,bold=True)

# Central bread island, no obstruction to the two circulation aisles.
box((-.65,.52,.65),(4.95,1.04,2.78),green,'Island cabinetry')
box((-.65,.10,.65),(5.03,.13,2.86),dark,'Island cabinetry')
box((-.65,1.095,.65),(5.23,.14,2.98),oak,'Island countertop')
for x in [-2.93,-1.8,-.67,.46,1.59]:
 box((x,.56,2.047),(.022,.78,.022),gold,'Island fluting')
 for dx in [-.42,-.28,-.14,0,.14,.28,.42]:box((x+dx,.56,2.06),(.024,.73,.025),oak,'Island fluting')
box((-.65,1.16,.65),(5.11,.018,2.86),ivory,'Island marble')

# Cash wrap, point-of-sale, paper bags, stacked trays and tongs.
box((4.0,.50,.85),(2.4,1,2.1),oak,'Checkout')
box((4.0,1.05,.85),(2.56,.13,2.24),ivory,'Checkout')
box((4.0,.5,1.91),(2.14,.75,.025),green,'Checkout')
text('계산 · 포장',(4,.64,1.935),.19,paper,bold=True)
box((3.65,1.14,.42),(.50,.05,.35),ink,'POS')
box((3.65,1.39,.34),(.07,.45,.07),ink,'POS')
box((3.65,1.65,.32),(.64,.42,.06),ink,'POS')
box((3.65,1.65,.359),(.57,.34,.013),green,'POS')
text('성심당',(3.65,1.66,.37),.085,paper)
text('포장해 드릴게요',(3.65,1.56,.37),.039,paper)
for x,z in [(4.6,.3),(4.65,1.05)]:
 box((x,1.4,z),(.48,.61,.29),paper,'Paper bags')
 text('성심당',(x,1.43,z+.151),.083,dark)
 text('DAEJEON',(x,1.32,z+.152),.039,green)
 for dz in [-.09,.09]:
  path([(x-.12,1.7,z+dz),(x-.12,1.83,z+dz),(x+.12,1.83,z+dz),(x+.12,1.7,z+dz)],.011,dark,'Bag handles')
box((-4.53,.59,3.40),(1.55,1.18,1.05),oak,'Tray station')
for j in range(7):tray(-4.55,3.4,1.20+j*.035,1.24,.82,'Stacked trays')
for x in [-4.83,-4.38]:
 path([(x,1.49,3.40),(x-.07,1.5,3.68),(x,1.5,3.95),(x+.07,1.5,3.68)],.014,traymat,'Tongs')
text('쟁반과 집게',(-4.5,.83,3.94),.15,paper,bold=True)
text('01  /  대전',(-4.55,.59,3.94),.09,paper)

# Pendants: low shades only over the counters, airy circulation above the aisles.
for x,z in [(-2.25,.1),(.8,.1),(4.0,.6),(-2.4,-2.9)]:
 tube((x,4.07,z),(x,3.24,z),.016,ink,'Pendant')
 tube((x,3.05,z),(x,3.28,z),.34,green,'Pendant',40,.085)
 tube((x,3.035,z),(x,3.054,z),.305,opal,'Pendant',40)
 ring((x,3.05,z),.34,.014,gold,'Pendant')

# Door pivot stores the future gameplay dependency; no invented puzzle solution.
for x in [3.48,5.12]:box((x,1.6,-4.56),(.12,3.2,.16),gold,'Gate frame')
box((4.3,3.2,-4.56),(1.76,.12,.16),gold,'Gate frame')
box((4.3,1.52,-4.52),(1.48,3.0,.08),green,'Gate 01 to 02')
box((4.3,2.07,-4.465),(1.16,1.32,.023),glass,'Gate 01 to 02')
box((4.3,.62,-4.465),(1.16,.79,.023),oak,'Gate 01 to 02')
tube((4.82,1.22,-4.38),(4.82,1.63,-4.38),.024,gold,'Gate 01 to 02')
text('02',(4.3,2.20,-4.435),.31,paper,bold=True)
text('POSTECH',(4.3,1.97,-4.432),.115,paper)
text('JUNCTION KOREA 2026',(4.3,1.80,-4.432),.066,paper)
text('다음 기억으로',(4.3,.77,-4.427),.113,paper)
box((5.39,1.6,-4.5),(.24,.39,.07),dark,'Door reader')
ball((5.39,1.69,-4.449),(.026,.026,.012),red,'Door reader',12,8)
text('잠김',(5.39,1.52,-4.446),.045,paper)

# Product masters: dimensions are modelling estimates, each item remains independent.
PRODUCTS=[('soboro','튀김소보로','523080',1700),('guma','튀소구마','523262',1700),('buchu','판타롱부추빵','523168',2000),('baguette','명란바게트','523165',3800),('meari','보문산메아리','523114',6000)]
def fried(g,sweet=False):
 ball((0,.075,0),(.18,.086,.169),crust,g,32,18,.025)
 for i in range(175):
  a=random.random()*math.tau;r=math.sqrt(random.random())*.167;y=.078+.079*math.sqrt(max(0,1-(r/.18)**2));s=random.uniform(.008,.022)
  ball((r*math.cos(a),y,r*math.sin(a)),(s,s*.7,s*.8),random.choice([crumb,crumb,crust,toast]),g,7,5,.1)
 # Lower paper pocket, with recognizable yellow / purple sleeve.
 box((0,.041,.097),(.36,.088,.009),purple if sweet else yellow,g)
 box((0,.025,-.137),(.36,.055,.008),paper,g)
 for x in [-.174,.174]:box((x,.036,-.02),(.008,.08,.26),paper,g)
def make_buchu(g):
 # Official product has a central round vent and sesame on its golden domed top.
 n=40;k=22;v=[]
 for j in range(k+1):
  t=.17+(math.pi-.17)*j/k
  for i in range(n):
   a=i*math.tau/n;w=1+.012*math.sin(a*7)
   v.append((.17*math.sin(t)*math.cos(a)*w,.071+.078*math.cos(t),.163*math.sin(t)*math.sin(a)*w))
 add(v,[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(k) for i in range(n)],bun,g,True)
 ball((0,.120,0),(.030,.014,.029),toast,g,20,10)
 for i in range(12):
  x=random.uniform(-.02,.02);z=random.uniform(-.018,.018);box((x,.132,z),(.009,.005,.013),chive,g)
 for i in range(32):
  a=random.uniform(-1.0,1.2);r=random.uniform(.06,.14);x=r*math.cos(a);z=r*math.sin(a);y=.071+.078*math.sqrt(max(0,1-(r/.17)**2))
  ball((x,y+.002,z),(.004,.002,.008),sesame,g,6,4)
 box((0,.035,.108),(.34,.07,.008),paper,g)
def make_baguette(g):
 ball((0,.073,0),(.095,.073,.34),crust,g,40,20,.014)
 ball((0,.125,0),(.060,.023,.302),roe,g,32,16,.04)
 for i in range(70):
  z=random.uniform(-.28,.28);x=random.uniform(-.045,.045);l=random.uniform(.02,.065)
  path([(x-.01,.145,z-l/2),(x+.01,.151,z),(x+.006,.145,z+l/2)],.0035,nori,g,4)
 for z in [-.18,-.055,.07,.185]:
  path([(-.087,.10,z-.035),(-.07,.129,z-.015),(-.054,.136,z)],.009,dough,g)
def make_meari(g):
 # Tall rolled laminated pastry, with irregular fluted sides and spiral crown.
 n=80;levels=20;vv=[]
 for j in range(levels+1):
  h=.015+j*.26/levels;r=.205*(1-.21*(j/levels)**2)
  for i in range(n):
   a=i*math.tau/n;rr=r*(1+.021*math.sin(a*29+j*.8)+.013*math.sin(j*2.6))
   vv.append((rr*math.cos(a),h,rr*math.sin(a)))
 add(vv,[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(levels) for i in range(n)]+[tuple(range(levels*n,(levels+1)*n))],butter,g,True)
 for j in range(17):
  y=.026+j*.014;r=.203*(1-.21*((y-.015)/.26)**2)
  ring((0,y,0),r,.004,toast if j%4==0 else crust,g)
 pts=[]
 for i in range(361):
  a=i*math.tau/60;r=.164*(1-i/385);h=.276+.025*(i/360)
  pts.append((r*math.cos(a),h,r*math.sin(a)))
 path(pts,.007,crust,g,6)
 ring((0,.279,0),.167,.010,butter,g)
for id,name,code,price in PRODUCTS:
 g='BreadMaster_'+id
 if id in ['soboro','guma']:fried(g,id=='guma')
 elif id=='buchu':make_buchu(g)
 elif id=='baguette':make_baguette(g)
 else:make_meari(g)
 flush(g,'05_Bread_individual')
 meshes=[]
 # Join material parts into one mesh, preserving per-face material assignments.
 vs=[];fs=[];mids=[];ms=[];smooth=[]
 for o in groups[g]:
  mi=len(ms);ms.append(o.data.materials[0]);off=len(vs);vs.extend(tuple(v.co) for v in o.data.vertices);fs.extend(tuple(off+i for i in f.vertices) for f in o.data.polygons);mids.extend([mi]*len(o.data.polygons));smooth.extend([f.use_smooth for f in o.data.polygons]);bpy.data.objects.remove(o,do_unlink=True)
 mesh=bpy.data.meshes.new(g);mesh.from_pydata(vs,[],fs)
 for m in ms:mesh.materials.append(m)
 for f,mi,sm in zip(mesh.polygons,mids,smooth):f.material_index=mi;f.use_smooth=sm
 groups[g]=mesh
def bread(id,p,angle=0):
 meta=next(q for q in PRODUCTS if q[0]==id);o=bpy.data.objects.new('Bread_'+id,groups['BreadMaster_'+id]);col('05_Bread_individual').objects.link(o);o.location=xyz(p);o.rotation_euler.z=angle
 o['product_name']=meta[1];o['catalogue_url']='https://www.sungsimdangmall.co.kr/shop/product/product_view?product_cd='+meta[2];o['verified_date']='2026-09-24';o['interactable']='inspect_bread';return o

display=[('soboro',-2.25,1.45),('guma',-.65,1.45),('buchu',.95,1.45),('baguette',-2.25,-.18),('meari',-.65,-.18),('soboro',.95,-.18)]
for ii,(id,x,z) in enumerate(display):
 tray(x,z,1.20,1.40,1.14,'Island trays')
 if id=='baguette':
  for dx in [-.43,-.145,.145,.43]:bread(id,(x+dx,1.23,z-.04),.05)
 elif id=='meari':
  for dx in [-.31,.31]:
   for dz in [-.27,.27]:bread(id,(x+dx,1.23,z+dz),random.random())
 else:
  for dx in [-.44,0,.44]:
   for dz in [-.29,.10]:bread(id,(x+dx,1.23,z+dz),random.uniform(-.1,.1))
 meta=next(q for q in PRODUCTS if q[0]==id)
 label(meta[1],x,z+.64,1.31,f'{ii+1:02d}')

for row,y in enumerate([.94,1.60,2.26]):
 for idx,x in enumerate([-4.3,-2.3,-.3]):
  id=['soboro','buchu','guma','meari','baguette'][(row+idx)%5]
  for dx in [-.57,0,.57]:bread(id,(x+dx,y,-4),math.pi/2 if id=='baguette' else random.uniform(-.2,.2))
# Packaged gift boxes under the rack and at checkout.
for i in range(5):
 x=-4.48+i*.96
 box((x,.47,-4),(.80,.40,.59),paper,'Gift boxes')
 box((x,.47,-3.698),(.64,.30,.006),green,'Gift boxes')
 text('성심당',(x,.49,-3.69),.10,paper)
 text('대전의 마음',(x,.385,-3.687),.041,paper)

# Stage route in the room is a plaque; only the next door is reachable.
box((2.19,2.19,-4.64),(1.18,1.38,.06),green,'Route plaque')
text('우리의 다음 장소',(2.19,2.65,-4.59),.106,paper,bold=True)
for y,t in [(2.38,'01  대전 성심당'),(2.12,'02  POSTECH'),(1.93,'JUNCTION KOREA 2026'),(1.66,'03  PC방')]:text(t,(2.19,y,-4.59),.076,paper)
flush(collection='02_Furniture',bevel=.009)

# Logical hierarchy for the swinging door. Positions stay unchanged when parenting.
gate=bpy.data.objects.new('Gate_01_to_02_Pivot',None);col('06_Sequential_gates').objects.link(gate);gate.location=xyz((3.56,0,-4.52));gate['locked']=True;gate['requires']='sungsimdang_complete';gate['destination']='02_postech_junction_korea_2026'
bpy.context.view_layer.update()
for o in groups.get('Gate 01 to 02',[]):
 o.parent=gate;o.matrix_parent_inverse=gate.matrix_world.inverted()
for o in scene.objects:
 if o.type=='FONT' and o.data.body in ['02','POSTECH','JUNCTION KOREA 2026','다음 기억으로']:
  mw=o.matrix_world.copy();o.parent=gate;o.matrix_world=mw
# Sleeve lettering is original geometry, not a pasted photograph.
for o in list(scene.objects):
 if o.get('product_name') in ['튀김소보로','튀소구마','판타롱부추빵']:
  label_o=text(o['product_name'],(0,0,0),.035,ink,g='05_Bread_individual',bold=True)
  label_o.parent=o;label_o.location=xyz((0,.025,.113 if o['product_name']=='판타롱부추빵' else .106))
for name,pos,props in [('Spawn_01',(0,1.65,4.1),{'stage':1}),('Stage_02_Anchor',(0,0,-15),{'stage':2,'title':'POSTECH / JUNCTION KOREA 2026','requires':'sungsimdang_complete'}),('Stage_03_Anchor',(0,0,-27),{'stage':3,'title':'PC방','requires':'junction_complete'})]:
 o=bpy.data.objects.new(name,None);col('07_Integration_anchors').objects.link(o);o.location=xyz(pos)
 for k,v in props.items():o[k]=v

def light(name,p,power,size,target,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color;o=bpy.data.objects.new(name,d);col('08_Lighting').objects.link(o);o.location=xyz(p);o.rotation_euler=(Vector(xyz(target))-o.location).to_track_quat('-Z','Y').to_euler();return o
light('Front soft daylight',(0,6,6),1600,8,(0,0,0),(1,.91,.76))
light('Left window daylight',(-5,3.5,1),1100,5,(0,1,0),(.79,.88,1))
light('Bakery warm bounce',(-1,3.8,-2.7),850,5,(-1,1,0),(1,.77,.48))
light('Till fill',(4,3.5,2),500,3,(3,1,-2),(1,.86,.65))
world=bpy.data.worlds.new('SSD / Morning');world.use_nodes=True
bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs['Color'].default_value=(.27,.32,.39,1);bg.inputs['Strength'].default_value=.35;scene.world=world
def camera(name,p,target,lens):
 d=bpy.data.cameras.new(name);d.lens=lens;d.clip_end=200;o=bpy.data.objects.new(name,d);col('09_Cameras').objects.link(o);o.location=xyz(p);o.rotation_euler=(Vector(xyz(target))-o.location).to_track_quat('-Z','Y').to_euler();return o
hero=camera('Camera_01_Interior',(7.7,4.85,11.4),(-.4,1.45,-.5),42)
camera('Camera_02_Player',(0,1.68,4.35),(-.4,1.65,-3.5),23)
camera('Camera_03_Bread',(-.75,3.55,4.2),(-.8,1.25,.45),54)
scene.camera=hero
try:scene.render.engine='CYCLES'
except TypeError:pass
scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.view_settings.exposure=-1.35
scene.render.resolution_x=1600;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene['chapter']='401-500';scene['stage_order']='01_sungsimdang -> 02_postech_junction_korea_2026 -> 03_pc_room'
scene['scope']='Bakery environment and five verified products; later rooms have anchors only; puzzle logic not authored.'
scene['reference_date']='2026-09-24';scene['interior_note']='Creative game layout inspired by Sungsimdang, not a measured replica.'
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':
   area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.type='MATERIAL';area.spaces.active.overlay.show_overlays=False
for f in [font,font_b]:
 if hasattr(f,'pack'):f.pack()
out=os.path.join(ROOT,'blender','day-500-01-sungsimdang.blend')
bpy.ops.wm.save_as_mainfile(filepath=out)
print(json.dumps({'scene':scene.name,'objects':len(scene.objects),'bread_count':len([o for o in scene.objects if o.get('product_name')]),'saved':out},ensure_ascii=False))
