"""100-day salon joinery, draped textiles and woven rug; run before static batching."""
ASSET_DIR=os.path.join(OUT,'salon')

def color_srgb(h):
 c=[int(h[i:i+2],16)/255 for i in (1,3,5)]
 return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c)

def finish(n,c,rough=.5,metal=0):return mat(n,color_srgb(c),metal,rough)

joinery=finish('Porcelain painted window','#f3efe3',.34)
reveal=finish('Window recessed stone','#acbcb8',.68)
curtain=finish('Raspberry silk velvet','#b44460',.69)
lining=finish('Pearl curtain lining','#eee6d3',.83)
braid=finish('Champagne textile braid','#c5a66c',.76)
wool=finish('Aubusson bound wool','#c7bc9f',.97)
for m in [curtain,lining]:
 bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 bs.inputs['Sheen Weight'].default_value=.26
 bs.inputs['Sheen Roughness'].default_value=.75

def mapped_material(n,filename,rough,emission=0):
 m=mat(n,(1,1,1),0,rough)
 bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 im=bpy.data.images.load(os.path.join(ASSET_DIR,filename),check_existing=True);im.pack()
 tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im
 m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
 if emission:
  m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Emission Color']);bs.inputs['Emission Strength'].default_value=emission
 return m

rugmat=mapped_material('Aubusson handwoven floral wool','aubusson-wool-color.jpg',.96)
sky=mapped_material('Clear morning window glass','morning-sky.jpg',.29,.32)

def surface(n,points,faces,m,g=None,uv=None):
 me=bpy.data.meshes.new(n);me.from_pydata([xyz(p) for p in points],[],faces);me.materials.append(m)
 if uv:
  layer=me.uv_layers.new(name='UVMap')
  for p in me.polygons:
   for li in p.loop_indices:layer.data[li].uv=uv[me.loops[li].vertex_index]
 ob=bpy.data.objects.new(n,me);scene.collection.objects.link(ob);parent(ob,g)
 for p in me.polygons:p.use_smooth=True
 return ob

def textile_grid(n,fn,m,g,nu=64,nv=52):
 verts=[fn(i/nu,j/nv) for j in range(nv+1) for i in range(nu+1)]
 faces=[]
 for j in range(nv):
  for i in range(nu):
   a=j*(nu+1)+i;faces.append((a,a+1,a+nu+2,a+nu+1))
 ob=surface(n,verts,faces,m,g,[(i/nu,j/nv) for j in range(nv+1) for i in range(nu+1)])
 # Thin shell catches light on the hem while preserving real folds.
 mod=ob.modifiers.new('Stitched fabric thickness','SOLIDIFY');mod.thickness=.008
 return ob

