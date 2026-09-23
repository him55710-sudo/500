"""Isolated background Blender build. Never touches the live princess-room scene.
Coordinates below use the game's Y-up axes; GLB export converts Blender Z-up.
"""
import bpy, json, math, random, os
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
random.seed(500)
scene=bpy.context.scene
for o in list(scene.objects): bpy.data.objects.remove(o,do_unlink=True)
scene.name='Seoulland_Memory_Transfer'
batches={};materials={}
def mat(name,color,metal=0,rough=.5):
 m=bpy.data.materials.new(name);m.use_nodes=True
 n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 n.inputs['Base Color'].default_value=(*color,1);n.inputs['Metallic'].default_value=metal;n.inputs['Roughness'].default_value=rough
 materials[name]=m;return name
rail=mat('Sun yellow enamel rails',(.95,.46,.018),.5,.28)
blue=mat('Cobalt blue support steel',(.025,.18,.51),.6,.34)
red=mat('Ruby red train body',(.58,.019,.025),.42,.24)
dark=mat('Charcoal rubber and seats',(.035,.045,.052),.1,.54)
steel=mat('Brushed metal hardware',(.46,.54,.6),.8,.3)
concrete=mat('Warm concrete',(.56,.54,.46),0,.94)
white=mat('Ivory station canopy',(.84,.86,.81),.12,.6)
grass=mat('Meadow green',(.22,.34,.21),0,1)
leaves=mat('Tree canopy',(.11,.23,.16),0,1)
hills=mat('Distant mountain blue',(.24,.38,.39),0,1)
pink=mat('Room II blush plaster',(.87,.64,.69),0,.8)
ivory=mat('Room II pearl stone',(.92,.86,.79),.05,.38)
gold=mat('Room II champagne brass',(.63,.43,.20),.7,.32)
def xyz(p):return (p[0],-p[2],p[1])
def add(verts,faces,m,root='Environment'):
 key=(root,m);v,f=batches.setdefault(key,([],[]));off=len(v);v.extend(xyz(p) for p in verts);f.extend(tuple(off+i for i in face) for face in faces)
def box(p,s,m,root='Environment'):
 x,y,z=p;a,b,c=[v/2 for v in s]
 v=[(x+i*a,y+j*b,z+k*c) for i,j,k in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
 add(v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],m,root)
def tube(a,b,r,m,root='Environment',n=8,r2=None):
 a,b=Vector(a),Vector(b);d=(b-a).normalized();ref=Vector((0,1,0)) if abs(d.y)<.94 else Vector((1,0,0));u=d.cross(ref).normalized();v=d.cross(u).normalized();verts=[]
 for p,rr in [(a,r),(b,r if r2 is None else r2)]:
  for i in range(n):verts.append(p+(u*math.cos(i*math.tau/n)+v*math.sin(i*math.tau/n))*rr)
 faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 add(verts,faces,m,root)
def ring(center,r,y,m,width=.05,root='Environment',n=96):
 for i in range(n):
  a=i*math.tau/n;b=(i+1)*math.tau/n;tube((center[0]+r*math.cos(a),y,center[1]+r*math.sin(a)),(center[0]+r*math.cos(b),y,center[1]+r*math.sin(b)),width,m,root)
path=json.load(open(os.path.join(ROOT,'public/assets/coaster-path.json'),encoding='utf8'));samples=path['samples'];frames=[]
for i,s in enumerate(samples):
 p=Vector(s['p']);t=(Vector(samples[min(i+1,len(samples)-1)]['p'])-Vector(samples[max(0,i-1)]['p'])).normalized();u=Vector(s['up']);r=t.cross(u).normalized();u=r.cross(t).normalized();frames.append((p,t,u,r))
# Triangular spine, paired running rails, cross ties, running wheels and lift access.
for i,(p,t,u,r) in enumerate(frames[:-1]):
 q,qt,qu,qr=frames[i+1]
 for side in [-1,1]:tube(p+r*.62*side,q+qr*.62*side,.075,rail)
 tube(p-u*.46,q-qu*.46,.12,rail)
 if i%3==0:
  tube(p-r*.68,p+r*.68,.045,rail);tube(p-r*.57,p-u*.46,.035,rail);tube(p+r*.57,p-u*.46,.035,rail)
 if samples[i]['phase']=='lift':
  tube(p-u*.15,q-qu*.15,.026,steel)
  if i%2==0: tube(p+r*1.02,p+r*1.62,.025,steel)
  tube(p+r*1.67+u*.9,q+qr*1.67+qu*.9,.023,steel)
  if i%7==0:tube(p+r*1.67,p+r*1.67+u*.9,.022,steel)
