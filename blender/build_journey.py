"""301–400: editable inferno, upper chapel, first class and Longge-inspired hall.
Uses batched geometry helpers from our previous chapter; creates a new scene only.
Coordinates below are game coordinates (Y up), converted on export.
"""
import bpy,math,random,os
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source=open(os.path.join(ROOT,'blender/build_rescue.py'),encoding='utf8').read().split('# Architectural suite:')[0]
exec(source.replace("Day_300_Save_Hyunsu","Day_400_Through_Fire_To_You"),globals())
ASSET=os.path.join(ROOT,'public/assets/journey');os.makedirs(ASSET,exist_ok=True)
random.seed(400)
lava=mat('Molten vermilion',(1,.11,.003),rough=.35,emit=3)
hot=mat('Magma core',(1,.52,.035),emit=5)
rock=mat('Volcanic basalt',(.042,.029,.038),rough=.97)
ash=mat('Cooled lava stone',(.105,.08,.08),rough=.95)
ivory=mat('Chapel porcelain',(.94,.9,.79),rough=.35)
crimson=mat('Longge lacquer red',(.53,.013,.018),rough=.27)
carpet=mat('Scarlet velvet',(.4,.012,.025),rough=1)
cloud=mat('Heaven blue',(.4,.7,.89),rough=.6,emit=.25)
leather=mat('First class midnight leather',(.025,.05,.11),rough=.47)
marble=mat('Warm ivory marble',(.79,.75,.65),rough=.23)
glass=mat('Luminous stained glass',(.97,.62,.11),rough=.25,emit=.8)

# Hell: genuinely molten channels under irregular stepping platforms, stalagmites and lava falls.
box((0,-.34,0),(16,.32,16),lava,'LavaRiver')
for x in [-7,-4,-1,2,5,7]:
 for z in [-7,-4,-1,2,5,7]:
  w=2.5 if abs(x)!=7 else 1.55;box((x,-.11,z),(w,.32,2.5),ash,'HellFloor')
for z in [-7.95,7.95]:box((0,2.65,z),(16,5.5,.4),rock,'HellArchitecture')
for x in [-7.95,7.95]:box((x,2.65,0),(.4,5.5,16),rock,'HellArchitecture')
for i in range(72):
 x=random.uniform(-7.7,7.7);z=random.choice([-7.65,7.65])+random.uniform(-.1,.1);h=random.uniform(.45,2.2)
 tube((x,-.1,z),(x+.2,h,z),random.uniform(.15,.55),rock,'BasaltTeeth',6,.02)
for x in [-6.5,-.2,3.5]:
 box((x,2.6,-7.68),(.32,5.2,.15),lava,'LavaFalls');box((x,2.6,-7.57),(.065,5.2,.035),hot,'LavaFalls')
for z in [-5,-1,3]:
 for x in [-7.68,7.68]:tube((x,0,z),(x,5.3,z),.38,rock,'HellPiers',7,.27)
text('301 — 400   /   THROUGH FIRE TO YOU',(0,4.45,-7.54),.29,'HellTitle',gold)
text('지옥에서도, 함께라면',(0,3.93,-7.54),.24,'HellTitle',paper)
# Corner prison with a separately pivoting bar door.
for x in [-7,-3.15]:
 for z in [-7,-6.5,-6,-5.5,-5,-4.5,-4]:tube((x,0,z),(x,3.6,z),.045,steel,'Prison')
for x in [-7,-6.6,-6.2,-5.8,-5.4,-5,-4.6,-4.2,-3.8,-3.4]:
 tube((x,0,-7),(x,3.6,-7),.043,steel,'Prison')
