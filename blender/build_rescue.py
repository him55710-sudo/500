"""Editable 201–300 day rescue chapter. Blender 5.2; no existing files/scenes removed."""
import bpy, math, random, os, json, sys
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSET=os.path.join(ROOT,'public','assets','rescue')
sys.path.insert(0,os.path.join(ROOT,'blender'))
from rescue_cabinet import build_glass_cabinet
scene=bpy.data.scenes.new('Day_300_Save_Hyunsu');bpy.context.window.scene=scene
random.seed(300);batches={};mats={};origins={}
def xyz(p):return (p[0],-p[2],p[1])
def mat(name,color,metal=0,rough=.6,emit=0,image=None):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');n.inputs['Base Color'].default_value=(*color,1);n.inputs['Metallic'].default_value=metal;n.inputs['Roughness'].default_value=rough
 if emit:n.inputs['Emission Color'].default_value=(*color,1);n.inputs['Emission Strength'].default_value=emit
 if image:
  t=m.node_tree.nodes.new('ShaderNodeTexImage');t.image=bpy.data.images.load(image,check_existing=True);m.node_tree.links.new(t.outputs['Color'],n.inputs['Base Color'])
 mats[name]=m;return name
cream=mat('Ivory lime plaster',(.83,.79,.69));sage=mat('Hospital sage',(.31,.45,.39));walnut=mat('Walnut',(.23,.11,.056));oak=mat('Real photographed oak',(.85,.78,.65),image=os.path.join(ROOT,'public/assets/wood-floor-color.jpg'))
white=mat('Cotton white',(.93,.92,.87),rough=.88);gold=mat('Brushed warm brass',(.68,.43,.13),.75,.28);steel=mat('Brushed nickel',(.48,.53,.53),.8,.25);navy=mat('Polo navy knit',(.025,.053,.12),rough=.88);charcoal=mat('TOMBOY charcoal wool',(.065,.061,.059),rough=.95)
black=mat('Ink',(.015,.021,.025));rose=mat('Burgundy leather',(.24,.047,.058));green=mat('Emergency green',(.03,.55,.25),emit=.7);red=mat('Emergency amber red',(.85,.095,.025),emit=.3);light=mat('Warm opal lamps',(1,.85,.59),emit=.8);blue=mat('Winter blue glass',(.26,.47,.62),.2,.3);skin=mat('Warm skin',(.67,.43,.30));hair=mat('Dark brown hair',(.035,.022,.017));pink=mat('Lip rose',(.37,.11,.105));pupil=mat('Eyes',(.02,.026,.024));paper=mat('Paper cream',(.94,.91,.8));asphalt=mat('Japanese street',(.13,.15,.16),rough=.95)
def add(v,f,m,root,smooth=False):
 vs,fs,ss=batches.setdefault((root,m),([],[],[]));off=len(vs);vs.extend(xyz(p) for p in v);fs.extend(tuple(off+i for i in face) for face in f);ss.extend([smooth]*len(f))
def box(p,s,m,root):
 x,y,z=p;a,b,c=[v/2 for v in s];v=[(x+i*a,y+j*b,z+k*c) for i,j,k in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]];add(v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],m,root)
def tube(a,b,r,m,root,n=12,r2=None):
 a,b=Vector(a),Vector(b);d=(b-a).normalized();u=d.cross(Vector((0,1,0)) if abs(d.y)<.94 else Vector((1,0,0))).normalized();v=d.cross(u).normalized();verts=[p+(u*math.cos(i*math.tau/n)+v*math.sin(i*math.tau/n))*rr for p,rr in [(a,r),(b,r if r2 is None else r2)] for i in range(n)];add(verts,[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],m,root,True)
def ball(p,s,m,root,n=16,k=10):
 verts=[(p[0]+s[0]*math.sin(j*math.pi/k)*math.cos(i*math.tau/n),p[1]+s[1]*math.cos(j*math.pi/k),p[2]+s[2]*math.sin(j*math.pi/k)*math.sin(i*math.tau/n)) for j in range(k+1) for i in range(n)];add(verts,[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(k) for i in range(n)],m,root,True)
