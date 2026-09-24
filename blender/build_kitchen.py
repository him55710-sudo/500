"""200-day cooking rotunda. New scene, material-batched meshes, original detailed food models."""
import bpy, math, random, os, json
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
random.seed(200)
scene=bpy.data.scenes.new('Day_200_Our_Four_Kitchens');bpy.context.window.scene=scene
batches={};materials={}
def xyz(p):return (p[0],-p[2],p[1])
def mat(n,c,metal=0,rough=.5,emit=0):
 m=bpy.data.materials.new(n);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*c,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
 if emit:b.inputs['Emission Color'].default_value=(*c,1);b.inputs['Emission Strength'].default_value=emit
 materials[n]=m;return n
cream=mat('Warm ceramic',(.82,.76,.62),0,.45);white=mat('Porcelain white',(.96,.94,.86),0,.22);wood=mat('Oak cabinet',(.36,.19,.073),0,.6)
green=mat('Sage enamel',(.15,.31,.25),.12,.35);gold=mat('Brass handles',(.64,.41,.14),.8,.3);steel=mat('Brushed steel',(.39,.46,.47),.84,.26);black=mat('Cast iron',(.023,.028,.03),.1,.7)
red=mat('Paprika glaze',(.66,.11,.042),.04,.29);blue=mat('Sky blue ceramic',(.13,.35,.42),.08,.4);pink=mat('Rose patisserie',(.66,.27,.36),.05,.4)
neon=mat('Line 7 phosphorescent green',(.38,1,.055),0,.4,2.4);lamp=mat('Pendant milk glass',(1,.79,.45),0,.3,.12)
raw=mat('Raw translucent shrimp',(.60,.55,.54),0,.22);shrimp=mat('Cooked shrimp coral',(.95,.38,.17),0,.28);flesh=mat('Shrimp pale segments',(1,.77,.55),0,.3)
sauce=mat('Glossy chili sauce',(.59,.045,.013),.02,.17);rice=mat('Individual rice grains',(.92,.84,.65),0,.58);carrot=mat('Diced carrot',(.90,.21,.028),0,.5);herb=mat('Chives parsley',(.12,.34,.065),0,.5)
egg=mat('Egg curds',(1,.65,.10),0,.62);fried=mat('Craggy golden chicken',(.69,.30,.042),0,.69);crust=mat('Crunchy crust tips',(.90,.54,.15),0,.73);bone=mat('Chicken bone ivory',(.9,.82,.63),0,.67)
choc=mat('Dark glossy chocolate',(.07,.021,.009),0,.22);cookie=mat('Biscuit golden wheat',(.64,.39,.15),0,.75);almond=mat('Chopped almonds',(.87,.69,.41),0,.6)
def add(v,f,m,root='KitchenArchitecture',smooth=False):
 verts,faces,sm=batches.setdefault((root,m),([],[],[]));off=len(verts);verts.extend(xyz(p) for p in v);faces.extend(tuple(off+j for j in p) for p in f);sm.extend([smooth]*len(f))
def box(p,s,m,root='KitchenArchitecture'):
 x,y,z=p;a,b,c=[q/2 for q in s];v=[(x+i*a,y+j*b,z+k*c) for i,j,k in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
 add(v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],m,root)
def tube(a,b,r,m,root='KitchenArchitecture',n=16,r2=None):
 a,b=Vector(a),Vector(b);d=(b-a).normalized();u=d.cross(Vector((0,1,0)) if abs(d.y)<.94 else Vector((1,0,0))).normalized();v=d.cross(u).normalized()
 verts=[p+(u*math.cos(i*math.tau/n)+v*math.sin(i*math.tau/n))*rr for p,rr in [(a,r),(b,r if r2 is None else r2)] for i in range(n)]
 add(verts,[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],m,root,True)
def ball(p,s,m,root='KitchenArchitecture',n=12,k=8):
 verts=[(p[0]+s[0]*math.sin(j*math.pi/k)*math.cos(i*math.tau/n),p[1]+s[1]*math.cos(j*math.pi/k),p[2]+s[2]*math.sin(j*math.pi/k)*math.sin(i*math.tau/n)) for j in range(k+1) for i in range(n)]
 add(verts,[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(k) for i in range(n)],m,root,True)