box((-5.05,3.62,-5.5),(4,.12,3.2),black,'Prison')
for y in [.1,3.5]:box((-5.05,y,-3.94),(4,.13,.15),steel,'Prison')
origins['PrisonDoor']=(-7,0,-3.9)
for x in [i*.38 for i in range(11)]:tube((x,.05,0),(x,3.5,0),.04,steel,'PrisonDoor')
box((3.4,1.4,.09),(.3,.35,.16),gold,'PrisonDoor');ring((3.4,1.64,.1),.1,.026,steel,'PrisonDoor',True)
box((-5.1,1.4,-6.83),(2.6,1.7,.1),walnut,'PhotoFrame')
# Desk, phone, computer, keyboard and passport.
box((.3,.85,-5.2),(4.7,.17,1.65),walnut,'Desk')
for x in [-1.85,2.45]:
 for z in [-5.85,-4.55]:tube((x,0,z),(x,.8,z),.065,steel,'Desk')
box((.7,1.65,-5.55),(1.8,1.13,.12),black,'Monitor');box((.7,1.65,-5.474),(1.65,.98,.018),blue,'ComputerScreen')
box((.7,1.03,-5.5),(.12,.4,.13),steel,'Monitor');box((.7,.97,-5.4),(.64,.055,.4),black,'Monitor')
box((.7,.975,-4.9),(1.15,.04,.35),black,'Keyboard')
for i in range(12):
 for j in range(4):box((.21+i*.086,1,-5.03+j*.07),(.064,.009,.05),charcoal,'Keyboard')
box((-1.1,.98,-4.95),(.34,.055,.65),black,'Phone');box((-1.1,1.012,-4.95),(.29,.01,.53),blue,'Phone')
box((1.95,.97,-4.97),(.36,.05,.5),navy,'Passport');text('PASSPORT',(1.95,1.18,-5.21),.052,'PassportTitle',gold)
box((2,.97,-5.66),(.61,.013,.3),paper,'TicketProp')
# Physical small stair up to the second floor, with brass handrails.
for i in range(24):
 z=5.75-i*.5;h=(i+1)*5.8/24;box((6.25,h/2,z),(2.4,h,.51),ash,'StairsToHeaven')
 tube((5.0,h+.08,z),(5.0,h+1.03,z),.025,gold,'StairsToHeaven')
 if i: tube((5,1.03+i*5.8/24,z+.5),(5,1.03+(i+1)*5.8/24,z),.035,gold,'StairsToHeaven')
# Chapel at an actual elevation of 5.8m. Stairwell remains open along the east side.
box((-1.5,5.66,0),(13,.28,16),ivory,'Chapel');box((6.25,5.66,-7),(2.5,.28,2),ivory,'Chapel')
box((0,9.3,8),(16,7,.22),ivory,'Chapel')
# Real aperture at the east end of the north wall, separate from the altar.
box((-3.5,9.3,-8),(9,7,.22),ivory,'Chapel');box((6,9.3,-8),(4,7,.22),ivory,'Chapel')
box((2.5,11.15,-8),(3,3.3,.22),ivory,'Chapel')
for x in [-8,8]:box((x,9.3,0),(.22,7,16),ivory,'Chapel')
box((0,12.85,0),(16,.22,16),ivory,'Chapel')
for x in [-6.7,-4.2,-1.7,.8,4.2,6.5]:
 tube((x,5.8,-7.6),(x,11.5,-7.6),.18,ivory,'ChapelColumns',16);ring((x,6,-7.6),.24,.04,gold,'ChapelColumns')
for z in [-5,-1,3,6]:
 for x in [-7.79,7.79]:
  box((x,9.7,z),(.08,3.1,1.7),cloud,'ChapelGlass')
  box((x-.01,9.7,z),(.12,3.2,.05),gold,'ChapelGlass');box((x-.01,9.5,z),(.12,.05,1.75),gold,'ChapelGlass')
box((-1,9.8,-7.73),(.18,2.7,.09),glass,'Cross');box((-1,10.25,-7.68),(1.6,.18,.12),glass,'Cross')
box((-1,6.1,-6.3),(3.6,.6,1.8),marble,'Altar')
for row in range(1,7):
 z=5.9-(row-1)*1.65
 for col,x in [('A',-3.1),('B',1.5)]:
  root='ChapelSeat'+str(row)+col;box((x,6.34,z),(2.65,.17,.66),walnut,root);box((x,6.8,z+.31),(2.7,.94,.12),walnut,root)
  for dx in [-1.13,1.13]:box((x+dx,6.06,z),(.1,.52,.6),walnut,root)
  text(str(row)+col,(x,6.82,z+.39),.17,'SeatNumbers',gold)
