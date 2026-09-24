"""Reference-led construction details, batched by room/material for the web.
See docs/공간-조작-리디자인.md. Game coordinates are metres, Y up.
Run in a separate scene; the existing chapter and character scenes are untouched.
"""
import bpy, bmesh, math, os, json
from mathutils import Vector, Matrix, Quaternion
ROOT=r'C:\Users\user\Downloads\500일 방탈출'
if bpy.data.scenes.get('Interior_Detail_Library'):
    raise RuntimeError('Inspect the existing detail scene before rebuilding.')
scene=bpy.data.scenes.new('Interior_Detail_Library')
bpy.context.window.scene=scene
batches={};materials={};room='rescue'
def xyz(p):return (p[0],-p[2],p[1])
def linear(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
def material(name,hex,rough=.6,metal=0,emission=0):
    m=bpy.data.materials.new('Detail '+name);m.use_nodes=True
    p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    rgb=tuple(linear(int(hex[i:i+2],16)/255) for i in [1,3,5]);p.inputs['Base Color'].default_value=(*rgb,1)
    p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    if emission:p.inputs['Emission Color'].default_value=(*rgb,1);p.inputs['Emission Strength'].default_value=emission
    materials[name]=m;return name
white=material('porcelain','#f4f8fa',.38);linen=material('linen','#e5edf1',.95)
wood=material('oak','#95643e',.57);dark=material('ink','#1d2b39',.5)
gold=material('satin brass','#cba05a',.3,.8);steel=material('stainless steel','#b6c3cf',.28,.9)
teal=material('teal upholstery','#308f8c',.85);red=material('lacquer red','#ba2038',.3)
glass=material('daylight','#b7e2f9',.2,0,.35);opal=material('opal diffuser','#fff4db',.45,0,.65)
leaf=material('leaves','#397c45',.84);soil=material('soil','#32271e',1)
def append(bm,mat,smooth=False):
    bm.verts.ensure_lookup_table();bm.verts.index_update()
    vertices,faces,smoothing=batches.setdefault((room,mat),([],[],[]));offset=len(vertices)
    vertices.extend(tuple(v.co) for v in bm.verts)
    faces.extend(tuple(offset+v.index for v in f.verts) for f in bm.faces)
    smoothing.extend(smooth for f in bm.faces);bm.free()
def box(p,s,mat,bevel=.015):
    bm=bmesh.new();bmesh.ops.create_cube(bm,size=1)
    transform=Matrix.Translation(xyz(p))@Matrix.Diagonal((s[0],s[2],s[1],1))
    bmesh.ops.transform(bm,matrix=transform,verts=list(bm.verts))
    if bevel:bmesh.ops.bevel(bm,geom=list(bm.edges),offset=min(bevel,min(s)*.3),segments=4,affect='EDGES')
    append(bm,mat)
def rod(a,b,r,mat):
    a,b=Vector(xyz(a)),Vector(xyz(b));delta=b-a
    bm=bmesh.new();bmesh.ops.create_cone(bm,cap_ends=True,cap_tris=False,segments=10,radius1=r,radius2=r,depth=delta.length)
    transform=Matrix.Translation((a+b)/2)@delta.to_track_quat('Z','Y').to_matrix().to_4x4()
    bmesh.ops.transform(bm,matrix=transform,verts=list(bm.verts));append(bm,mat)
def oval(p,s,mat):
    bm=bmesh.new();bmesh.ops.create_uvsphere(bm,u_segments=16,v_segments=8,radius=1)
    bmesh.ops.transform(bm,matrix=Matrix.Translation(xyz(p))@Matrix.Diagonal((s[0],s[2],s[1],1)),verts=list(bm.verts));append(bm,mat,True)
def curve(points,r,mat):
    for a,b in zip(points,points[1:]):rod(a,b,r,mat)
def plant(x,z,size=1):
    box((x,.22*size,z),(.42*size,.44*size,.42*size),white,.055)
    box((x,.45*size,z),(.35*size,.015,.35*size),soil,0)
    for i in range(9):
        a=i*2.4;h=.6+(i%4)*.2;dx=math.cos(a)*.23;dz=math.sin(a)*.23
        rod((x,.4*size,z),(x+dx*size,h*size,z+dz*size),.011*size,leaf)
        oval((x+dx*size,h*size,z+dz*size),(.11*size,.20*size,.035*size),leaf)
def sconce(x,y,z):
    box((x,y,z),(.17,.31,.07),gold)
    rod((x,y,z+.05),(x,y,z+.24),.022,gold)
    oval((x,y+.18,z+.24),(.13,.22,.13),opal)

# Care room: a deep window bay, sitting ledge and bedside scale details.
room='rescue'
box((-5.78,2.15,1.05),(.06,2.2,2.8),glass)
for z in [-.43,2.53]:box((-5.60,2.12,z),(.38,2.42,.12),wood)
for y in [.89,3.35]:box((-5.60,y,1.05),(.38,.13,3.05),wood)
box((-5.50,1.07,1.05),(.5,.055,2.85),white)
box((-5.48,2.12,1.05),(.12,2.17,.05),white)
box((-5.34,.30,1.05),(.92,.60,2.92),wood,.035)
box((-5.24,.64,1.05),(.85,.16,2.73),teal,.07)
for z in [-.03,2.13]:box((-5.31,.86,z),(.56,.30,.65),linen,.09)
box((1.7,1.19,-3.48),(2.24,.77,.11),linen,.05)
for x in [.77,1.23,1.7,2.17,2.63]:box((x,1.19,-3.418),(.009,.66,.006),white,0)
for y in [.45,.8]:
    box((3.9,y,-2.45),(.60,.29,.03),wood)
    rod((3.76,y,-2.414),(4.04,y,-2.414),.013,gold)
box((3.92,1.126,-2.64),(.30,.018,.20),white)
oval((3.92,1.15,-2.64),(.10,.014,.07),steel)
for x in [.22,3.2]:
    box((x,1.1,-4.77),(.19,.30,.055),white)
    for dx in [-.04,.04]:oval((x+dx,1.13,-4.732),(.018,.018,.008),dark)
    sconce(x,2.65,-4.69)
plant(4.9,-4.1,.86)
for cx in [0,12,24,47]:
    box((cx,.13,-4.79),(11.4,.24,.09),white)
    box((cx,.27,-4.73),(11.4,.035,.055),wood)
    box((cx,3.95,-4.78),(11.4,.09,.14),white)
# Boutique: a shoe bench and recessed display shelving; the exit aisle remains open.
box((10,.30,4.43),(2.6,.6,.72),wood,.035);box((10,.64,4.43),(2.65,.16,.76),linen,.05)
for x in [9.05,10.0,10.95]:
    box((x,.23,4.02),(.65,.27,.05),dark)
    for dx in [-.15,.15]:oval((x+dx,.21,3.96),(.09,.07,.2),dark)
for x in [10.7,14.4]:
    rod((x,3.9,-3.6),(x,3.9,2),.025,dark)
    for z in [-2.4,-.3,1.8]:
        rod((x,3.9,z),(x,3.65,z),.024,dark);oval((x,3.61,z),(.095,.08,.095),opal)
# Atlas dining room: a wall console and a group of fine pendants establish a table zone.
box((24,.5,4.51),(4.7,1,.55),wood,.04)
for x in [22.25,23.4,24.55,25.7]:
    box((x,.55,4.22),(1.09,.78,.035),wood)
    rod((x+.36,.6,4.18),(x+.36,.77,4.18),.012,gold)
for x in [22.8,24.0]:
    rod((x,4,.9),(x,2.7,.9),.014,dark);oval((x,2.55,.9),(.26,.15,.26),opal)
plant(19.1,-3.8,1.1);plant(28.6,4.2,.8)
# Earthquake lane: louvers, eaves, drain pipes, and fabric curtains, set behind the walk path.
for x in [33,36,39]:
    box((x,3.14,-3.88),(2.87,.12,.57),dark)
    for k in range(12):box((x-1.28+k*.23,3.23,-3.9),(.09,.08,.60),dark,.006)
    for k in range(5):box((x-1+k*.5,2.17,-3.88),(.475,.53,.02),teal,.006)
    for k in range(7):box((x-1.1+k*.36,.35,-3.97),(.028,.54,.055),wood,.004)
    rod((x+1.35,.14,-3.95),(x+1.35,3.68,-3.95),.045,steel)
    for y in [.55,1.7,2.85]:box((x+1.35,y,-3.98),(.14,.04,.1),steel)
for x in range(31,42):
    box((x,.134,3.92),(.84,.015,.035),dark,0)
    for z in [3.88,4.12,4.36,4.6]:box((x,.126,z),(.025,.012,.21),dark,0)

# Salon: symmetrical relief above the frame axes, with slender highlight edges.
room='salon'
for x in [-4.65,-3.05,-1.45,.15]:
    for side in [-1,1]:
        points=[]
        for i in range(32):
            t=i/31*math.pi*2.1;radius=.13*(1-i/42)
            points.append((x+side*(.15+math.cos(t)*radius),3.85+math.sin(t)*radius,-5.65))
        curve(points,.014,gold)
    oval((x,3.84,-5.65),(.065,.10,.035),gold)
for x in [-5.8,5.8]:
    box((x,4.25,0),(.055,.065,11.5),white)
    box((x,4.35,0),(.08,.07,11.5),gold)

# Arrival hall: seating niches read as part of the radial architecture.
room='rotunda'
for x in [-7.7,7.7]:
    box((x,.24,2.8),(1.6,.48,3.6),white,.07)
    box((x,.53,2.8),(1.48,.16,3.47),teal,.06)
    for z in [1.25,4.35]:box((x,.76,z),(1.20,.30,.46),linen,.08)
    plant(x,5.5,.9)

# Market: dark plinths and consistent shelf-end hardware, bright linear ceiling fixtures.
room='kitchen'
for x in [-4.5,0,4.5]:
    box((x,.055,0),(1.36,.11,8.03),dark)
    for z in [-4.05,4.05]:
        for side in [-.57,.57]:box((x+side,1.3,z),(.045,2.5,.035),steel,.004)
for x in [-6.2,-2.2,2.2,6.2]:
    for z in [-4,1,6]:
        box((x,5.05,z),(2.8,.09,.18),dark)
        box((x,4.993,z),(2.68,.025,.12),opal)

# Aircraft suite: armrest controls, reading light, storage lips and upholstery piping.
room='journey'
for z in [4,.2,-3.6]:
    for x in [21.4,26.6]:
        side=1 if x<24 else -1
        box((x+side*.86,7.065,z-.35),(.26,.025,.4),dark,.016)
        for k in range(3):oval((x+side*.86,7.089,z-.46+k*.1),(.033,.008,.028),steel)
        rod((x+side*.86,7.1,z+.75),(x+side*.73,7.51,z+.71),.013,steel)
        oval((x+side*.7,7.51,z+.69),(.062,.037,.06),opal)
        for dx in [-.6,.6]:box((x+dx,6.64,z),(.012,.013,1.43),linen,.003)
        box((x+side*.69,6.61,z-.71),(.023,.28,.035),gold,.005)
# Chinese dining: dark perimeter wainscoting and a repeated thin lattice above it.
for side in [-1,1]:
    x=50+side*11.72
    box((x,.65,-1),(.11,1.3,28),dark)
    box((x-side*.04,1.32,-1),(.08,.055,28),gold)
    for z in range(-13,13,2):
        for dz in [-.72,.72]:box((x-side*.04,2.9,z+dz),(.06,2.6,.035),gold,.004)
        for y in [1.7,2.4,3.8]:box((x-side*.04,y,z),(.06,.035,1.48),gold,.004)

roots={}
for (key,mat),(vertices,faces,smoothing) in batches.items():
    if key not in roots:
        root=bpy.data.objects.new('Design_'+key,None);scene.collection.objects.link(root);roots[key]=root
    mesh=bpy.data.meshes.new('DetailGeometry_'+key+'_'+mat);mesh.from_pydata(vertices,[],faces);mesh.materials.append(materials[mat]);mesh.update()
    for polygon,smooth in zip(mesh.polygons,smoothing):polygon.use_smooth=smooth
    obj=bpy.data.objects.new('Detail_'+key+'_'+mat,mesh);scene.collection.objects.link(obj);obj.parent=roots[key]
    obj.select_set(True)
for root in roots.values():root.select_set(True)
os.makedirs(os.path.join(ROOT,'public/assets/details'),exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'public/assets/details/interiors.glb'),use_active_scene=True,use_selection=True,export_yup=True)
bpy.data.libraries.write(os.path.join(ROOT,'blender/interior-detail-library.blend'),{scene})
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_location=Vector((-.5,1,1.9));area.spaces.active.region_3d.view_distance=13
        area.spaces.active.region_3d.view_rotation=Quaternion((1,0,0),math.pi/2)
        area.spaces.active.shading.type='MATERIAL'
print(json.dumps({'scene':scene.name,'rooms':list(roots),'meshes':len(batches),'objects':len(scene.objects)}))
