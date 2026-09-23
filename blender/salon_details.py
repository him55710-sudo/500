"""Original meshes inspired by Garnier's foyer, painted Erzgebirge figures and ROKR carousels.
Executed inside build_room.py before static batching. No external model is copied.
"""
def erase(root):
 for c in list(root.children):erase(c)
 bpy.data.objects.remove(root,do_unlink=True)

def lathe(n,profile,m,g=None,segments=32,flute=0):
 verts=[];faces=[]
 for y,r in profile:
  for j in range(segments):
   a=j*math.tau/segments;rr=r*(1+flute*math.cos(a*12));verts.append(xyz((rr*math.cos(a),y,rr*math.sin(a))))
 for k in range(len(profile)-1):
  for j in range(segments):a=k*segments+j;b=k*segments+(j+1)%segments;faces.append((a,b,b+segments,a+segments))
 faces.extend([tuple(range(segments-1,-1,-1)),tuple((len(profile)-1)*segments+j for j in range(segments))])
 mesh=bpy.data.meshes.new(n);mesh.from_pydata(verts,[],faces);mesh.materials.append(m);ob=bpy.data.objects.new(n,mesh);scene.collection.objects.link(ob)
 for f in mesh.polygons:f.use_smooth=True
 return parent(ob,g)

def ribbon(n,points,width,m,g=None):
 cu=bpy.data.curves.new(n,'CURVE');cu.dimensions='3D';cu.resolution_u=8;cu.bevel_depth=width;cu.bevel_resolution=2
 sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
 for b,p in zip(sp.bezier_points,points):b.co=xyz(p);b.handle_left_type='AUTO';b.handle_right_type='AUTO'
 ob=bpy.data.objects.new(n,cu);scene.collection.objects.link(ob);ob.data.materials.append(m);parent(ob,g)
 bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH');ob.select_set(False)
 return ob

def silhouette(n,points,depth,m,g=None):
 verts=[xyz((x,y,z)) for z in [-depth/2,depth/2] for x,y in points];nn=len(points)
 faces=[tuple(range(nn-1,-1,-1)),tuple(range(nn,2*nn))]+[(i,(i+1)%nn,(i+1)%nn+nn,i+nn) for i in range(nn)]
 mesh=bpy.data.meshes.new(n);mesh.from_pydata(verts,[],faces);mesh.materials.append(m);ob=bpy.data.objects.new(n,mesh);scene.collection.objects.link(ob)
 bevel=ob.modifiers.new('Carved softened edge','BEVEL');bevel.width=.007;bevel.segments=2
 ob.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return parent(ob,g)