def ring(p,r,t,m,root='KitchenArchitecture',n=48):
 for i in range(n):
  a=i*math.tau/n;b=(i+1)*math.tau/n;tube((p[0]+r*math.cos(a),p[1],p[2]+r*math.sin(a)),(p[0]+r*math.cos(b),p[1],p[2]+r*math.sin(b)),t,m,root,n=8)
def prawn(p,s,material,root):
 # Continuous tapered C-shaped flesh, shallow shell grooves and a three-leaf tail fan.
 vertices=[];sections=32;n=12
 for j in range(sections+1):
  t=j/sections;a=-.65+t*4.12;r=.17*s;thick=(.081*(1-t)**.6+.012)*s
  thick*=.9 if j in [6,12,18,24,29] else 1
  for k in range(n):
   b=k*math.tau/n;rr=r+math.cos(b)*thick
   vertices.append((p[0]+rr*math.cos(a),p[1]+.045*s+math.sin(b)*thick*.68,p[2]+rr*math.sin(a)))
 for j in range(sections):
  faces=[(k,(k+1)%n,n+(k+1)%n,n+k) for k in range(n)]
  add(vertices[j*n:(j+2)*n],faces,flesh if material==shrimp and j in [7,13,19,25] else material,root,True)
 a=3.47;q=Vector((p[0]+.17*s*math.cos(a),p[1]+.035*s,p[2]+.17*s*math.sin(a)));d=Vector((-math.sin(a),0,math.cos(a)));side=Vector((math.cos(a),0,math.sin(a)))
 for k in [-1,0,1]:
  tip=q+d*.14*s+side*k*.07*s
  add([q,tip+side*.045*s,tip+d*.035*s,tip-side*.045*s,q+Vector((0,.018*s,0))],[(0,1,2,3),(4,3,2,1)],material if material==raw else shrimp,root)