# Bent supports are deliberately outside the track clearance envelope.
for i in range(18,len(frames)-18,19):
 p,t,u,r=frames[i]
 if p.y<3:continue
 side=1 if i%2 else -1;anchor=p+r*(4.3*side);anchor.y=.18
 top=p-u*.75;tube(anchor,top,.19,blue,n=10);box((anchor.x,.05,anchor.z),(1.7,.25,1.7),concrete)
 if p.y>14:
  anchor2=anchor+Vector((0,0,6));tube(anchor2,top,.15,blue);box((anchor2.x,.05,anchor2.z),(1.5,.25,1.5),concrete)
# Functional station, restrained surroundings.
box((-2.7,1.15,56),(3.3,2.2,36),concrete);box((-2.7,2.31,56),(3.5,.08,36),white)
for x in [-4.6,1.7]:
 for z in [39,56,73]:tube((x,0,z),(x,6,z),.10,blue)
box((-1.5,6,56),(7,.16,37),white)
for i in range(12):box((-6.0, .10+i*.19,74-i*.35),(2,.20,.36),concrete)
for z in range(39,74,2):tube((-4.3,2.4,z),(-4.3,3.3,z),.035,blue)
tube((-4.3,3.3,39),(-4.3,3.3,73),.035,blue)
box((58,1.1,79),(4,2.2,18),concrete);box((58,2.3,79),(4,.12,18),white)
box((0,-.2,0),(240,.3,250),grass)
for x,z,w,d in [(-10,38,7,50),(57,60,7,55),(5,64,110,7)]:box((x,.015,z),(w,.03,d),concrete)
for i in range(60):
 a=random.uniform(0,math.tau);r=random.uniform(98,119);x,z=math.cos(a)*r,math.sin(a)*r;h=random.uniform(5,10)
 tube((x,0,z),(x,h*.65,z),.21,concrete,n=5);tube((x,h*.3,z),(x,h,z),random.uniform(2,4),leaves,n=7,r2=.05)
for i in range(15):
 a=i*math.tau/15;x,z=math.cos(a)*190,math.sin(a)*190;tube((x,-5,z),(x,random.uniform(25,45),z),random.uniform(30,52),hills,n=8,r2=4)
# One reusable four-seat car. Six cars are articulated along the exported path in-game.
root='TrainCar'
outline=[]
for cx,cz,start in [(.60,-1.37,-math.pi/2),(.60,1.37,0),(-.60,1.37,math.pi/2),(-.60,-1.37,math.pi)]:
 for i in range(9):
  a=start+i*math.pi/16;outline.append((cx+.28*math.cos(a),cz+.28*math.sin(a)))
verts=[(x*s,y,z*s) for y,s in [(.20,.89),(.42,1),(.78,1)] for x,z in outline];n=len(outline)
faces=[tuple(range(n-1,-1,-1))]
for row in range(2):
 for i in range(n):faces.append((row*n+i,row*n+(i+1)%n,(row+1)*n+(i+1)%n,(row+1)*n+i))
add(verts,faces,red,root);box((0,.30,0),(1.5,.20,3.10),steel,root)
for x in [-.82,.82]:
 box((x,.83,0),(.14,.34,2.80),red,root);box((x,.68,0),(.16,.08,2.80),rail,root)
 tube((x,1.01,-1.35),(x,1.01,1.35),.046,steel,root,n=12)
 for z in [-1.14,1.1]:
  box((x,.11,z),(.15,.14,.63),steel,root)
  for dz in [-.16,.16]:tube((x-.085,-.02,z+dz),(x+.085,-.02,z+dz),.155,dark,root,n=16)
for z in [-.68,.82]:
 for x in [-.43,.43]:
  box((x,.86,z),(.64,.20,.62),dark,root);box((x,1.26,z+.32),(.65,.82,.17),dark,root)
  for side in [-1,1]:
   tube((x+side*.27,1.63,z+.3),(x+side*.27,1.3,z-.30),.047,steel,root)
   tube((x+side*.27,1.3,z-.30),(x+side*.27,.95,z-.30),.055,dark,root)
  tube((x-.27,1.0,z-.3),(x+.27,1.,z-.3),.042,steel,root)
for i in range(24):
 a=math.pi+i*math.pi/24;b=math.pi+(i+1)*math.pi/24
 add([(.88*math.cos(t),y,-1.36+.32*math.sin(t)) for y in [.42,1.04] for t in [a,b]],[(0,1,3,2)],red,root)
 tube((.88*math.cos(a),1.04,-1.36+.32*math.sin(a)),(.88*math.cos(b),1.04,-1.36+.32*math.sin(b)),.035,rail,root)