# Warm cream plaster, champagne trim and wine velvet replace the green box room.
for material,color in [(teal,(.55,.46,.34)),(panel,(.33,.25,.17)),(gold,(.46,.29,.11)),(lightgold,(.67,.47,.23)),(cream,(.82,.73,.55)),(skin,(.88,.65,.44)),(red,(.22,.023,.04))]:
 bs=next(n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(*color,1)
 for link in list(material.node_tree.links):
  if link.to_socket==bs.inputs['Base Color'] and material==teal:material.node_tree.links.remove(link)
ivory=mat('Salon carved ivory',(.68,.57,.42),0,.72)
stone=mat('Calacatta warm marble',(.73,.68,.56),.08,.42)
lacquer=mat('Violinist midnight lacquer',(.025,.08,.16),.12,.3)
rose=mat('Ballerina garnet lacquer',(.32,.04,.064),.05,.34)
sage=mat('Conductor forest lacquer',(.04,.13,.105),.05,.36)
cheek=mat('Painted blush',(.62,.19,.14),0,.65)

# Paired pilasters with fluted shafts, layered capitals and volutes.
for side in [-1,1]:
 for z in [-5.1,-2.65,.7,5.25]:
  col=group('SalonPilaster',(side*5.68,0,z))
  box('marble plinth',(0,.17,0),(.38,.34,.43),stone,.025,col)
  for yy,rr,dd in [(.36,.24,.08),(.47,.19,.1),(3.78,.20,.10),(3.91,.25,.14),(4.08,.28,.09)]:cyl('capital moulding',(0,yy,0),rr,dd,gold if yy in [.47,3.78] else ivory,col)
  shaft=lathe('Fluted pilaster',[(.49,.15),(.62,.16),(3.55,.135),(3.76,.17)],ivory,col,36,.06)
  for k in range(8):
   a=k*math.tau/8;leaf=sphere('acanthus leaf',(.18*math.cos(a),3.8,.18*math.sin(a)),(.048,.13,.045),gold,col);leaf.rotation_euler[1]=.3
  for zz in [-.2,.2]:
   scroll=torus('capital volute',(0,3.99,zz),.069,.012,gold,col,True);scroll.rotation_euler[2]=math.pi/2

# Deep arches and pleated curtains turn the two flat rain windows into alcoves.
for z0 in [-3.5,3.8]:
 arch=group('ArchedWindow',(-5.60,0,z0));arch.rotation_euler[2]=math.pi/2
 for radius in [1.01,1.065]:
  points=[(radius*math.cos(i*math.pi/32),3.15+radius*math.sin(i*math.pi/32),0) for i in range(33)]
  ribbon('arched gold reveal',points,.029,gold,arch)
 for xx in [-1.04,1.04]:
  box('arched jamb',(xx,2.26,0),(.07,1.84,.08),ivory,.015,arch)
  for j in range(6):
   x=xx+(.12+j*.063)*(1 if xx>0 else -1)
   latheob=lathe('velvet curtain fold',[(1.32,.04),(1.4,.066),(2.4,.048),(3.7,.061),(4.17,.049)],red,arch,12)
   latheob.location=xyz((x,0,.035))
  ribbon('curtain tie',[(xx,2.03,.08),(xx+( .24 if xx>0 else -.24),1.98,.14),(xx+(.43 if xx>0 else -.43),2.03,.08)],.027,gold,arch)
 ribbon('velvet swag',[(-1.43,4.16,.08),(-.8,3.97,.16),(0,4.14,.12),(.8,3.97,.16),(1.43,4.16,.08)],.11,red,arch)

# Tall gilded mirrors above the tasting console and beside the secret door.
mirror=mat('Antique silver mirror',(.28,.34,.37),.88,.2)
for xx in [-3.6,-1.3,1.1,3.5]:
 g=group('SalonMirror',(xx,0,5.78));g.rotation_euler[2]=math.pi
 box('reflective panel',(0,2.75,0),(1.32,2.22,.055),mirror,.09,g)
 for dx in [-.72,.72]:box('mirror stile',(dx,2.75,.04),(.055,2.36,.08),gold,.015,g)
 for yy in [1.59,3.91]:box('mirror cornice',(0,yy,.04),(1.48,.055,.08),gold,.015,g)
 ribbon('mirror crest',[(-.5,3.94,.05),(-.25,4.13,.05),(0,4.05,.05),(.25,4.13,.05),(.5,3.94,.05)],.024,gold,g)

# Oval ceiling medallion, pearl drops and curved chandelier arms.
for radius in [1.27,1.36,1.48]:
 ob=torus('ceiling medallion',(0,4.68,-.7),radius,.027,gold);ob.scale.x=1.28
for i in range(12):
 a=i*math.tau/12;x,z=math.cos(a)*.76,math.sin(a)*.76-.7
 ribbon('swept chandelier arm',[(0,3.91,-.7),(x*.65,3.45,(z+.7)*.65-.7),(x,3.58,z)],.018,gold)
 for j in range(4):
  aa=a+(j/4)*math.tau/12;xx,zz=math.cos(aa)*.73,math.sin(aa)*.73-.7
  sphere('cut crystal pendant',(xx,3.46-abs(j-1.5)*.035,zz),(.018,.072,.018),white)
  sphere('crystal bead',(xx,3.55,zz),(.025,.026,.025),white)

# Rebuild all three dolls with distinctive carved clothing, faces, coiffures and poses.
for n in ['Doll_violinist','Doll_bear','Doll_dancer']:
 ob=scene.objects.get(n)
 if ob:erase(ob)

def painted_figure(name,pos,kind,paint):
 g=group(name,pos);g.rotation_euler[2]=math.pi/2
 lathe('tiered walnut display base',[(0,.205),(.03,.205),(.045,.19),(.07,.19)],darkwood,g)
 torus('base brass bead',(0,.04,0),.20,.008,gold,g)
 if kind=='dancer':
  for x in [-.036,.036]:line('stocking',(x,.07,0),(x,.27,0),.022,cream,g)
  lathe('pleated bell tutu',[(.22,.17),(.25,.185),(.29,.15),(.37,.061)],paint,g,48,.1)
  lathe('fitted bodice',[(.35,.06),(.44,.048),(.5,.069)],paint,g)
 else:
  lathe('carved brocade gown',[(.07,.142),(.095,.153),(.16,.145),(.3,.113),(.40,.07),(.45,.065),(.49,.086)],paint,g,48,.035)
  for y,r in [(.09,.151),(.15,.142),(.44,.065)]:torus('gold hem',(0,y,0),r,.004,gold,g)
  for j in range(32):
   a=j*2.4;y=.13+(j%6)*.043;r=.145-(y-.13)*.27
   sphere('gown handpainted flower',(math.cos(a)*r,y,math.sin(a)*r),(.004,.006,.004),gold,g)
 cyl('neck',(0,.505,0),.029,.055,skin,g)
 sphere('painted face',(0,.588,.006),(.075,.09,.07),skin,g)
 sphere('hair cap',(0,.636,-.015),(.079,.054,.065),hair,g)
 for side in [-1,1]:
  for j in range(4):sphere('sculpted curl',(side*.07,.63-j*.022,-.005),(.018,.019,.025),hair,g)
  sphere('painted eye',(side*.025,.601,.069),(.007,.008,.003),black,g)
  sphere('pink cheek',(side*.047,.577,.062),(.011,.006,.003),cheek,g)
 sphere('nose',(0,.584,.077),(.008,.014,.009),skin,g)
 ribbon('delicate smile',[(-.016,.557,.069),(0,.553,.074),(.016,.557,.069)],.002,cheek,g)
 for j in range(9):
  a=j*math.tau/9;sphere('crown pearl',(.055*math.cos(a),.67,.055*math.sin(a)),(.009,.011,.009),gold,g)
 if kind=='violinist':
  arms=[[(-.062,.468,0),(-.123,.415,.065),(-.15,.532,.12)],[(.062,.468,0),(.16,.438,.07),(.10,.535,.15)]]
 elif kind=='dancer':arms=[[(-.06,.47,0),(-.15,.6,.04),(-.06,.72,.04)],[(.06,.47,0),(.15,.6,.04),(.06,.72,.04)]]
 else:arms=[[(-.062,.47,0),(-.13,.41,.03),(-.15,.38,.13)],[(.062,.47,0),(.16,.48,.03),(.18,.57,.08)]]
 for pts in arms:
  ribbon('carved sleeve',pts,.026,paint,g);sphere('porcelain hand',pts[-1],(.025,.029,.019),skin,g)
 if kind=='conductor':line('ivory baton',(.18,.56,.09),(.23,.76,.11),.003,white,g)
 # Discrete fan-shaped wings reinforce the real painted-music-figure reference.
 if kind=='violinist':
  for side in [-1,1]:
   pts=[(side*.025,.43),(side*.20,.37),(side*.24,.50),(side*.17,.63),(side*.065,.55)]
   wing=silhouette('gilded fan wing',pts,.018,ivory,g);wing.location=xyz((0,0,-.065))
   for j in range(4):ribbon('wing engraving',[(side*.06,.46,-.08),(side*(.10+j*.034),.53+j*.02,-.08)],.003,gold,g)
 return g

violinist=painted_figure('Doll_violinist',(-4.62,.925,-.8),'violinist',lacquer)
painted_figure('Doll_bear',(-4.62,.925,-1.65),'conductor',sage)
painted_figure('Doll_dancer',(-4.62,.925,.0),'dancer',rose)

# Real violin outline: C bouts, scroll, f holes, tailpiece, fingerboard and four strings.
vg=scene.objects.get('ViolinKeyring')
for child in list(vg.children):erase(child)
outline=[(0,-.115),(-.075,-.108),(-.10,-.06),(-.096,-.015),(-.054,.025),(-.068,.065),(-.075,.106),(-.058,.141),(0,.152),(.058,.141),(.075,.106),(.068,.065),(.054,.025),(.096,-.015),(.10,-.06),(.075,-.108)]
silhouette('Carved violin body',outline,.045,wood,vg)
for side in [-1,1]:
 ribbon('violin f hole',[(side*.039,.079,.025),(side*.045,.05,.027),(side*.036,.012,.027),(side*.042,-.01,.025)],.004,black,vg)
 for y in [.221,.256]:sphere('tuning peg',(side*.032,y,.004),(.016,.006,.009),black,vg)
box('ebony fingerboard',(0,.16,.031),(.027,.25,.012),black,.004,vg)
silhouette('tailpiece',[(-.025,-.09),(.025,-.09),(.017,-.026),(-.017,-.026)],.015,black,vg).location=xyz((0,0,.031))
box('ivory bridge',(0,.017,.034),(.054,.022,.015),cream,.003,vg)
sphere('violin scroll',(0,.301,0),(.021,.027,.016),wood,vg)
for x in [-.0105,-.0035,.0035,.0105]:line('violin string',(x,-.065,.045),(x,.278,.045),.001,gold,vg)
torus('keepsake ring',(0,.354,0),.039,.006,gold,vg,True)

# Sculpted horses and a curved, striped canopy replace spheres and a plain cone.
car=scene.objects.get('Carousel')
for child in list(car.children):erase(child)
lathe('turned music mechanism',[(0,.37),(.035,.40),(.07,.40),(.09,.365),(.12,.365),(.135,.40),(.16,.40)],ivory,car,48)
for y,r in [(.02,.39),(.075,.397),(.135,.40),(.165,.385)]:torus('carousel gold moulding',(0,y,0),r,.007,gold,car)
lathe('central decorated column',[(.15,.067),(.20,.08),(.23,.05),(.62,.05),(.66,.08),(.7,.08)],gold,car)
for j in range(12):
 a=j*math.tau/12
 sphere('base ruby',(.38*math.cos(a),.107,.38*math.sin(a)),(.013,.021,.013),rose,car)
 # Twelve umbrella sections with a rounded profile and a scalloped hem.
 vertices=[];faces=[];prof=[(.68,.455),(.705,.438),(.74,.39),(.80,.28),(.89,.14),(.96,.035)]
 for h,r in prof:
  for k in range(5):
   aa=a+k*math.tau/48;vertices.append(xyz((r*math.cos(aa),h-(.018*math.sin(k*math.pi/4) if h==.68 else 0),r*math.sin(aa))))
 for k in range(5):
  for t in range(4):i=k*5+t;faces.append((i,i+1,i+6,i+5))
 me=bpy.data.meshes.new('canopy panel');me.from_pydata(vertices,[],faces);me.materials.append(rose if j%2 else ivory);ob=bpy.data.objects.new('scalloped canopy',me);scene.collection.objects.link(ob);parent(ob,car)
 for f in me.polygons:f.use_smooth=True
 ribbon('canopy gilt rib',[(r*math.cos(a),h,r*math.sin(a)) for h,r in prof],.005,gold,car)
 sphere('canopy pearl',(.45*math.cos(a),.681,.45*math.sin(a)),(.012,.021,.012),gold,car)
torus('carousel cornice',(0,.697,0),.445,.009,gold,car)
lathe('canopy finial',[(.94,.032),(.985,.029),(1.015,.012),(1.045,.001)],gold,car)
horse=[(-.105,.055),(-.071,.079),(-.014,.073),(.027,.106),(.036,.153),(.053,.181),(.059,.213),(.074,.193),(.09,.198),(.112,.168),(.132,.146),(.12,.132),(.08,.148),(.071,.107),(.091,.061),(.084,.016),(.13,-.02),(.125,-.037),(.105,-.035),(.048,.007),(.036,.040),(-.003,.026),(-.035,.038),(-.065,.004),(-.052,-.037),(-.072,-.038),(-.102,.008),(-.102,.034),(-.134,.012),(-.147,.024),(-.13,.069)]
for i in range(5):
 a=i*math.tau/5;g=group('CarouselHorse'+str(i));g.parent=car;g.location=xyz((math.cos(a)*.27,.39,math.sin(a)*.27));g.rotation_euler[2]=-a
 silhouette('carved galloping horse',horse,.05,white,g)
 ribbon('flowing mane',[(.048,.177,-.001),(.022,.155,-.001),(.014,.111,-.001),(-.018,.09,-.001)],.012,gold,g)
 sphere('horse eye',(.092,.17,.026),(.004,.004,.003),black,g)
 box('velvet saddle',(-.025,.074,0),(.073,.018,.069),rose,.008,g)
 for side in [-1,1]:ribbon('saddle gold edge',[(-.067,.063,side*.029),(-.025,.092,side*.038),(.012,.07,side*.027)],.003,gold,g)
 ribbon('bridle',[(.06,.177,.028),(.087,.154,.03),(.12,.148,.024)],.003,rose,g)
 line('brass ride pole',(math.cos(a)*.27,.16,math.sin(a)*.27),(math.cos(a)*.27,.72,math.sin(a)*.27),.007,gold,car)

# Curves were converted above; export batching can now merge them like ordinary meshes.
print('SALON_DETAILS_OK')
