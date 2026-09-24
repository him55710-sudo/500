"""An original POSTECH auditorium game installation, authored in metres, game Y-up."""
import bpy,os,math,json,ast,random
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
scene=bpy.data.scenes.get('Day_500_02_Junction')
if scene:
 for o in list(scene.objects):bpy.data.objects.remove(o,do_unlink=True)
else:scene=bpy.data.scenes.new('Day_500_02_Junction')
bpy.context.window.scene=scene
M={};B={};groups={};collections={c.name:c for c in scene.collection.children};ink='Ink'
src=ast.parse(open(os.path.join(ROOT,'blender/build_sungsimdang.py'),encoding='utf8').read())
exec(compile(ast.Module(body=[n for n in src.body if isinstance(n,ast.FunctionDef) and n.name in ['xyz','col','mat','add','box','tube','ball','path','ring','text','flush']],type_ignores=[]),'helpers','exec'),globals())
font=bpy.data.fonts.load('C:/Windows/Fonts/malgun.ttf',check_existing=True);font_b=bpy.data.fonts.load('C:/Windows/Fonts/malgunbd.ttf',check_existing=True)
for name,color,rough,metal,emit in [('Ink',(.009,.015,.026),.6,0,0),('Pearl',(.69,.77,.78),.6,0,0),('Oak',(.035,.014,.065),.65,0,0),('Walnut',(.009,.006,.018),.7,0,0),('Graphite',(.018,.014,.03),.45,.35,0),('Maze',(.055,.012,.095),.75,0,0),('Red',(.60,.025,.06),.38,.1,0),('Blue',(.017,.19,.65),.35,.1,0),('Yellow',(.88,.52,.018),.4,.05,0),('Green',(.025,.45,.10),.35,.1,0),('Gold',(.55,.32,.06),.32,.7,0),('LED',(.30,.045,.75),.3,0,3),('Black glass',(.003,.007,.015),.22,.1,0),('Goggle',(.36,.43,.51),.26,.8,0),('White',(.89,.89,.79),.6,0,0),('Denim',(.02,.13,.4),.9,0,0),('Pink',(.95,.09,.26),.4,0,0)]:mat(name,color,rough,metal,emit)
layout=json.load(open(os.path.join(ROOT,'src/junction-layout.json'),encoding='utf8'))
open_cells={tuple(p) for p in layout['openCells']}
N=layout['columns'];cell=layout['cellSize'];half=(N-1)/2;H=layout['wallHeight']
def grid(c,r):return ((c-half)*cell,r*cell)
mat('Obsidian floor',(.026,.017,.04),.72,.10)
mat('Violet edge',(.30,.025,.70),.45,0,1.4)
box((0,-.17,15.5),(54,.34,59),'Walnut','Hall foundation')
box((0,-.005,15.5),(53,.025,58),'Graphite','Hall floor')
box((0,3.8,-13),(54,7.6,.28),'Oak','Back wall')
for x in [-26.3,26.3]:
 box((x,3.8,15.5),(.28,7.6,58),'Oak','Side acoustic walls')
 for z in range(-12,44,3):
  box((x-math.copysign(.2,x),3.7,z),(.12,6.7,.85),'Walnut','Acoustic slats')
  box((x-math.copysign(.3,x),6.9,z),(.06,.025,1.1),'LED','Side light strips')
for z in [-10,0,10,20,30,40]:
 box((0,7.8,z),(54,.27,.20),'Graphite','Roof trusses')
 for x in [-20,-10,0,10,20]:tube((x,7.5,z),(x,7.14,z),.12,'Ink','Spot housings',12)
box((0,3.8,44.4),(54,7.6,.25),'Walnut','Rear wall')
box((0,4.9,-12.75),(18,3.25,.17),'Ink','Stage screen')
text('JUNCTION',(0,5.40,-12.61),1.1,'White','Signs',True)
text('K O R E A   2 0 2 6',(0,4.57,-12.60),.46,'LED','Signs')
text('POSTECH  ·  중앙강당',(0,3.92,-12.60),.29,'White','Signs')
for x in [-11.3,11.3]:
 box((x,1.38,-11.9),(1.2,2.75,.75),'Ink','PA stacks')
 for y in [.75,1.75]:ball((x,y,-11.48),(.4,.4,.045),'Graphite','PA drivers',16,10)