# Room II is an actual 28-metre rotunda, with an open circular dome and colonnade.
root='Rotunda';tube((0,-.15,0),(0,0,0),14,ivory,root,n=128)
ring((0,0),13.6,.02,gold,.045,root);ring((0,0),6,.02,gold,.035,root);ring((0,0),2.6,.02,gold,.025,root)
for i in range(64):
 a=i*math.tau/64;b=(i+1)*math.tau/64
 # Door gaps at north and south: the northern portal retains access to the existing princess suite.
 if abs(math.cos((a+b)/2))<.09:continue
 verts=[(r*math.cos(t),y,r*math.sin(t)) for y in [0,6.6] for r,t in [(13.8,a),(13.8,b),(14.1,b),(14.1,a)]]
 add(verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],pink,root)
for i in range(20):
 a=i*math.tau/20+.08;x,z=12.8*math.cos(a),12.8*math.sin(a)
 if abs(x)<2.1:continue
 tube((x,.25,z),(x,6.3,z),.22,ivory,root,n=16)
 for y in [.15,.35,6.15,6.35]:tube((x,y-.06,z),(x,y+.06,z),.34,gold if y in [.35,6.15] else ivory,root,n=16)
for z in [-13.45,13.45]:
 for x in [-1.6,1.6]:box((x,2.1,z),(.25,4.2,.35),ivory,root)
 box((0,4.35,z),(3.6,.7,.35),ivory,root)
for r,y in [(13.7,6.55),(13.3,6.85),(12,7.5),(10,8.7),(7,9.7),(4,10.3)]:ring((0,0),r,y,ivory,.18,root)
for i in range(20):
 a=i*math.tau/20
 last=None
 for j in range(25):
  t=j/24;r=13.7-(9.7*t);y=6.6+3.7*math.sin(t*math.pi/2);p=(r*math.cos(a),y,r*math.sin(a))
  if last:tube(last,p,.055,gold,root)
  last=p
# Low central fountain and curved perimeter benches leave generous walking space.
tube((0,.02,0),(0,.38,0),2.35,ivory,root,n=64);tube((0,.39,0),(0,.42,0),2.13,mat('Still rose water',(.54,.70,.75),.5,.16),root,n=64)
ring((0,0),2.27,.43,gold,.045,root)
for a in [-.7,.7,2.44,3.84]:
 for i in range(14):
  t=a+(i-6.5)*.028;x,z=11.4*math.cos(t),11.4*math.sin(t)
  tube((x,.4,z),(x,.51,z),.29,ivory,root,n=8)

roots={}
for (root,m),(vertices,faces) in batches.items():
 if root not in roots:
  g=bpy.data.objects.new(root,None);scene.collection.objects.link(g);roots[root]=g
 mesh=bpy.data.meshes.new(root+' '+m);mesh.from_pydata(vertices,[],faces);mesh.materials.append(materials[m]);mesh.update()
 ob=bpy.data.objects.new(root+' '+m,mesh);scene.collection.objects.link(ob);ob.parent=roots[root]
 if any(k in m for k in ['rails','steel','hardware','water']):
  for p in mesh.polygons:p.use_smooth=True
roots['TrainCar'].location=xyz((0,2,42));roots['Rotunda'].location=xyz((130,0,65))
scene.world.color=(.35,.45,.55)
sun_data=bpy.data.lights.new('Daylight','SUN');sun_data.energy=2;sun=bpy.data.objects.new('Daylight',sun_data);scene.collection.objects.link(sun);sun.rotation_euler=(.45,-.6,-.7)
cam_data=bpy.data.cameras.new('Overview');cam=bpy.data.objects.new('Overview',cam_data);scene.collection.objects.link(cam);cam.location=xyz((125,100,160));direction=Vector(xyz((0,10,-5)))-cam.location;cam.rotation_euler=direction.to_track_quat('-Z','Y').to_euler();cam_data.lens=38;scene.camera=cam
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/seoulland-transfer.blend'))
for root,filename in [('Environment','coaster-environment.glb'),('TrainCar','coaster-car.glb'),('Rotunda','room-two-rotunda.glb')]:
 bpy.ops.object.select_all(action='DESELECT');g=roots[root];g.location=(0,0,0);g.select_set(True)
 for ob in g.children:ob.select_set(True)
 bpy.context.view_layer.objects.active=g
 bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/assets',filename),use_selection=True,export_format='GLB',export_animations=False,export_cameras=False,export_lights=False)
print('COASTER_BUILD_OK',len(scene.objects),sum(len(o.data.polygons) for o in scene.objects if o.type=='MESH'))