def ring(p,r,thick,m,root,vertical=False):
 for i in range(28):
  a=i*math.tau/28;b=(i+1)*math.tau/28
  q=lambda t:(p[0]+r*math.cos(t),p[1]+(r*math.sin(t) if vertical else 0),p[2]+(0 if vertical else r*math.sin(t)))
  tube(q(a),q(b),thick,m,root,n=6)
def tailored(root,material,rings,opening=0):
 n=32;verts=[]
 for y,w,d in rings:
  for i in range(n+1):
   a=opening+(math.tau-2*opening)*i/n;verts.append((math.sin(a)*w,y,math.cos(a)*d))
 add(verts,[(j*(n+1)+i,j*(n+1)+i+1,(j+1)*(n+1)+i+1,(j+1)*(n+1)+i) for j in range(len(rings)-1) for i in range(n)],material,root,True)
def text(body,p,size,root,material=black,ry=0):
 c=bpy.data.curves.new(body,'FONT');c.body=body;c.size=size;c.align_x='CENTER';c.extrude=.0008
 font='C:/Windows/Fonts/malgun.ttf'
 if os.path.isfile(font):c.font=bpy.data.fonts.load(font,check_existing=True)
 o=bpy.data.objects.new(root+'_'+body,c);scene.collection.objects.link(o);o.location=xyz(p);o.rotation_euler=(math.pi/2,0,ry);o.data.materials.append(mats[material]);return o
# Architectural suite: warm sickroom, winter boutique, dining atlas and Japanese street.
for i,cx in enumerate([0,12,24,36,47]):
 root='Architecture'+str(i);floor=asphalt if i==3 else oak
 box((cx,-.12,0),(12,.24,10),floor,root)
 if i!=3:box((cx,4.25,0),(12,.18,10),cream,root)
 for z in [-5,5]:
  box((cx,2.1,z),(12,4.2,.2),sage if i==0 else cream,root)
  box((cx,.18,z*.985),(12,.30,.12),walnut,root)
  box((cx,3.9,z*.985),(12,.09,.14),gold,root)
  for x in range(-5,6,2):
   box((cx+x,1,z*.975),(.027,1.65,.03),gold,root)
 for x in [-6,6]:
  box((cx+x,2.1,-2.65),(.22,4.2,4.7),cream,root);box((cx+x,2.1,3.65),(.22,4.2,2.7),cream,root);box((cx+x,3.75,1),(.22,.95,2.7),cream,root)
 if i<3:
  for x in [-3,3]:
   tube((cx+x,4.1,0),(cx+x,3.4,0),.018,gold,root);ball((cx+x,3.28,0),(.32,.17,.32),light,root)
  # timber ceiling beams and wall panels
  for z in [-3,0,3]:box((cx,4.05,z),(11.8,.16,.12),walnut,root)
text('201 — 300   /   SAVE HYUNSU',(0,3.48,-4.85),.26,'Title',gold)
text('01   A LITTLE CARE',(-2.9,2.88,-4.18),.16,'CabinetTitle',gold)
# Six trophies remain visible through a hinged glass display cabinet.
for y in [1.02,1.82]:
 for x in [-3.88,-2.92,-1.94]:
  box((x,y,-4.24),(.46,.12,.34),black,'Trophies');tube((x,y+.07,-4.24),(x,y+.3,-4.24),.047,gold,'Trophies');tube((x,y+.28,-4.24),(x,y+.54,-4.24),.055,gold,'Trophies',24,.19);ring((x,y+.53,-4.24),.19,.012,gold,'Trophies');
  for s in [-1,1]:ring((x+s*.18,y+.42,-4.24),.1,.018,gold,'Trophies',True)
  text('대상',(x,y+.02,-4.05),.085,'TrophyPlate',gold)