for z in [6-i*.6 for i in range(21)]:tube((4.94,5.8,z),(4.94,6.82,z),.025,gold,'GalleryRail')
tube((4.94,6.82,6),(4.94,6.82,-6),.04,gold,'GalleryRail')
box((-1,5.818,0),(1.8,.025,13),carpet,'ChapelRunner')
box((2.5,9.83,-7.72),(3.2,.72,.18),leather,'BoardingGateSign')
text('2F   |   ICN  >  YNT',(2.5,9.95,-7.60),.23,'GateTitle',paper)
text('비행기 탑승구  /  FIRST CLASS',(2.5,9.62,-7.60),.14,'GateTitle',gold)
for x in [.94,4.06]:box((x,7.65,-7.88),(.14,3.7,.35),gold,'BoardingGateFrame')
box((2.5,9.46,-7.88),(3.25,.14,.35),gold,'BoardingGateFrame')
origins['BoardingDoorLeft']=(1.75,5.8,-7.9);origins['BoardingDoorRight']=(3.25,5.8,-7.9)
for name in ['BoardingDoorLeft','BoardingDoorRight']:
 box((0,1.8,0),(1.47,3.58,.14),leather,name)
 box((0,2.15,.09),(1.18,1.65,.04),blue,name)
 box((0,2.15,.115),(1.02,1.48,.02),cloud,name)
 box((0,.46,.095),(1.17,.46,.025),gold,name)
 tube((.45 if name.endswith('Left') else -.45,1.4,.17),(.45 if name.endswith('Left') else -.45,1.96,.17),.028,gold,name)
box((2.5,5.79,-9.6),(3,.16,3.5),leather,'JetBridge')
box((2.5,9.45,-9.6),(3,.16,3.5),ivory,'JetBridge')
for x in [1,4]:box((x,7.6,-9.6),(.15,3.6,3.5),ivory,'JetBridge')
box((2.5,7.6,-11.3),(3,3.6,.15),leather,'JetBridge')
text('FIRST CLASS  →',(2.5,8.05,-11.18),.22,'JetBridgeTitle',gold)
box((2.5,5.89,-8.8),(1.6,.028,2.8),carpet,'BoardingRunner')
# First class fuselage: sculpted roof arcs, windows, cabin bins and six spacious leather pods.
box((24,5.65,-1),(10,.3,20),leather,'Cabin');box((24,5.815,-1),(1.4,.03,19),carpet,'Cabin')
for z in [-10.9,8.9]:box((24,7.6,z),(10,3.6,.18),ivory,'Cabin')
for sign in [-1,1]:
 for z in [-9,-6.2,-3.4,-.6,2.2,5,7.8]:
  box((24+sign*4.92,7.6,z),(.12,3.6,2.78),ivory,'Cabin')
  ball((24+sign*4.81,7.63,z),(.075,.51,.33),gold,'WindowFrames');ball((24+sign*4.72,7.63,z),(.045,.44,.27),cloud,'FlightWindows')
 box((24+sign*3.8,8.8,-1),(1.5,.52,19.6),ivory,'OverheadBins')
 box((24+sign*3.02,8.48,-1),(.06,.06,19.5),light,'CabinLights')
for z in [-10+i*.6 for i in range(33)]:
 for i in range(16):
  a=i*math.pi/16;b=(i+1)*math.pi/16;tube((24+4.9*math.cos(a),8.65+1.25*math.sin(a),z),(24+4.9*math.cos(b),8.65+1.25*math.sin(b),z),.065,ivory,'CabinArches',6)
for i in range(24):
 a=i*math.pi/24;b=(i+1)*math.pi/24
 add([(24+4.94*math.cos(t),8.68+1.27*math.sin(t),z) for t,z in [(a,-10.9),(a,8.9),(b,8.9),(b,-10.9)]],[(0,1,2,3)],ivory,'CabinRoof',True)