for side in [-1,1]:
 for row in range(10):
  z=1+row*4;y=.08
  for seat in range(2):
   x=side*(23.25+seat*1.1)
   box((x,y+.43,z),(.78,.18,.74),'Oak','Auditorium seats')
   box((x,y+.92,z+.29),(.78,.92,.16),'Oak','Auditorium seats')
   for dx in [-.32,.32]:tube((x+dx,y,z),(x+dx,y+.55,z),.036,'Graphite','Seat frames',8)
  box((side*23.8,y-.015,z),(3.4,.08,1.75),'Walnut','Seating risers')
for r in range(N):
 for c in range(N):
  x,z=grid(c,r)
  if (c,r) not in open_cells:
   box((x,H/2,z),(cell,H,cell),'Maze','Maze walls')
   box((x,H+.02,z),(cell+.01,.04,cell+.01),'Graphite','Maze caps')
  else:
   box((x,.025,z),(cell-.025,.025,cell-.025),'Obsidian floor','Maze paths')
   for dc,dr in [(1,0),(-1,0),(0,1),(0,-1)]:
    if (c+dc,r+dr) not in open_cells:
     box((x+dc*.979,.12,z+dr*.979),(.022 if dc else 1.88,.026,1.88 if dc else .022),'Violet edge','Low violet guides')
     box((x+dc*.985,H-.08,z+dr*.985),(.025 if dc else 1.84,.024,1.84 if dc else .025),'Violet edge','Violet wall crowns')
box((0,.035,42.55),(2.4,.04,1.7),'Graphite','Start tile')
text('START',(0,.075,42.8),.36,'LED','Signs',True).rotation_euler=(0,0,0)
for x in [-1.12,1.12]:box((x,1.5,41.15),(.12,3,.14),'LED','Entrance portal')
box((0,3.03,41.15),(2.35,.12,.14),'LED','Entrance portal')
text('JUNCTION / INTO THE MAZE',(0,3.43,41.18),.20,'White','Signs',True)
text('무대 방향 ↑  /  12시',(0,1.9,44.18),.23,'White','Signs')
for name in ['red','blue']:
 x,y,z=layout[name];cc=name.title()
 box((x,2.10,z-1.0),(3.2,2.65,.11),'Ink',cc+' alcove backing')
 for dx in [-1.65,1.65]:box((x+dx,1.6,z-.98),(.045,3.1,.035),cc,cc+' alcove trim')