def grains(p,s,root,veggies=False):
 for i in range(300):
  x=random.uniform(-.46,.46)*s;z=random.uniform(-.32,.32)*s;y=random.uniform(.01,.11)*s
  ball((p[0]+x,p[1]+y,p[2]+z),(.026*s,.011*s,.013*s),rice,root,8,4)
  if veggies and i%9==0:box((p[0]+x,p[1]+y+.015,p[2]+z),(.038,.032,.035),[carrot,herb,egg][(i//9)%3],root)
def lunchbox(root):
 box((0,.0,0),(1.45,.08,1.12),wood,root);box((0,.055,0),(1.34,.035,1.01),white,root)
 for x in [-.71,.71]:box((x,.11,0),(.045,.22,1.12),wood,root)
 for z in [-.54,.54]:box((0,.11,z),(1.45,.22,.045),wood,root)
def drumstick(p,material,root,angle):
 d=Vector((math.cos(angle),0,math.sin(angle)));q=Vector(p)
 side=Vector((-d.z,0,d.x));up=Vector((0,1,0));verts=[];n=16
 rings=[(-.26,.035),(-.21,.105),(-.13,.143),(-.03,.13),(.065,.085),(.14,.038)]
 for h,r in rings:
  for i in range(n):
   a=i*math.tau/n;roughness=1+random.uniform(-.08,.08);verts.append(q+d*h+(side*math.cos(a)+up*math.sin(a)*.85)*r*roughness)
 add(verts,[tuple(range(n-1,-1,-1)),tuple(range((len(rings)-1)*n,len(rings)*n))]+[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rings)-1) for i in range(n)],material,root,True)
 tube(q+d*.11,q+d*.27,.029,bone,root,n=12)
 for sign in [-1,1]:ball(q+d*.28+side*sign*.028,(.045,.035,.041),bone,root)
 for i in range(42):
  a=random.uniform(.15,math.pi-.15);h=random.uniform(-.2,.04);r=.135 if h<-.04 else .11
  pos=q+d*h+side*math.cos(a)*r+up*math.sin(a)*r*.86
  ball(pos,(.014,.015,.018),crust if material==fried else sauce,root,6,4)
# Convenience-store architecture and native food fixtures.
import sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import market_shelves
market_shelves.architecture(globals())
# Four room bays: each is 7m across with tiled backsplash, sink, stove and packaging counter.
for key,cx,cz,ang,color in [('chili',0,-16,0,red),('chicken',16,0,-math.pi/2,gold),('garlic',0,16,math.pi,green),('pepero',-16,0,math.pi/2,pink)]:
 root='Bay_'+key
 def P(p):return (cx+p[0]*math.cos(ang)+p[2]*math.sin(ang),p[1],cz-p[0]*math.sin(ang)+p[2]*math.cos(ang))
 def B(p,s,m):
  if abs(math.sin(ang))>.5:s=(s[2],s[1],s[0])
  box(P(p),s,m,root)
 B((0,.016,0),(7,.03,6.6),color)
 for side in [-1,1]:B((side*3.5,1.75,-.65),(.12,3.5,5.3),cream);B((side*3.5,3.55,-.65),(.19,.09,5.4),gold)
 B((0,1.8,-3.2),(7,3.6,.15),color);B((0,3.65,-3.2),(7,.15,.2),gold)
 B((0,.57,-1.7),(6,1.1,1.5),wood);B((0,1.15,-1.7),(6.15,.12,1.65),white)
 for x in [-2.3,-.8,.8,2.3]:
  B((x,.59,-.93),(1.35,.95,.04),color);B((x,.9,-.86),(.38,.035,.06),gold)
 for x in range(-3,4):
  for y in range(4):B((x,1.5+y*.43,-3.1),(.97,.40,.035),white)
 B((-2,1.23,-1.7),(1.2,.035,.93),steel);B((-2,1.25,-1.7),(.95,.035,.67),black)
 for a,b in [((-2,1.2,-2.2),(-2,1.75,-2.2)),((-2,1.75,-2.2),(-2,1.75,-1.8))]:tube(P(a),P(b),.045,steel,root)
 B((.1,1.235,-1.7),(1.3,.04,1.1),black)
 for x in [-.28,.47]:ring(P((x,1.28,-1.7)),.23,.02,steel,root)
 B((2,1.245,-1.6),(1.15,.06,.75),wood)
 B((0,3.25,-1.7),(1.7,.25,1.4),steel);tube(P((0,3.2,-1.7)),P((0,6,-1.7)),.22,steel,root)
 for x in [-2,2]:tube(P((x,3.6,.4)),P((x,6,.4)),.012,gold,root);tube(P((x,3.4,.4)),P((x,3.62,.4)),.26,lamp,root,n=24,r2=.10)
 # Per-room pans and recipe stand.
 pan=P((.1,1.32,-1.65));tube((pan[0],pan[1]-.06,pan[2]),(pan[0],pan[1]+.07,pan[2]),.47,black,root,n=36)
 ring((pan[0],pan[1]+.085,pan[2]),.46,.023,steel,root)
 tube(P((.5,1.37,-1.65)),P((1.06,1.37,-1.65)),.055,wood,root)
 B((2.45,1.60,-2.1),(.65,.67,.06),cream)
# Power panel is a physical luminous fixture near the entry.
box((8.6,2.1,17.8),(4.8,2.25,.12),black,'PowerPanel');box((8.6,2.1,17.88),(4.6,2.05,.03),black,'PowerPanel')
for x in [6.35,10.85]:box((x,2.1,17.71),(.022,1.92,.022),neon,'PowerPanel')
for y in [1.14,3.06]:box((8.6,y,17.71),(4.3,.022,.022),neon,'PowerPanel')
# Food asset library. Kept in separate roots for worktop updates and close-up previews.
def chicken_box(root,stage):
 lunchbox(root)
 box((0,.14,-.2),(1.37,.15,.025),white,root);box((0,.14,.16),(.025,.15,.7),white,root)
 if stage>=1:
  grains((-.14,.10,-.37),.43,root)
  for x in range(3):
   for z in range(2):box((.34+x*.085,.16,-.42+z*.08),(.073,.075,.07),white,root)
 if stage>=2:
  for z in [-.035,.31]:drumstick((-.34,.24,z),fried,root,-.25)
 if stage>=3:
  for z in [-.035,.31]:drumstick((.34,.24,z),sauce,root,.25)
for name in ['chili','garlic']:
 root='Dish_'+name;lunchbox(root)
 grains((0,.09,0),1.25,root,name=='chili')
 for j in range(8):
  x=(j%4-1.5)*.28;z=(j//4-.5)*.4;prawn((x,.25,z),.74 if name=='chili' else .59,sauce if name=='chili' else shrimp,root)
 for j in range(35):box((random.uniform(-.55,.55),.32,random.uniform(-.38,.38)),(.024,.018,.028),herb,root)
for name,stage in [('ChickenEmpty',0),('ChickenRice',1),('ChickenFried',2),('Dish_chicken',3)]:chicken_box(name,stage)
for name,decorated in [('PeperoCoated',False),('Dish_pepero',True)]:
 box((0,0,0),(1.5,.05,1.1),white,name)
 for i in range(6):
  x=(i-2.5)*.23;tube((x,.06,-.45),(x,.06,.45),.026,cookie,name,n=12);tube((x,.06,-.46),(x,.06,.22),.037,choc if i%2==0 else white,name,n=12)
  if decorated:
   for j in range(17):
    z=random.uniform(-.44,.17);ball((x+random.uniform(-.027,.027),.095,z),(.016,.01,.014),[pink,almond,choc,red][j%4],name,6,4)
for name,veg in [('RiceOnly',False),('FriedRice',True)]:lunchbox(name);grains((0,.08,0),1.25,name,veg)
root='SideShrimp';tube((0,0,0),(0,.025,0),.55,white,root,n=40)
for j in range(6):prawn(((j%3-1)*.3,.05,(j//3-.5)*.36),.8,sauce,root)
for name,ma in [('raw',raw),('cooked',shrimp),('sauced',sauce)]:
 root='Pan_'+name;tube((0,-.03,0),(0,.025,0),.6,black,root,n=40);ring((0,.04,0),.59,.024,steel,root);tube((.55,.02,0),(.96,.02,0),.038,wood,root)
 for j in range(6):prawn(((j%3-1)*.28,.05,(j//3-.5)*.32),.75,ma,'Pan_'+name)
water=mat('Warm water blue',(.12,.26,.29),.25,.13)
for name,stage in [('WaterPot',0),('ChocolateChunks',1),('ChocolateBowl',2)]:
 tube((0,-.1,0),(0,.08,0),.46,steel,name,n=40);tube((0,.081,0),(0,.09,0),.44,water,name,n=40)
 for x in [-.5,.5]:tube((x,.05,-.13),(x,.05,.13),.03,black,name)
 if stage:
  tube((0,.03,0),(0,.24,0),.29,steel,name,n=40,r2=.4)
  tube((0,.241,0),(0,.246,0),.365,choc if stage==2 else steel,name,n=40)
  if stage==1:
   for x in range(3):
    for z in range(3):box(((x-1)*.14,.265,(z-1)*.14),(.13,.055,.13),choc,name)
  else:tube((.13,.25,0),(.45,.38,.3),.025,wood,name);ball((.12,.25,0),(.07,.015,.045),wood,name)
root='GiftParcel';box((0,.11,0),(1.4,.22,1.05),cream,root);box((0,.23,0),(.08,.02,1.06),pink,root);box((0,.24,0),(1.41,.02,.08),pink,root)
# Delivery person is articulated by the web runtime, with a box hand-over animation.
skin=mat('Courier skin',(.64,.40,.24));coat=mat('Courier teal jacket',(.025,.35,.36),0,.8)
ball((0,1.57,0),(.16,.2,.15),skin,'CourierBody',20,12);ball((0,1.72,0),(.19,.11,.18),gold,'CourierBody');box((0,1.13,0),(.43,.57,.27),coat,'CourierBody')
for x in [-.058,.058]:ball((x,1.60,.142),(.017,.019,.008),black,'CourierBody')
for side,key in [(-1,'L'),(1,'R')]:
 tube((side*.12,.88,0),(side*.12,.18,0),.075,black,'CourierLeg'+key);ball((side*.12,.1,.06),(.095,.08,.17),black,'CourierLeg'+key)
 tube((side*.27,1.35,0),(side*.3,.93,.25),.07,coat,'CourierArm'+key);ball((side*.3,.93,.28),(.075,.07,.07),skin,'CourierArm'+key)
box((0,.95,.44),(.55,.30,.43),cream,'CourierBox');box((0,1.105,.44),(.55,.015,.10),red,'CourierBox')
roots={}
for (root,m),(vertices,faces,smooth) in batches.items():
 if root not in roots:g=bpy.data.objects.new(root,None);scene.collection.objects.link(g);roots[root]=g
 me=bpy.data.meshes.new(root+' '+m);me.from_pydata(vertices,[],faces);me.materials.append(materials[m]);me.update()
 for p,sm in zip(me.polygons,smooth):p.use_smooth=sm
 ob=bpy.data.objects.new(root+' '+m,me);scene.collection.objects.link(ob);ob.parent=roots[root]
# Native source puts food on all four worktops, with asset-library copies in their own collection.
for key,pos in [('chili',(1.9,1.26,-17.4)),('chicken',(17.4,1.26,1.9)),('garlic',(-1.9,1.26,17.4)),('pepero',(-17.4,1.26,-1.9))]:roots['Dish_'+key].location=xyz(pos)
for name in ['raw','cooked','sauced']:roots['Pan_'+name].location=xyz((0,1.4,-17.6));roots['Pan_'+name].hide_render=name!='raw'
library=['ChickenEmpty','ChickenRice','ChickenFried','PeperoCoated','RiceOnly','FriedRice','SideShrimp','WaterPot','ChocolateChunks']
for i,name in enumerate(library):roots[name].location=xyz((22+(i%3)*2,0,(i//3)*2));roots[name].hide_render=True
roots['ChocolateBowl'].location=xyz((-17.7,1.2,0));roots['GiftParcel'].location=xyz((17.6,1.3,0))
for root in roots:
 if root.startswith('Courier'):roots[root].location=xyz((9,0,9))
stock_root,stock_objects,stock_count,stock_varieties=market_shelves.stock(scene,ROOT)
roots['MarketStock_Kenney_CC0']=stock_root
world=bpy.data.worlds.new('Kitchen world');world.use_nodes=True;world.node_tree.nodes.get('Background').inputs[0].default_value=(.22,.24,.21,1);world.node_tree.nodes.get('Background').inputs[1].default_value=.5;scene.world=world
for i,p in enumerate([(0,6,0),(0,5,-16),(16,5,0),(0,5,16),(-16,5,0),(6,6,6),(-6,6,-6)]):
 d=bpy.data.lights.new('Kitchen softbox '+str(i),'AREA');d.energy=650;d.shape='DISK';d.size=5;o=bpy.data.objects.new(d.name,d);scene.collection.objects.link(o);o.location=xyz(p)
d=bpy.data.cameras.new('Kitchen overview');cam=bpy.data.objects.new('Kitchen overview',d);scene.collection.objects.link(cam);cam.location=xyz((11,5,16));cam.rotation_euler=(Vector(xyz((0,1.6,-3)))-cam.location).to_track_quat('-Z','Y').to_euler();d.lens=20;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.render.resolution_x=1440;scene.render.resolution_y=960;scene.render.resolution_percentage=100
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/day-200-convenience-market.blend'))
market_shelves.merge_export_stock(stock_objects)
# Game keeps portable prototypes at local origin and instantiates food at the right counter.
for root,g in roots.items():
 if root.startswith(('Dish_','Pan_','Courier')) or root in ['ChocolateBowl','GiftParcel']+library:g.location=(0,0,0)
bpy.ops.object.select_all(action='DESELECT')
for g in roots.values():
 g.select_set(True)
 for ob in g.children:ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/assets/day-200-kitchen.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_lights=False,export_cameras=False,export_yup=True)
print('MARKET_STOCK',stock_count,stock_varieties,flush=True)
print('DAY200_MODEL_READY',len(scene.objects),sum(len(o.data.polygons) for o in scene.objects if o.type=='MESH'),flush=True)