for z0 in [-3.5,3.8]:
 g=group('ArchedWindow',(-5.64,0,z0));g.rotation_euler[2]=math.pi/2
 # A genuine arched silhouette: the fanlight is part of the glass outline.
 outline=[(-.94,1.32,0),(.94,1.32,0),(.94,3.12,0)]
 outline +=[(.94*math.cos(i*math.pi/64),3.12+.94*math.sin(i*math.pi/64),0) for i in range(1,65)]
 surface('Arched daylight glazing',outline,[tuple(range(len(outline)))],sky,g,[(.5+p[0]/1.88,(p[1]-1.32)/2.74) for p in outline])
 for radius,depth,thick,m in [(1.07,-.025,.085,reveal),(1.025,.025,.070,joinery),(.958,.095,.022,gold)]:
  pts=[(radius*math.cos(i*math.pi/64),3.12+radius*math.sin(i*math.pi/64),depth) for i in range(65)]
  ribbon('Sculpted arched casing',pts,thick,m,g)
  for side in [-1,1]:box('Layered window jamb',(side*radius,2.21,depth),(thick*2,1.82,.12),m,.013,g)
 for y in [1.34,2.24,3.12]:
  box('Painted sash transom',(0,y,.085),(1.90,.065,.115),joinery,.012,g)
  box('Transom gilt bead',(0,y+.028,.153),(1.88,.011,.012),gold,.004,g)
 for x in [-.31,.31]:box('Sash vertical mullion',(x,2.22,.08),(.040,1.77,.11),joinery,.008,g)
 for a in [math.pi/4,math.pi/2,math.pi*3/4]:
  line('Fanlight radial muntin',(0,3.12,.075),(.94*math.cos(a),3.12+.94*math.sin(a),.075),.018,joinery,g)
 ribbon('Fanlight inner semicircle',[(.26*math.cos(i*math.pi/32),3.12+.26*math.sin(i*math.pi/32),.10) for i in range(33)],.019,gold,g)
 for y,w,d in [(1.26,2.25,.35),(1.20,2.15,.26),(1.12,2.02,.19)]:box('Bullnose limestone sill',(0,y,.065),(w,.075,d),joinery,.026,g)
 for x in [-.055,.055]:
  box('Window latch plate',(x,2.18,.157),(.032,.12,.020),gold,.008,g)
  line('Window latch handle',(x,2.15,.18),(x,2.23,.20),.009,gold,g)

 # Two continuous panels. The waist draws the folds into a tie, the foot flares.
 for side in [-1,1]:
  def cloth(u,v,inset=0):
   y=.36+v*3.88
   pinch=math.exp(-((v-.38)/.15)**2)
   width=.77-.43*pinch
   center=1.22+.16*pinch
   x=side*(center+(u-.5)*width)
   z=.22+inset+(.071-.037*pinch)*math.cos(u*math.tau*7)+.045*math.sin(v*math.pi)
   return (x,y+.018*(1-v)**6*math.cos(u*math.tau*7),z)
  textile_grid('Tailored velvet drape',cloth,curtain,g)
  # Inner ivory lining peeks out from the drawn-back edge.
  def inner(u,v):
   x,y,z=cloth(u*.20,v,-.048)
   return (x-side*.068,y+.025,z)
  textile_grid('Ivory turned lining',inner,lining,g,16,40)
  for edge in [0,1]:ribbon('Sewn curtain piping',[cloth(edge,k/72) for k in range(73)],.007,braid,g)
  ribbon('Weighted embroidered hem',[cloth(k/96,.022) for k in range(97)],.011,braid,g)
  tiey=.36+.38*3.88
  ribbon('Twisted tieback cord',[(side*(1.21+k*.012),tiey-.045*math.sin(k/30*math.pi),.32+.037*math.sin(k/30*math.pi)) for k in range(31)],.017,braid,g)
  ribbon('Tassel suspension',[(side*1.31,tiey,.32),(side*1.22,tiey-.17,.35),(side*1.25,tiey-.28,.35)],.012,braid,g)
  sphere('Tassel woven knot',(side*1.25,tiey-.29,.35),(.045,.050,.045),braid,g)
  for k in range(12):
   a=k*math.tau/12
   ribbon('Fine tassel strand',[(side*1.25+.015*math.cos(a),tiey-.32,.35+.015*math.sin(a)),(side*1.25+.040*math.cos(a),tiey-.49,.35+.040*math.sin(a))],.005,braid,g)
  for k in range(7):
   x=side*(.87+k*.115)
   torus('Brass curtain ring',(x,4.28,.22),.04,.008,gold,g,True)
 # Draped scalloped valance with layered pleats instead of a thick rope.
 for center in [-.73,.73]:
  def swag(u,v):
   curve=math.sin(math.pi*u)
   return (center+(u-.5)*1.48,4.27-.07*curve-v*(.11+.26*curve),.28+.07*math.sin(math.pi*v)+.018*math.cos(v*math.tau*5)*curve)
  textile_grid('Pleated scalloped valance',swag,curtain,g,48,20)
  ribbon('Valance gold fringe header',[swag(k/64,1) for k in range(65)],.012,braid,g)
  for k in range(41):
   x,y,z=swag(k/40,1)
   line('Valance silk fringe',(x,y,z),(x,y-.047,z+.004),.004,braid,g)
 line('Fluted curtain pole',(-1.71,4.35,.20),(1.71,4.35,.20),.024,gold,g)
 for side in [-1,1]:sphere('Curtain rod finial',(side*1.77,4.35,.20),(.080,.045,.045),gold,g)

# Soft rectangular wool, a single uninterrupted UV design, bound edge and fringe.
box('Aubusson cushioned backing',(0,.045,-.7),(4.25,.034,4.65),wool,.023)
surface('Aubusson woven face',[(-2.10,.065,-3.0),(2.10,.065,-3.0),(2.10,.065,1.60),(-2.10,.065,1.60)],[(0,3,2,1)],rugmat,uv=[(0,0),(1,0),(1,1),(0,1)])
for side in [-1,1]:
 z=-.7+side*2.326
 for i in range(126):
  x=-2.075+i*.0332
  ribbon('Knotted wool fringe',[(x,.053,z),(x+.004,.049,z+side*.055),(x+random.uniform(-.012,.012),.038,z+side*random.uniform(.095,.14))],.005,lining)

# Keep the native edit source close to the neutral daylight used in the game.
for o in scene.objects:
 if o.type=='LIGHT':o.data.color=(1,.94,.85) if 'blue' not in o.name else (.80,.90,1)
 if o.type=='MESH' and o.name.startswith(('coffer beam','continuous moulding')) and o.data.materials[0]==darkwood:
  o.data.materials[0]=joinery
print('SALON_TEXTILES_OK')
