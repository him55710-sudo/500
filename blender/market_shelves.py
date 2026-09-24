"""Convenience-store fixtures, repeatable shelf stocking and licensed food imports."""
import bpy, math, os, random
from mathutils import Matrix, Vector

def architecture(g):
 box,tube,ring,mat=[g[n] for n in ['box','tube','ring','mat']]
 cream,white,wood,green,gold,steel,black,lamp=[g[n] for n in ['cream','white','wood','green','gold','steel','black','lamp']]
 floor=mat('Warm terrazzo',(.67,.65,.58),0,.72);tile=mat('Store pale tile',(.84,.83,.76),0,.32)
 cream2=mat('Powder coated shelving',(.79,.78,.68),.2,.37);tag=mat('Shelf price strips',(.08,.20,.16),0,.55)
 glass=mat('Cold case tinted glass',(.29,.56,.6),.38,.16);light=mat('Cool refrigerator LEDs',(.62,.89,1),0,.2,1.1)
 # 44 m diameter; islands and cooking bays are separated by generous pedestrian rings.
 tube((0,-.22,0),(0,0,0),22,floor,n=128);tube((0,7.8,0),(0,7.93,0),22,cream,n=128)
 for x in range(-21,22):
  half=math.sqrt(max(0,21.8**2-x*x));box((x,.012,0),(.012,.012,half*2),cream2)
 for z in range(-21,22):
  half=math.sqrt(max(0,21.8**2-z*z));box((0,.012,z),(half*2,.012,.012),cream2)
 for r in [11.5,21.6]:ring((0,.024,0),r,.018,gold)
 for i in range(96):
  a=i*math.tau/96;b=(i+1)*math.tau/96
  v=[(r*math.cos(t),y,r*math.sin(t)) for y in [0,7.8] for r,t in [(21.8,a),(21.8,b),(22,b),(22,a)]]
  g['add'](v,[(0,1,5,4),(4,5,6,7),(0,3,2,1)],green)
 for i in range(32):
  a=i*math.tau/32;x,z=21.5*math.cos(a),21.5*math.sin(a)
  tube((x,.1,z),(x,7.6,z),.08,gold);tube((x,5.6,z),(x,5.9,z),.20,lamp)
 # Parallel double-sided gondolas: 1.2 m deep, 7.8 m long, four rows of products.
 for index,x in enumerate([-4.5,0,4.5]):
  root='MarketGondola'+str(index)
  box((x,.15,0),(1.3,.3,7.9),green,root);box((x,1.34,0),(.08,2.42,7.8),cream2,root)
  for y in [.42,.96,1.5,2.04]:
   box((x,y,0),(1.3,.045,7.9),white,root)
   for side in [-1,1]:
    box((x+side*.65,y+.04,0),(.035,.12,7.85),tag,root)
    for z in [-3.3,-2.3,-1.3,-.3,.7,1.7,2.7,3.5]:box((x+side*.67,y+.045,z),(.012,.077,.33),white,root)
  for z in [-3.93,3.93]:box((x,1.38,z),(1.33,2.35,.055),cream2,root)
  box((x,2.62,0),(1.33,.22,7.9),green,root)
  # A headboard facing each cross-aisle.
  for z in [-3.99,3.99]:box((x,2.62,z),(1.33,.32,.025),green,root)
 # Produce crates at the front; small barriers and slatted oak finish.
 root='FreshProduceIsland'
 box((0,.42,6.8),(6.8,.84,1.75),wood,root);box((0,.86,6.8),(6.9,.10,1.85),black,root)
 for x in [-2.55,-.85,.85,2.55]:
  box((x,.99,6.8),(1.56,.04,1.64),wood,root)
  for z in [5.99,7.61]:box((x,1.13,z),(1.56,.28,.045),wood,root)
  for xx in [-.78,.78]:box((x+xx,1.13,6.8),(.045,.28,1.65),wood,root)
  for j in range(5):box((x,.23+j*.12,7.69),(1.55,.065,.035),cream2,root)
 # Open refrigerated cases: inward-facing glass side panels, lit shelves, vents and handles.
 for side in [-1,1]:
  x=side*8.2;root='ColdCase'+str(side)
  box((x,.18,0),(1.6,.36,7.6),black,root);box((x+side*.71,1.55,0),(.13,2.9,7.6),white,root)
  box((x,3.03,0),(1.62,.3,7.6),green,root)
  for z in [-3.74,3.74]:box((x,1.63,z),(1.58,2.6,.065),glass,root)
  for y in [.51,1.15,1.79,2.43]:
   box((x,y,0),(1.48,.045,7.42),white,root);box((x-side*.72,y+.07,0),(.025,.10,7.4),green,root)
   box((x-side*.6,y+.13,0),(.018,.024,7.4),light,root)
  for z in [-3.1,-2.3,-1.5,-.7,.1,.9,1.7,2.5,3.3]:box((x-side*.77,.18,z),(.035,.17,.025),steel,root)
 # Frozen shrimp islands and a small checkout counter at opposing corners.
 root='FrozenSeafood'
 box((-7.5,.57,6.7),(2.6,1.14,2.0),white,root);box((-7.5,1.15,6.7),(2.7,.08,2.1),steel,root)
 box((-7.5,1.20,6.7),(2.35,.035,1.7),glass,root)
 for x in [-8.72,-6.28]:box((x,1.22,6.7),(.035,.05,1.74),steel,root)
 box((-7.5,.65,7.73),(2.1,.7,.03),green,root)
 root='MarketCheckout'
 box((7.5,.52,6.7),(2.8,1.04,1.5),green,root);box((7.5,1.1,6.7),(2.94,.13,1.62),white,root)
 box((7.75,1.45,6.7),(.7,.52,.07),black,root);tube((7.75,1.1,6.7),(7.75,1.5,6.7),.035,steel,root)
 for j in range(4):box((6.75,1.19+j*.11,6.7),(.65,.08,.46),g['pink'],root)
 # More practical ceiling light strips and a suspended supermarket sign.
 for x in [-7,-3.5,3.5,7]:
  for z in [-5.7,5]:box((x,5.25,z),(.13,.10,5.0),white);box((x,5.19,z),(.09,.014,4.9),light)
 for x in [-5,5]:tube((x,4.7,5),(x,7.75,5),.022,gold)
 box((0,4.65,5),(10.8,.65,.14),green);box((0,4.3,5),(10.8,.035,.18),gold)