text('CENTRAL SIGNAL',(0,3.35,18.25),.20,'LED','Signs',True)
for x in [-6.8,6.8]:
 color='Red' if x<0 else 'Blue';name='Red' if x<0 else 'Blue'
 box((x,.5,-3.65),(2.6,1,1.2),'Graphite',name+' console')
 box((x,1.08,-3.65),(2.85,.13,1.4),'Oak',name+' console')
 tube((x,1.12,-3.85),(x,1.60,-3.85),.10,'Graphite',name+' console')
 box((x,1.82,-3.88),(2.45,1.32,.20),color,name+' monitor')
 box((x,1.82,-3.761),(2.22,1.08,.025),'Black glass',name+' screen')
 box((x,1.17,-3.35),(1.25,.045,.4),'Ink',name+' keyboard')
 for i in range(24):box((x-.54+(i%8)*.155,1.201,-3.45+(i//8)*.12),(.12,.018,.075),'Pearl',name+' keys')
 text('01 / RED' if x<0 else '02 / BLUE',(x,.76,-3.025),.19,'White','Signs',True)
 if x<0:
  for dx,cc in [(-.62,'Red'),(.62,'Green')]:tube((x+dx,1.15,-3.05),(x+dx,1.25,-3.05),.17,cc,'Red physical buttons',24)
 else:
  box((x,.57,-2.99),(1.55,.45,.055),'Ink','Coat hatch')
  text('BLUE',(x,2.62,-3.88),.3,'Blue','Signs',True)
box((0,.13,-3.7),(1.5,.26,1.0),'Graphite','Signal base')
tube((0,.2,-3.7),(0,2.13,-3.7),.11,'Graphite','Signal post',16)
box((0,2.82,-3.7),(.91,2.33,.6),'Ink','Traffic light housing')
for label,y,color in [('Red',3.55,'Red'),('Yellow',2.82,'Yellow'),('Blue',2.09,'Blue')]:
 tube((0,y,-3.375),(0,y,-3.335),.27,color,'Signal '+label,32)
box((0,.50,-2.7),(2.3,1,.8),'Graphite','Offering altar')
for x in [-.67,0,.67]:ring((x,1.018,-2.7),.21,.017,'Gold','Offering rings')
text('03 / YELLOW',(0,.72,-2.279),.16,'Yellow','Signs',True)
text('세 친구에게 길을 물어봐',(0,.40,-2.278),.12,'Pearl','Signs')
# Recognizable yellow, goggled, denim-overall minion dolls, separately collectible.
for i,(c,r) in enumerate(layout['minions']):
 x,z=grid(c,r);g='Minion_'+str(i)
 tube((x,.14,z),(x,.34,z),.26,'Denim',g,20)
 ball((x,.52,z),(.28,.43,.24),'Yellow',g,20,12)
 box((x,.26,z+.205),(.38,.25,.045),'Denim',g)
 for dx in [-.12,.12]:
  box((x+dx,.44,z+.215),(.055,.25,.045),'Denim',g)
  ball((x+dx,.08,z+.04),(.12,.08,.17),'Ink',g,12,8)
  tube((x+dx,.67,z+.215),(x+dx,.67,z+.295),.115,'Goggle',g,20)
  ball((x+dx,.67,z+.307),(.082,.082,.018),'White',g,12,8)
  ball((x+dx,.67,z+.328),(.038,.040,.013),'Ink',g,12,8)
 for dx in [-.30,.30]:ball((x+dx,.33,z),(.07,.18,.06),'Yellow',g,12,8)
 path([(x-.09,.51,z+.228),(x,.485,z+.24),(x+.09,.51,z+.228)],.012,'Ink',g)
# Drink props and bin next to blue computer.
for x,id,cc,title in [(5.6,'VictoryBottle','Green','VICTORY'),(7.9,'TopCoffee','Walnut','T.O.P')]:
 g=id
 tube((x,1.15,-3.36),(x,1.56,-3.36),.115,cc,g,24)
 tube((x,1.56,-3.36),(x,1.69,-3.36),.053,cc,g,16)
 tube((x,1.68,-3.36),(x,1.72,-3.36),.06,'Goggle',g,16)
 box((x,1.39,-3.24),(.19,.19,.012),'White',g)
 text(title,(x,1.405,-3.224),.039,'Ink','Drink labels',True)
tube((8.6,.03,-3.3),(8.6,.83,-3.3),.42,'Graphite','Trash bin',32)
ring((8.6,.85,-3.3),.44,.037,'Goggle','Trash bin')
text('쓰레기통',(8.6,.48,-2.871),.12,'White','Signs')
# The red +5 is on the garment's BACK; front is plain.
box((6.8,.74,-2.75),(.68,.74,.11),'Pearl','RewardCoat')
for dx in [-.43,.43]:box((6.8+dx,.87,-2.75),(.24,.40,.11),'Pearl','RewardCoat')
text('+5',(6.8,.82,-2.680),.27,'Red','Coat mark',True)
for r in [2.15,2.28]:ring((0,.042,-8),r,.026,'LED','Final circle')
text('500',(0,.05,-8.30),.70,'White','Final floor').rotation_euler=(0,0,0)
box((0,1.66,-8),(.96,1.3,.065),'Graphite','IPad')
box((0,1.66,-7.955),(.85,1.14,.016),'Black glass','IPad')
ball((0,2.26,-7.947),(.018,.018,.008),'Goggle','IPad',10,6)
box((2.4,.72,-7.5),(.65,.48,.06),'Pearl','Envelope')
path([(2.08,.93,-7.46),(2.4,.70,-7.46),(2.72,.93,-7.46)],.008,'Gold','Envelope')
ring((layout['red'][0],.05,30),.56,.025,'Red','Red arrival marker')
text('RED',(layout['red'][0],.065,30.17),.24,'Red','Signs',True).rotation_euler=(0,0,0)
flush(collection='Junction geometry',bevel=.012)
def group(name,prefixes,pos):
 root=bpy.data.objects.new(name,None);scene.collection.objects.link(root);root.location=xyz(pos);root['asset_id']=name;bpy.context.view_layer.update()
 for o in list(scene.objects):
  if o.type=='MESH' and any(o.name.startswith(p+' /') for p in prefixes):mw=o.matrix_world.copy();o.parent=root;o.matrix_world=mw
 return root
for i,(c,r) in enumerate(layout['minions']):group('Minion_'+str(i),['Minion_'+str(i)],(grid(c,r)[0],0,grid(c,r)[1]))
for name,pos in [('VictoryBottle',(5.6,1.15,-3.36)),('TopCoffee',(7.9,1.15,-3.36)),('RewardCoat',(6.8,.36,-2.75)),('IPad',(0,1.0,-8)),('Envelope',(2.4,.5,-7.5))]:group(name,[name],pos)
coat=scene.objects['RewardCoat']
for o in scene.objects:
 if o.type=='FONT' and o.data.body=='+5':mw=o.matrix_world.copy();o.parent=coat;o.matrix_world=mw
for name,x in [('RedScreen',-6.8),('BlueScreen',6.8)]:group(name,[('Red' if x<0 else 'Blue')+' screen'],(x,1.82,-3.74))
for cc in ['Red','Yellow','Blue']:group('Signal'+cc,['Signal '+cc],(0,0,0))
npc=bpy.data.objects.new('JunctionHyunsu',None);scene.collection.objects.link(npc);npc.location=xyz((2.3,0,-7.7));npc['asset_id']='JunctionHyunsu'
# Editable stand-in with the shared character linked from the current source when available.
source=next((o for o in bpy.data.objects if o.name=='HyunsuMaster'),None)
if source:
 for o in [source]+list(source.children_recursive):
  if o.type=='MESH':n=o.copy();n.data=o.data;scene.collection.objects.link(n);n.parent=npc;n.matrix_parent_inverse.identity();n.matrix_basis=source.matrix_world.inverted()@o.matrix_world
# Move complete interactable assemblies using the shared game layout.
shifts={'red':(layout['red'][0]+6.8,0,layout['red'][2]+3.5),'blue':(layout['blue'][0]-6.8,0,layout['blue'][2]+3.5),'signal':(layout['signal'][0],0,layout['signal'][2]+3.5)}
for o in list(scene.objects):
 if o.parent:continue
 name=o.name;zone=None
 if name=='RedScreen' or any(name.startswith(p+' /') for p in ['Red console','Red monitor','Red keyboard','Red keys','Red physical buttons']):zone='red'
 if name in ['BlueScreen','VictoryBottle','TopCoffee','RewardCoat'] or any(name.startswith(p+' /') for p in ['Blue console','Blue monitor','Blue keyboard','Blue keys','Coat hatch','Trash bin']):zone='blue'
 if name in ['SignalRed','SignalYellow','SignalBlue'] or any(name.startswith(p+' /') for p in ['Signal base','Signal post','Traffic light housing','Offering altar','Offering rings']):zone='signal'
 if o.type=='FONT':
  if o.data.body=='01 / RED':zone='red'
  if o.data.body in ['02 / BLUE','BLUE','쓰레기통','VICTORY','T.O.P']:zone='blue'
  if o.data.body in ['03 / YELLOW','세 친구에게 길을 물어봐']:zone='signal'
 if zone:o.location+=Vector(xyz(shifts[zone]))
scene.world=bpy.data.worlds.new('Junction violet atmosphere');scene.world.use_nodes=True
bg=next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.017,.004,.038,1);bg.inputs[1].default_value=.28
for name,p,power,size,color in [('Stage',(0,7,-6),2000,12,(.57,.45,1)),('Maze wash',(0,13,20),6500,36,(.39,.14,1)),('Maze fill',(0,8,38),1500,16,(.5,.3,1)),('Blue chamber',(-14,4.8,12),200,4,(.16,.32,1)),('Red chamber',(14,4.8,28),200,4,(1,.08,.14)),('Central chamber',(0,5,20),350,5,(.63,.43,1))]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=xyz(p)
for name,p,target,lens in [('Camera_Junction',(49,57,75),(0,0,16),44),('Camera_Stage',(1.5,4.5,3),(0,2,-6),24),('Camera_Maze',(0,1.7,42.6),(0,1.65,37),21),('Camera_Red',(14,1.9,31.6),(14,1.4,27.7),20),('Camera_Blue',(-14,1.9,15.6),(-14,1.4,11.7),20)]:
 d=bpy.data.cameras.new(name);d.lens=lens;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=xyz(p);o.rotation_euler=(Vector(xyz(target))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Camera_Plan');d.type='ORTHO';d.ortho_scale=62;o=bpy.data.objects.new('Camera_Plan',d);scene.collection.objects.link(o);o.location=xyz((0,70,15.5));o.rotation_euler=(0,0,0)
scene.camera=scene.objects['Camera_Junction'];scene.render.engine='CYCLES';scene.cycles.samples=20;scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene['description']='42m x 42m dark violet maze; red at 4 oclock, blue at 10 oclock, central signal; 14 dead ends.'
scene['route_answer']=''.join('R' if b[0]>a[0] else 'L' if b[0]<a[0] else 'D' if b[1]>a[1] else 'U' for a,b in zip(layout['route'],layout['route'][1:]))
for f in [font,font_b]:f.pack()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/day-500-junction-finale.blend'))
print('Junction scene built: '+str(len(scene.objects))+' objects')