origins['CabinetDoor']=(-4.3,0,-3.88)
box((-3.15,1.02,-4.55),(.4,.12,.23),white,'Medicine');box((-3.15,1.09,-4.55),(.27,.014,.12),sage,'Medicine')
# Carved bed, upholstered headboard, folded duvet, pillow and bedside props.
box((1.7,.47,-2),(2.45,.20,3.7),walnut,'Bed');box((1.7,.66,-2),(2.34,.26,3.5),white,'Bed');box((1.7,1.12,-3.75),(2.52,1.5,.20),walnut,'Bed');box((1.7,1.18,-3.60),(2.22,.9,.13),sage,'Bed')
for x in [.4,3]:
 for z in [-3.65,-.35]:tube((x,.08,z),(x,1.05 if z< -2 else .63,z),.07,walnut,'Bed')
for x in [.65,1.7,2.75]:ball((x,1.24,-3.5),(.028,.028,.028),gold,'Bed')
ball((1.7,.87,-3.10),(.73,.14,.4),white,'Bed');box((1.7,.89,-1.4),(2.26,.20,2.05),sage,'Duvet')
for i in range(16):tube((.6+i*.14,1.0,-2.4),(.6+i*.14,1.0,-.4),.008,white,'Duvet')
box((3.9,.55,-2.8),(.72,1.1,.65),walnut,'Nightstand');tube((3.9,1.1,-2.8),(3.9,1.56,-2.8),.032,gold,'Nightstand');tube((3.9,1.5,-2.8),(3.9,1.85,-2.8),.25,light,'Nightstand',24,.13)
box((3.76,1.13,-2.53),(.23,.03,.17),paper,'Nightstand');tube((4.10,1.13,-2.54),(4.10,1.35,-2.54),.07,white,'Nightstand')
def human(root,position,cold=False,staff=False):
 origins[root]=position
 cloth=white if cold else charcoal if staff else navy
 tailored(root+'/Torso',cloth,[(.96,.23,.15),(1.20,.26,.16),(1.43,.265,.16),(1.52,.20,.13)]);tube((0,1.50,0),(0,1.69,0),.072,skin,root+'/Neck');tube((0,1.59,0),(0,1.74,0),.083,skin,root+'/Head');ball((0,1.90,0),(.19,.24,.17),skin,root+'/Head')
 ball((0,2.055,-.025),(.2,.12,.177),hair,root+'/Head')
 for j in range(7):ball((-.17+j*.05,2.06+math.sin(j)*.01,.12),(.054,.069,.051),hair,root+'/Head')
 for s in [-1,1]:
  ball((s*.075,1.928,.147),(.043,.032,.016),white,root+'/Head');ball((s*.075,1.926,.162),(.018,.022,.011),pupil,root+'/Head');tube((s*.043,1.985,.159),(s*.11,1.98,.149),.01,hair,root+'/Head')
  ball((s*.195,1.90,0),(.038,.059,.035),skin,root+'/Head');origins[root+'/Arm'+str(s)]=(s*.235,1.52,0)
  tube((0,0,0),(s*.07,-.33,0),.075,skin if cold else cloth,root+'/Arm'+str(s));tube((s*.07,-.33,0),(s*.03,-.63,.065),.055,skin if cold else cloth,root+'/Arm'+str(s));ball((s*.03,-.67,.07),(.055,.08,.052),skin,root+'/Arm'+str(s))
  origins[root+'/Leg'+str(s)]=(s*.12,.99,0);tube((0,0,0),(0,-.42,0),.105,charcoal,root+'/Leg'+str(s));tube((0,-.42,0),(0,-.83,.02),.08,charcoal,root+'/Leg'+str(s));ball((0,-.89,.09),(.1,.085,.19),black,root+'/Leg'+str(s))
 ball((0,1.87,.178),(.028,.042,.029),skin,root+'/Head');tube((-.044,1.81,.147),(.044,1.81,.147),.012,pink,root+'/Head')
 # Visible open-front coat, lapels, pockets and navy zip when rescued.
 if not staff:
  tailored(root+'/Coat',charcoal,[(.60,.30,.22),(.72,.29,.21),(1.15,.29,.22),(1.43,.30,.21),(1.57,.22,.16)],.29)
  tailored(root+'/Knit',navy,[(.98,.245,.18),(1.18,.265,.19),(1.42,.285,.19),(1.59,.18,.15)])
  for s in [-1,1]:
   origins[root+'/Sleeve'+str(s)]=(s*.235,1.52,0);tube((0,0,0),(s*.07,-.33,0),.093,charcoal,root+'/Sleeve'+str(s));tube((s*.07,-.33,0),(s*.03,-.59,.058),.073,charcoal,root+'/Sleeve'+str(s));box((s*.19,.91,.20),(.13,.18,.016),charcoal,root+'/Coat')
   add([(s*.07,1.59,.20),(s*.23,1.52,.20),(s*.15,1.32,.236),(s*.055,1.4,.21)],[(0,1,2,3)],charcoal,root+'/Coat')
   for y in [.8,1.02,1.24]:ball((s*.10,y,.23),(.014,.014,.008),black,root+'/Coat')
  tube((0,1.01,.194),(0,1.57,.169),.006,steel,root+'/Knit');box((.09,1.45,.189),(.021,.027,.008),red,root+'/Knit')