for row,z in enumerate([4,.2,-3.6],1):
 for col,x in [('A',21.4),('B',26.6)]:
  r='FirstClass'+str(row)+col;box((x,6.02,z),(2.05,.4,2.6),ivory,r);box((x,6.42,z), (1.28,.4,1.55),leather,r)
  box((x,7.05,z+.63),(1.35,1.6,.4),leather,r);ball((x,7.6,z+.42),(.58,.27,.18),leather,r)
  for dx in [-.88,.88]:box((x+dx,6.55,z),(.34,.8,2.5),ivory,r);box((x+dx,7,z),(.38,.11,2.5),gold,r)
  box((x,6.58,z-.43),(1.05,.065,.43),walnut,r);box((x,7.43,z+.387),(.6,.35,.027),white,r)
  text(str(row)+col,(x,7.73,z+.39),.11,'CabinSeatNumbers',gold)
text('ONLY YOU & ME',(24,8.36,-10.76),.28,'CabinTitle',gold)
# High-ceiling red Longge-inspired dining hall. Elevated landing leads down a carpeted flight.
box((50,-.15,-1),(24,.3,30),marble,'Restaurant')
for x in [38,62]:box((x,5,-1),(.25,10,30),crimson,'Restaurant')
box((50,5,14),(24,10,.25),crimson,'Restaurant')
for x in [43.25,56.75]:box((x,5,-16),(10.5,10,.25),crimson,'Restaurant')
box((50,6.7,-16),(3,6.6,.25),crimson,'Restaurant')
box((50,-.1,-18.5),(3.2,.2,5),ivory,'Day500Threshold')
for x in [48.4,51.6]:box((x,2,-18.5),(.15,4,5),ivory,'Day500Threshold')
box((50,2,-20.9),(3.2,4,.15),ivory,'Day500Threshold');box((50,4,-18.5),(3.2,.15,5),ivory,'Day500Threshold')
text('500',(50,2.6,-20.78),.7,'Day500Title',gold);text('우리의 다음 기억',(50,1.83,-20.77),.2,'Day500Title',gold)
box((50,10,-1),(24,.25,30),charcoal,'Restaurant')
for x in [39,44,56,61]:
 for z in [-14,-6,2]:
  tube((x,0,z),(x,9.8,z),.28,crimson,'RestaurantColumns',16)
  for y in [.2,7.8,9.3]:ring((x,y,z),.3,.045,gold,'RestaurantColumns')
for z in [-14,-10,-6,-2,2,6,10]:
 box((50,9.76,z),(24,.12,.12),gold,'CeilingLattice')
 for x in [41,46,54,59]:
  tube((x,9.6,z),(x,7.6,z),.016,gold,'Lanterns');ball((x,7.35,z),(.48,.64,.48),crimson,'Lanterns')
  for y in [6.77,7.95]:ring((x,y,z),.2,.04,gold,'Lanterns')
  tube((x,6.75,z),(x,6.36,z),.028,gold,'Lanterns')
text('龍歌自助小火锅',(50,6.8,-15.78),1.03,'LonggeSign',gold)
text('용가훠궈  ·  YANTAI WANDA',(50,5.62,-15.76),.32,'LonggeSign',paper)
text('好食材  ·  好滋味  ·  无限量',(50,5.02,-15.75),.24,'LonggeSign',gold)
box((50,2.4,12.5),(5,4.8,3),walnut,'ArrivalLanding');box((50,4.815,12.5),(3.4,.03,3),carpet,'RedCarpet')
for i in range(24):
 z=10.85-i*.29;h=4.8-i*.2;box((50,h/2,z),(5,h,.3),marble,'GrandStair');box((50,h+.013,z),(3.4,.028,.3),carpet,'RedCarpet')
 for x in [47.6,52.4]:
  tube((x,h,z),(x,h+.93,z),.023,gold,'GrandStairRail')
  if i:tube((x,h+1.13,z+.29),(x,h+.93,z),.035,gold,'GrandStairRail')