def stock(scene,root_path):
 random.seed(500200);templates={};stock_objects=[];canonical={}
 root=bpy.data.objects.new('MarketStock_Kenney_CC0',None);scene.collection.objects.link(root)
 def template(name,photogrammetry=False):
  if name in templates:return templates[name]
  path=os.path.join(root_path,'external/polyhaven/food_apple_01/food_apple_01.gltf') if photogrammetry else os.path.join(root_path,'external/kenney-food/Models/GLB format',name+'.glb')
  before=set(scene.objects);bpy.ops.import_scene.gltf(filepath=path);new=[o for o in scene.objects if o not in before];meshes=[o for o in new if o.type=='MESH']
  coords=[o.matrix_world@Vector(p) for o in meshes for p in o.bound_box];low=Vector([min(p[i] for p in coords) for i in range(3)]);high=Vector([max(p[i] for p in coords) for i in range(3)])
  center=Vector(((low.x+high.x)/2,(low.y+high.y)/2,low.z));scale=1/max(high-low);data=[]
  for ob in meshes:
   me=ob.data.copy();me.transform(Matrix.Scale(scale,4)@Matrix.Translation(-center)@ob.matrix_world)
   for i,m in enumerate(me.materials):
    if photogrammetry:key='ScannedApple'+str(i)
    else:key=m.name.split('.')[0]
    if key in canonical:me.materials[i]=canonical[key]
    else:canonical[key]=m
   data.append(me)
  for ob in new:bpy.data.objects.remove(ob,do_unlink=True)
  templates[name]=data;return data
 def place(name,x,y,z,size=.40,turn=0,scan=False):
  for mesh in template(name,scan):
   ob=bpy.data.objects.new('Stock_'+name,mesh);scene.collection.objects.link(ob);ob.parent=root;ob.location=(x,-z,y);ob.scale=(size,)*3;ob.rotation_euler[2]=turn;stock_objects.append(ob)
 # All source models are real distributed models, not placeholder spheres.
 products=[['chocolate-wrapper','cookie','bread','croissant','candy-bar-wrapper','honey','peanut-butter','bag'],['bottle-ketchup','bottle-oil','soy','shaker-salt','shaker-pepper','can','can-small','bottle-musterd'],['carton','carton-small','soda-bottle','soda-can','chocolate','cookie-chocolate','rice-ball','bag-flat']]
 for row,x in enumerate([-4.5,0,4.5]):
  for level,y in enumerate([.45,.99,1.53,2.07]):
   for side in [-1,1]:
    for j in range(10):
     name=products[row][(j+level*2)%len(products[row])]
     place(name,x+side*.33,y,-3.45+j*.76,.32 if 'bottle' in name or 'carton' in name else .37,math.pi*.5*side)
 for side in [-1,1]:
  names=['fish','meat-raw','bacon-raw','egg','meat-sausage','meat-ribs'] if side==-1 else ['carton','carton-small','cheese-cut','cheese','chocolate','egg']
  for level,y in enumerate([.55,1.19,1.83,2.47]):
   for j in range(10):place(names[(j+level)%len(names)],side*8.2,y,-3.4+j*.74,.42,math.pi*.5*side)
 for i,x in enumerate([-2.55,-.85,.85,2.55]):
  names=[['apple','pear'],['carrot','leek'],['broccoli','cabbage'],['lemon','tomato']][i]
  for j in range(12):place(names[j%2],x+(j%4-1.5)*.31,1.04,6.8+(j//4-1)*.4,.34,random.uniform(-.3,.3))
 for j in range(5):place('food_apple_01',-2.55+(j-2)*.24,1.31,6.5,.26,random.random(),True)
 for name,x in [('cooking-knife',-1.0),('cooking-spatula',-.5),('cutting-board',0),('whisk',.6)]:place(name,x,.45,-3.4,.37)
 return root,stock_objects,len(stock_objects),len(templates)

def merge_export_stock(objects):
 # Save native linked shelf items first; then merge only the game export by material set.
 groups={}
 for ob in objects:groups.setdefault(tuple(m.name for m in ob.data.materials),[]).append(ob)
 for index,group in enumerate(groups.values()):
  bpy.ops.object.select_all(action='DESELECT')
  for ob in group:ob.select_set(True)
  bpy.context.view_layer.objects.active=group[0]
  if len(group)>1:bpy.ops.object.join()
  group[0].name='BatchedMarketStock_'+str(index)