human('HyunsuBed',(1.7,1.08,-1.15),True);human('HyunsuCold',(8.7,0,1.2),True);human('ShopAssistant',(15.2,0,3.72),False,True);human('HyunsuHungry',(26.8,0,1.3));human('HyunsuQuake',(32.8,0,1.3))
# Boutique window and brass racks with physical garments.
box((8.7,2.25,-4.84),(3.5,2.5,.08),blue,'WinterWindow')
for x in [6.9,8.7,10.5]:box((x,2.25,-4.73),(.07,2.55,.11),white,'WinterWindow')
box((8.7,2.25,-4.72),(3.65,.08,.12),white,'WinterWindow');box((8.7,1,-4.56),(3.85,.15,.55),walnut,'WinterWindow')
for s in [-1,1]:
 for j in range(8):tube((8.7+s*1.82+j*.045,3.7,-4.52),(8.7+s*1.86+j*.035,.7,-4.42),.049,white,'WinterCurtain')
text('02   SOMETHING WARM',(12,3.5,-4.82),.28,'BoutiqueTitle',gold)
text('THE WINTER EDIT',(15,2.9,-4.8),.17,'BoutiqueSubtitle',gold)
colors=[(.50,.26,.17),(.16,.27,.21),(.75,.68,.53),(.52,.16,.24),(.12,.19,.3),(.34,.34,.33),(.81,.77,.68)]
for r,z in enumerate([-2.4,0]):
 for cx in [11.6,15.3]:
  for x in [cx-1.35,cx+1.35]:tube((x,0,z),(x,2.5,z),.025,gold,'Racks');box((x,.08,z),(.5,.08,.4),gold,'Racks')
  tube((cx-1.35,2.5,z),(cx+1.35,2.5,z),.025,gold,'Racks')
  for j in range(6 if r==0 else 5):
   x=cx-1.05+j*.41;m=mat('Garment_%s_%s_%s'%(r,cx,j),colors[(j+int(cx)+r)%len(colors)])
   tube((x,2.47,z),(x,2.28,z),.012,steel,'Racks');tube((x,2.31,z),(x-.16,2.18,z),.013,walnut,'Racks');tube((x,2.31,z),(x+.16,2.18,z),.013,walnut,'Racks');box((x,1.73,z),(.34,.88,.09),m,'Garments');tube((x-.16,2.12,z),(x-.21,1.55,z),.072,m,'Garments');tube((x+.16,2.12,z),(x+.21,1.55,z),.072,m,'Garments')