box((50,.02,2.7),(3.4,.035,2.8),carpet,'RedCarpet')
# Two elongated rounded conveyor islands with individual induction hot pots, paired chairs.
def oval(a,cx=50,cz=-4):return (cx+7*math.cos(a),cz+2.1*math.sin(a))
for i in range(96):
 a=i*math.tau/96;b=(i+1)*math.tau/96;x,z=oval(a);xx,zz=oval(b)
 add([(50+r*math.cos(t),y,-4+(2.1+(r-7))*math.sin(t)) for r,y,t in [(6.58,1.1,a),(7.42,1.1,a),(7.42,1.1,b),(6.58,1.1,b)]],[(0,1,2,3)],black,'Conveyor',False)
 for r in [6.53,7.47]:tube((50+r*math.cos(a),1.1,-4+(2.1+r-7)*math.sin(a)),(50+r*math.cos(b),1.1,-4+(2.1+r-7)*math.sin(b)),.035,steel,'ConveyorGuard',6)
 tube((x,.65,z),(xx,.65,zz),.38,crimson,'ConveyorBase',8)
for sign in [-1,1]:
 z=-4+sign*3.05;box((50,.92,z),(14,.13,1.2),walnut,'DiningCounter')
 for i,x in enumerate([44,46,48,50,52,54,56]):
  tube((x,.986,z),(x,1.012,z),.29,black,'Induction',24)
  tube((x,1.01,z),(x,1.25,z),.22,steel,'Hotpots',24,.29)
  tube((x,1.254,z),(x,1.26,z),.263,red,'Soup',24)
  for dx in [-.33,.33]:ring((x+dx,1.18,z),.08,.018,steel,'Hotpots',True)
  cz=z+sign*1.05;tube((x,.45,cz),(x,.56,cz),.38,crimson,'DiningChairs',24)
  box((x,.98,cz+sign*.29),(.74,.88,.11),crimson,'DiningChairs')
  for dx in [-.25,.25]:tube((x+dx,0,cz),(x+dx,.48,cz),.04,gold,'DiningChairs')
  for dx in [-.5,-.45]:tube((x+dx,1,z-.22),(x+dx,1,z+.2),.009,black,'Chopsticks',6)
  tube((x+.49,.99,z),(x+.49,1.09,z),.13,white,'SauceBowls',16,.16)
# Sauce and dessert station, red wall panels, illuminated door to day 500.
for x in [39.3,60.7]:
 box((x,.7,-10),(1.7,1.4,7),crimson,'BuffetBar');box((x,1.43,-10),(1.9,.08,7.1),marble,'BuffetBar')
 for z in [-12.8,-12,-11.2,-10.4,-9.6,-8.8,-8]:tube((x,1.48,z),(x,1.56,z),.28,steel,'BuffetDishes',16,.32)
for x in [40.4,43,45.6,54.4,57,59.6]:
 box((x,3.2,-15.76),(1.9,4.5,.12),walnut,'WallPanels')
 for y in [1.05,5.38]:box((x,y,-15.65),(1.93,.045,.07),gold,'WallPanels')
box((50,1.6,-15.62),(2.8,3.2,.18),black,'FinalDoor');box((50,1.6,-15.5),(2.5,2.95,.09),crimson,'FinalDoor')
for x in [48.54,51.46]:box((x,1.7,-15.35),(.09,3.4,.12),gold,'FinalDoorFrame')
text('500',(50,2.27,-15.35),.5,'FinalDoorNumber',gold)
ring((50.82,1.3,-15.33),.095,.024,gold,'FinalDoorHandle',True)
for o in scene.objects:
 if o.type=='FONT' and any('\u4e00'<=c<='\u9fff' for c in o.data.body) and not any('\uac00'<=c<='\ud7a3' for c in o.data.body):o.data.font=bpy.data.fonts.load('C:/Windows/Fonts/msyh.ttc',check_existing=True)
# Chapel vault tracery and clouds beyond the windows.
for z in [-6,-2,2,6]:
 for i in range(24):
  a=i*math.pi/24;b=(i+1)*math.pi/24
  tube((-1+6.6*math.cos(a),10.5+2.2*math.sin(a),z),(-1+6.6*math.cos(b),10.5+2.2*math.sin(b),z),.055,gold,'ChapelVault',8)