box((15.15,.54,2.85),(3.1,1.08,.96),walnut,'Checkout');box((15.15,1.12,2.85),(3.25,.13,1.06),paper,'Checkout');box((15.64,1.36,2.82),(.55,.38,.10),black,'Checkout');box((15.64,1.2,2.85),(.38,.10,.35),steel,'Checkout');box((14.1,1.27,2.82),(.46,.20,.33),paper,'ShoppingBag')
text('CHECKOUT  /  계산대',(15.15,.71,2.32),.16,'CheckoutSign',gold,math.pi)
# Restaurant atlas, upholstered seats, place settings, cutlery and fluted counter.
text('03   WHERE SHALL WE EAT?',(24,3.82,-4.78),.28,'AtlasTitle',gold)
box((24,2.48,-4.68),(7.9,3.98,.16),walnut,'MapFrame');box((24,2.48,-4.57),(7.65,3.83,.04),gold,'MapFrame');box((24,.35,-4.35),(7.6,.18,.55),walnut,'MapFrame')
box((23.4,.82,.9),(2.5,.15,1.45),walnut,'Dining');
for x in [22.4,24.4]:
 for z in [.4,1.4]:tube((x,0,z),(x,.8,z),.047,gold,'Dining')
for x in [22.8,24]:
 tube((x,.91,.9),(x,.935,.9),.25,white,'Dining',32);ring((x,.95,.9),.245,.008,gold,'Dining');tube((x+.36,.92,.70),(x+.36,.92,1.12),.012,steel,'Dining');tube((x-.35,.92,.7),(x-.35,.92,1.1),.014,steel,'Dining');tube((x,.95,.37),(x,1.15,.37),.02,steel,'Dining');ball((x,1.2,.37),(.08,.12,.08),blue,'Dining')
for x in [22.8,24,26.8]:
 z=1.8 if x<26 else 1.3;box((x,.49,z),(.63,.14,.62),rose,'Chairs');box((x,.98,z+.24),(.63,.99,.14),rose,'Chairs')
 for dx in [-.25,.25]:
  for dz in [-.24,.24]:tube((x+dx,0,z+dz),(x+dx,.49,z+dz),.025,gold,'Chairs')
# Earthquake lane: noren, vending machine, curb, lanterns, pipes and illuminated exit.
for x in [33,36,39]:
 box((x,1.65,-4.5),(2.6,3.3,.6),walnut,'StreetFacades');box((x,2.7,-4.12),(2.8,.58,.08),paper,'StreetFacades');
 for j in range(9):box((x-1.16+j*.29,1.15,-4.1),(.035,2.4,.04),gold,'StreetFacades')
 text(['喫茶  思い出','駅前商店','甘味処'][int((x-33)/3)],(x,2.60,-4.02),.24,'JapanSign',black)
for x in [32,35,38,40]:
 tube((x,3.3,-4),(x,3,-4),.012,black,'Street');ball((x,2.86,-4),(.16,.27,.16),red,'Lanterns');tube((x,3.1,-4),(x,3.1,-3.3),.017,black,'Street')
box((40.6,1.12,3.8),(1.3,2.24,.8),red,'VendingMachine');box((40.6,1.5,3.36),(1.13,1.12,.035),blue,'VendingMachine');box((40.6,.35,3.33),(.78,.27,.04),black,'VendingMachine')
for x in [40.2,40.6,41]:
 for y in [1.1,1.45,1.8]:tube((x,y,3.30),(x,y+.19,3.30),.058,white,'VendingMachine')
box((36,.06,4.35),(11.8,.12,1.1),cream,'Curb');box((36,.06,-4.35),(11.8,.12,1.1),cream,'Curb')
for x in [32,34,36,38,40]:box((x,.01,0),(.9,.012,.08),paper,'RoadMarkings')
text('400   /   OUR NEXT MEMORY',(46,2.7,-4.79),.35,'SafeRoomSign',gold)
text('함께라서, 무사히.',(46,2.1,-4.79),.27,'SafeRoomMessage',gold)
for i,x in enumerate([6,18,30,42]):
 root='Door'+str(i);origins[root]=(x,0,-.3);box((0,1.6,1.3),(.14,3.2,2.6),sage if i<2 else rose,root);box((-.085,2,1.3),(.025,1.4,1.5),gold,root);tube((-.14,1.35,2.34),(-.14,1.69,2.34),.035,gold,root)
 for z in [-.36,2.36]:box((x,1.7,z),(.28,3.4,.12),gold,'DoorFrames')
 box((x,3.4,1),(.28,.14,2.8),gold,'DoorFrames')
# Mesh material batching keeps the browser scene affordable, while named subtrees stay editable.
groups={}
def group(path):
 if path in groups:return groups[path]
 o=bpy.data.objects.new(path.split('/')[-1],None);scene.collection.objects.link(o);groups[path]=o
 if '/' in path:o.parent=group(path.rsplit('/',1)[0])
 if path in origins:o.location=xyz(origins[path])
 return o
for (root,m),(v,f,smooth) in batches.items():
 mesh=bpy.data.meshes.new(root+'_'+m);mesh.from_pydata(v,[],f);mesh.materials.append(mats[m]);mesh.update();uv=mesh.uv_layers.new(name='UVMap')
 for poly in mesh.polygons:
  poly.use_smooth=smooth[poly.index]
  for li in poly.loop_indices:
   co=mesh.vertices[mesh.loops[li].vertex_index].co
   uv.data[li].uv=(co.x/3,co.y/3) if abs(poly.normal.z)>.5 else (co.x/3,co.z/3) if abs(poly.normal.y)>.5 else (co.y/3,co.z/3)
 o=bpy.data.objects.new(root.split('/')[-1]+'_'+m,mesh);scene.collection.objects.link(o);o.parent=group(root)
 # Subtle bevels on cabinetry and trim rather than razor sharp primitives.
 if root.startswith(('Architecture','Bed','Cabinet','Checkout','MapFrame')):
  mod=o.modifiers.new('Softened furniture edges','BEVEL');mod.width=.013;mod.segments=2
build_glass_cabinet(scene,group('Cabinet'),group('CabinetDoor'))
for root in ['HyunsuBed','HyunsuCold','HyunsuHungry','HyunsuQuake']:
 for part in ['Coat','Knit','Sleeve-1','Sleeve1']:
  for obj in [group(root+'/'+part),*group(root+'/'+part).children_recursive]:obj.hide_render=True