for side in [-1,1]:
 for z in [-5,-1,3,6]:
  for j in range(3):ball((side*7.68,8.62+j*.06,z-.5+j*.47),(.045,.19+j*.018,.43),white,'CloudWindows',16,8)
for x in [-6.6,3.9]:
 tube((x,5.8,-5.7),(x,7.3,-5.7),.035,gold,'AltarCandles');tube((x,7.3,-5.7),(x,7.65,-5.7),.065,white,'AltarCandles');ball((x,7.74,-5.7),(.04,.11,.04),light,'AltarCandles')
# Place food previews in the editable source too; the browser replaces these with animated trays.
for i,(color,name) in enumerate([(rose,'Beef'),(walnut,'Brisket'),(red,'Watermelon'),(sage,'Tofu'),(paper,'Noodles'),(oak,'Mushroom'),(green,'Bokchoy'),(sage,'Cilantro'),(gold,'Chicken'),(white,'Quail')]):
 a=i*math.tau/10;x,z=oval(a);root='FoodPreview_'+name
 tube((x,1.13,z),(x,1.21,z),.28,crimson,root,24,.31)
 for k in range(4):ball((x+(k%2-.5)*.18,1.3,z+(k//2-.5)*.16),(.09,.07,.1),color,root,10,6)
# Flush batched meshes into a hierarchy for editing and low draw count in the game.
groups={}
def group(path):
 if path in groups:return groups[path]
 o=bpy.data.objects.new(path,None);scene.collection.objects.link(o);groups[path]=o
 if '/' in path:o.parent=group(path.rsplit('/',1)[0])
 if path in origins:o.location=xyz(origins[path])
 return o
for (root,m),(verts,faces,smooth) in batches.items():
 mesh=bpy.data.meshes.new(root+' '+m);mesh.from_pydata(verts,[],faces);mesh.materials.append(mats[m]);mesh.update();uv=mesh.uv_layers.new(name='UVMap')
 for poly in mesh.polygons:
  for li in poly.loop_indices:
   co=mesh.vertices[mesh.loops[li].vertex_index].co;uv.data[li].uv=(co.x/2,co.y/2) if abs(poly.normal.z)>.5 else (co.x/2,co.z/2) if abs(poly.normal.y)>.5 else (co.y/2,co.z/2)
 for p,s in zip(mesh.polygons,smooth):p.use_smooth=s
 o=bpy.data.objects.new(root+' '+m,mesh);scene.collection.objects.link(o);o.parent=group(root)
# NPCs: retain the same authored Hyunsu mesh from day 300 rather than inventing another face.
with bpy.data.libraries.load(os.path.join(ROOT,'blender/day-300-save-hyunsu.blend'),link=False) as (src,dst):
 dst.objects=list(src.objects)
npc=next((o for o in dst.objects if o and o.name.split('.')[0]=='HyunsuQuake'),None)
if npc:
 for o in [npc,*npc.children_recursive]:
  if o.name not in scene.objects:scene.collection.objects.link(o)
 npc.name='JourneyHyunsu';npc.location=xyz((-5.2,0,-5.1));npc.rotation_euler=(0,0,0);npc.scale=(.86,.86,.86)
# A separate CC0 female mesh, with navy uniform, silk scarf and pillbox hat.
import sys
sys.path.insert(0,os.path.join(ROOT,'blender'))
from journey_attendant import build_attendant
attendant=build_attendant(scene,ROOT,xyz((3.8,5.8,-6.25)))
# Original user photos are packed with the editable file.
def photo_panel(name,filename,p,w,h):
 path=os.path.join(ASSET,filename)
 if not os.path.isfile(path):path=os.path.join(ROOT,'docs/journey-references',filename)
 m=mat(name,(1,1,1),rough=.75,image=path);x,y,z=p
 me=bpy.data.meshes.new(name);me.from_pydata([xyz((x-w/2,y-h/2,z)),xyz((x+w/2,y-h/2,z)),xyz((x+w/2,y+h/2,z)),xyz((x-w/2,y+h/2,z))],[],[(0,1,2,3)]);me.materials.append(mats[m]);uv=me.uv_layers.new()
 for i,co in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=co
 o=bpy.data.objects.new(name,me);scene.collection.objects.link(o)
photo_panel('Reference_MEATY_Photo','meaty.png',(-5.1,1.6,-6.765),2.43,1.367)
photo_panel('Reference_Computer_Receipt','entry-receipt.png',(.7,1.65,-5.39),.47,1.02)
# UV-wrapped ZAGEE cup, its removable black lid, straw, and key, preserved in Blender.
wrapfile=os.path.join(ASSET,'zagee-wrap.png')
if not os.path.isfile(wrapfile):wrapfile=os.path.join(ROOT,'docs/journey-references/zagee-wrap.png')
wrapmat=mat('ZAGEE generated navy sleeve',(1,1,1),rough=.7,image=wrapfile)
vs=[];faces=[];n=64
for y,r in [(1.04,.085),(1.33,.115)]:
 for i in range(n+1):
  a=i*math.tau/n;vs.append(xyz((51+r*math.sin(a),y,-.95+r*math.cos(a))))
for i in range(n):faces.append((i,i+1,n+i+2,n+i+1))
me=bpy.data.meshes.new('Zagee cup sleeve');me.from_pydata(vs,[],faces);me.materials.append(mats[wrapmat]);uv=me.uv_layers.new()
for poly in me.polygons:
 poly.use_smooth=True
 for li in poly.loop_indices:
  idx=me.loops[li].vertex_index;uv.data[li].uv=(idx%(n+1)/n,idx//(n+1))
o=bpy.data.objects.new('SourceZageeCup',me);scene.collection.objects.link(o)
before=set(batches)
tube((51,1.34,-.95),(51,1.39,-.95),.125,black,'SourceZageeLid',32)
tube((51.065,1.38,-.95),(51.085,1.69,-.95),.009,white,'SourceZageeStraw',8)
ring((51,1.19,-.95),.045,.01,gold,'SourceKey',True);tube((51,1.15,-.95),(51,1.02,-.95),.01,gold,'SourceKey',8)
for (root,m),(verts,faces,smooth) in list(batches.items()):
 if (root,m) in before:continue
 me=bpy.data.meshes.new(root);me.from_pydata(verts,[],faces);me.materials.append(mats[m]);o=bpy.data.objects.new(root,me);scene.collection.objects.link(o)
# Camera, preview lighting and packed source.
scene.world=bpy.data.worlds.new('Journey atmosphere');scene.world.use_nodes=True
bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs['Color'].default_value=(.16,.18,.24,1);bg.inputs['Strength'].default_value=.45
for p,power,col in [((0,4,1),1100,(1,.35,.12)),((0,11,0),1800,(1,.92,.77)),((24,9,0),1600,(1,.95,.84)),((50,8,-2),2600,(1,.7,.42))]:
 d=bpy.data.lights.new('Chapter area','AREA');d.energy=power;d.color=col;d.size=8;o=bpy.data.objects.new('Chapter area',d);scene.collection.objects.link(o);o.location=xyz(p)
camdata=bpy.data.cameras.new('Journey camera');cam=bpy.data.objects.new('Journey camera',camdata);scene.collection.objects.link(cam);cam.location=xyz((50,6.1,12));cam.rotation_euler=(Vector(xyz((50,2,-6)))-cam.location).to_track_quat('-Z','Y').to_euler();camdata.lens=20;scene.camera=cam
scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/day-400-china-journey.blend'))
for o in scene.objects:o.select_set(not o.name.startswith(('Reference_','FoodPreview_','SourceZagee','SourceKey')))
bpy.ops.export_scene.gltf(filepath=os.path.join(ASSET,'journey-room.glb'),export_format='GLB',use_active_scene=True,use_selection=True,export_cameras=False,export_lights=False,export_animations=False)
print('JOURNEY_BUILD_OK',len(scene.objects))