group('HyunsuBed').rotation_euler[0]=-math.pi/2
# Actual authored CC0 heads, preserving their UVs and source textures.
headpath=os.path.join(ASSET,'hyunsu-head.glb')
if os.path.isfile(headpath):
 before=set(scene.objects);bpy.ops.import_scene.gltf(filepath=headpath);imported=[o for o in scene.objects if o not in before];sourceheads=[o for o in imported if o.type=='MESH']
 for name in ['HyunsuBed','HyunsuCold','HyunsuHungry','HyunsuQuake','ShopAssistant']:
  legacy=group(name+'/Head')
  for obj in [legacy,*legacy.children_recursive]:obj.hide_render=True
  for source in sourceheads:
   duplicate=source.copy();duplicate.data=source.data;scene.collection.objects.link(duplicate);duplicate.parent=group(name);duplicate.location.z-=.16;duplicate.name=name+'_CC0_'+source.name
 for source in imported:bpy.data.objects.remove(source,do_unlink=True)
 for material in bpy.data.materials:
  if material.name.startswith('MI_Hair_1') and material.use_nodes:
   shader=next((n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
   if shader:
    links=list(shader.inputs['Base Color'].links)
    if links:
     source=links[0].from_socket;material.node_tree.links.remove(links[0]);mix=material.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(.055,.034,.019,1);material.node_tree.links.new(source,mix.inputs[1]);material.node_tree.links.new(mix.outputs[0],shader.inputs['Base Color'])
    else:shader.inputs['Base Color'].default_value=(.035,.022,.012,1)
# Photographed fabric and plaster normals; skin and wood preserve their source maps.
for material_name,asset_id in [(cream,'painted_plaster_wall'),(sage,'painted_plaster_wall'),(navy,'knitted_fleece'),(charcoal,'poly_wool_herringbone')]:
 m=mats[material_name];shader=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 for kind in ['normal','roughness']:
  path=os.path.join(ASSET,asset_id+'-'+kind+'.jpg')
  if not os.path.isfile(path):continue
  tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(path,check_existing=True);tex.image.colorspace_settings.name='Non-Color'
  if kind=='normal':
   norm=m.node_tree.nodes.new('ShaderNodeNormalMap');norm.inputs['Strength'].default_value=.18;m.node_tree.links.new(tex.outputs['Color'],norm.inputs['Color']);m.node_tree.links.new(norm.outputs['Normal'],shader.inputs['Normal'])
  else:m.node_tree.links.new(tex.outputs['Color'],shader.inputs['Roughness'])
def photo_panel(name,filename,p,w,h):
 path=os.path.join(ASSET,filename)
 if not os.path.isfile(path):return
 x,y,z=p;m=mat(name,(1,1,1),rough=.7,image=path);mesh=bpy.data.meshes.new(name);mesh.from_pydata([xyz((x-w/2,y-h/2,z)),xyz((x+w/2,y-h/2,z)),xyz((x+w/2,y+h/2,z)),xyz((x-w/2,y+h/2,z))],[],[(0,1,2,3)]);mesh.materials.append(mats[m]);uv=mesh.uv_layers.new()
 for i,co in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=co
 obj=bpy.data.objects.new(name,mesh);scene.collection.objects.link(obj)
photo_panel('NaturalEarth_WorldAtlas','world-map.png',(24,2.48,-4.52),7.5,3.75)
photo_panel('Official_Polo_Product','polo-navy.jpg',(16.8,2.5,-4.78),1,1)
photo_panel('Official_TOMBOY_Product','tomboy-coat.jpg',(14.8,2.5,-4.78),1,1.5)
# Real product-photo tags match the selectable stock on the physical rails.
catalog_path=os.path.join(ASSET,'catalog.json')
if os.path.isfile(catalog_path):
 catalog=json.load(open(catalog_path,encoding='utf8'))
 for i,g in enumerate(catalog):
  row=0 if i<12 else 1;j=i if i<12 else i-12;section=0 if j<(6 if row==0 else 5) else 1;slot=j%(6 if row==0 else 5);cx=[11.6,15.3][section];x=cx-1.05+slot*.41;z=[-2.4,0][row]
  photo_panel('Garment_Photo_'+g['id'],g['photo'].split('/')[-1],(x,1.76,z+.067),.29,.58)
scene.world=bpy.data.worlds.new('Rescue ambient');scene.world.use_nodes=True;bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs['Color'].default_value=(.27,.33,.4,1);bg.inputs['Strength'].default_value=.5
for cx in [0,12,24,36,47]:
 data=bpy.data.lights.new('Warm room light','AREA');data.energy=450;data.shape='DISK';data.size=6;o=bpy.data.objects.new('Room light',data);scene.collection.objects.link(o);o.location=xyz((cx,3.8,0))
camdata=bpy.data.cameras.new('Rescue camera');cam=bpy.data.objects.new('Rescue camera',camdata);scene.collection.objects.link(cam);cam.location=xyz((3.5,2.9,4.2));direction=Vector(xyz((-.8,1.3,-2.8)))-cam.location;cam.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();camdata.lens=21;scene.camera=cam
scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG'
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/day-300-save-hyunsu.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(ASSET,'rescue-room.glb'),export_format='GLB',use_active_scene=True,export_cameras=False,export_lights=False,export_animations=False)
if '--skip-render' not in __import__('sys').argv:
 scene.render.filepath=os.path.join(ROOT,'test-results/rescue-blender.png');bpy.ops.render.render(write_still=True)
print('RESCUE_BUILD_OK',len(scene.objects))
