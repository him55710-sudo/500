"""Add the authored 92,500-won checkout, mango safe and torn letter to the existing scene."""
import bpy,math,random,os,json,ast,re
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
scene=bpy.data.scenes['Day_500_01_Sungsimdang'];bpy.context.window.scene=scene
DATA=json.load(open(os.path.join(ROOT,'src/bakery-data.json'),encoding='utf8'))
assert sum(p['price']*p['quantity'] for p in DATA['products'])==92500
M={};B={};groups={};collections={c.name:c for c in scene.collection.children}
for o in scene.objects:
 if o.type=='MESH':
  for m in o.data.materials:
   if m and m.name.startswith('SSD / '):M[re.sub(r'\.\d+$','',m.name[6:])]=m
paper='Parchment';ink='Espresso ink';gold='Aged brass';green='Deep olive';oak='Honey oak';ivory='Ivory enamel';traymat='Brushed baking trays';dark='Roasted walnut'
src=ast.parse(open(os.path.join(ROOT,'blender/build_sungsimdang.py'),encoding='utf8').read())
helpers=[n for n in src.body if isinstance(n,ast.FunctionDef) and n.name in ['xyz','col','mat','add','box','tube','ball','path','ring','text','flush','tray']]
exec(compile(ast.Module(body=helpers,type_ignores=[]),'SSD helpers','exec'),globals())
font=bpy.data.fonts.load('C:/Windows/Fonts/malgun.ttf',check_existing=True);font_b=bpy.data.fonts.load('C:/Windows/Fonts/malgunbd.ttf',check_existing=True)
paper='Parchment';ink='Espresso ink';gold='Aged brass';green='Deep olive';oak='Honey oak';ivory='Ivory enamel';traymat='Brushed baking trays';dark='Roasted walnut'
steel=mat('Safe graphite',(.038,.05,.045),.36,.65)
inside=mat('Safe interior',(.072,.089,.071),.62,.22)
mango=mat('Mango golden flesh',(.94,.39,.008),.28)
mango2=mat('Mango sunlit flesh',(1,.57,.026),.31)
whipped=mat('Whipped cream',(.93,.89,.74),.67)
sponge=mat('Cake sponge',(.72,.47,.12),.77,noise=32)
mint=mat('Mango garnish leaf',(.085,.27,.022),.67)
amber=mat('Safe amber indicator',(.9,.2,.015),.3,emit=.6)
screen=mat('Safe screen',(.018,.036,.025),.45)
P='10_Bakery_puzzle'
random.seed(92500)

# Re-running this add-on only replaces its own generated objects.
for o in list(scene.objects):
 if o.get('bakery_puzzle_owned'):bpy.data.objects.remove(o,do_unlink=True)
old_objects=set(scene.objects)
for o in list(scene.objects):
 if o.name.startswith('Checkout /') or (o.type=='FONT' and o.data.body=='계산 · 포장'):
  bpy.data.objects.remove(o,do_unlink=True)
# Relocate the existing register and wrapping bags once, behind the checkout order.
for o in scene.objects:
 eligible=o.name.startswith(('POS /','Paper bags /','Bag handles /')) or (o.type=='FONT' and ((abs(o.location.x-3.65)<.01 and o.data.body in ['성심당','포장해 드릴게요']) or (o.data.body in ['성심당','DAEJEON'] and o.location.x>4.5)))
 if eligible and not o.get('bakery_checkout_relocated'):
  o.location.y+=1.72;o['bakery_checkout_relocated']=True

# Hollow counter carcass, real opening for the safe.
for x in [2.81,5.19]:box((x,.54,.37),(.12,1.08,3.15),oak,'Puzzle counter')
box((4,.15,.37),(2.4,.14,3.15),oak,'Puzzle counter')
box((4,.57,-1.18),(2.4,1.03,.10),oak,'Puzzle counter')
box((4,1.105,.37),(2.56,.13,3.28),ivory,'Puzzle counter')
for x in [2.99,5.01]:box((x,.61,1.91),(.28,.92,.1),green,'Puzzle counter')
box((4,1.03,1.91),(2.40,.1,.1),green,'Puzzle counter')
text('계산을 기다리는 빵',(4,1.02,2.025),.087,ink,P,True)

layout={'soboro':(3.12,1.20,.73,.71),'guma':(3.99,1.20,.73,.71),'buchu':(4.86,1.20,.73,.71),'baguette':(3.36,.18,1.13,.76),'meari':(4.66,.18,1.13,.76)}
for p in DATA['products']:
 id=p['id'];x,z,w,d=layout[id]
 tray(x,z,1.183,w,d,'Order trays')
 template=next(o for o in scene.objects if o.get('product_name')==p['name'] and not o.get('checkout_item'))
 if id=='baguette':positions=[((i-3)*.145,0) for i in range(7)];scale=.50
 elif id=='meari':positions=[(-.35,-.18),(0,-.18),(.35,-.18),(-.35,.08),(0,.08),(.35,.08),(0,.30)];scale=.48
 elif id=='buchu':positions=[((i%3-1)*.205,(i//3-.5)*.25) for i in range(6)];scale=.52
 elif id=='guma':positions=[(-.18,-.1),(.18,-.1),(0,.17)];scale=.58
 else:positions=[(-.18,-.13),(.18,-.13),(-.18,.15),(.18,.15)];scale=.58
 assert len(positions)==p['quantity']
 for i,(dx,dz) in enumerate(positions):
  o=bpy.data.objects.new('Checkout_'+id+'_'+str(i+1),template.data);col(P).objects.link(o);o.location=xyz((x+dx,1.209,z+dz));o.scale=(scale,)*3
  o['checkout_item']=True;o['product_id']=id;o['product_name']=p['name'];o['unit_price']=p['price'];o['catalogue_url']='https://www.sungsimdangmall.co.kr/shop/product/product_view?product_cd='+p['catalogueCode']
 box((x,1.26,z+.44),(w,.17,.018),paper,'Order quantity cards')
 text(p['name'],(x,1.287,z+.455),.062,ink,P,True);text(str(p['quantity'])+'개',(x,1.219,z+.456),.061,green,P,True)
# Unit prices belong to the bread shelves, not to the secret safe display.
for id,x,z in [('soboro',-2.25,1.45),('guma',-.65,1.45),('buchu',.95,1.45),('baguette',-2.25,-.18),('meari',-.65,-.18),('soboro',.95,-.18)]:
 p=next(p for p in DATA['products'] if p['id']==id)
 box((x,1.214,z+.67),(.89,.10,.018),paper,'Unit price plates')
 text(f"개당 {p['price']:,}원",(x,1.189,z+.683),.060,ink,P,True)

# Safe has five walls and a separate hinged front. No solid cabinet blocks the prize.
for x in [3.30,4.70]:box((x,.54,1.47),(.09,.88,1.12),steel,'Safe housing')
for y in [.13,.95]:box((4,y,1.47),(1.49,.08,1.12),steel,'Safe housing')
box((4,.54,.93),(1.49,.88,.08),steel,'Safe housing')
box((4,.194,1.47),(1.28,.04,.98),inside,'Safe lining')
box((4,.905,1.47),(1.28,.035,.98),inside,'Safe lining')
box((4,.53,.984),(1.28,.75,.024),inside,'Safe lining')
box((4,.54,2.072),(1.35,.76,.11),green,'Safe door')
for x in [3.35,4.65]:box((x,.54,2.132),(.025,.69,.024),gold,'Safe door')
for y in [.19,.89]:box((4,y,2.132),(1.32,.025,.024),gold,'Safe door')
box((4.03,.69,2.148),(.59,.17,.026),screen,'Safe door')
text('— — — — —',(4.03,.665,2.166),.067,paper,P)
for i in range(12):
 x=3.84+(i%3)*.185;y=.532-(i//3)*.091
 box((x,y,2.151),(.137,.067,.025),steel,'Safe door')
 text(str(i+1) if i<9 else ['C','0','↵'][i-9],(x,y-.018,2.169),.049,paper,P)
tube((4.49,.36,2.207),(4.49,.69,2.207),.025,gold,'Safe door')
for y in [.30,.79]:tube((3.29,y-.06,2.065),(3.29,y+.06,2.065),.049,steel,'Safe housing')
ball((4.42,.79,2.165),(.021,.021,.011),amber,'Safe door',12,8)
text('다섯 자리 · 숫자만 입력',(4,.105,2.075),.057,paper,P)
box((4.05,1.31,-.61),(1.40,.28,.025),paper,'Checkout clue')
text('올려둔 빵값을 모두 더해 주세요',(4.05,1.34,-.589),.068,ink,P,True)
text('금고의 다섯 칸에, 원 단위로',(4.05,1.25,-.588),.053,green,P)

# Mango Siru: sponge, fresh cream, visible fruit slabs and a heaped mango crown.
tube((4,.216,1.51),(4,.237,1.51),.33,ivory,'Mango cake',64)
ring((4,.24,1.51),.321,.008,gold,'Mango cake')
for y,h,r,m in [(.242,.035,.268,sponge),(.277,.052,.276,whipped),(.329,.027,.268,sponge),(.356,.072,.278,whipped),(.428,.028,.276,whipped)]:
 tube((4,y,1.51),(4,y+h,1.51),r,m,'Mango cake',64)
for i in range(15):
 a=i*math.tau/15
 ball((4+.268*math.cos(a),.362,1.51+.268*math.sin(a)),(.036,.078,.036),mango if i%2 else mango2,'Mango cake',12,8)
for i in range(62):
 a=random.random()*math.tau;r=math.sqrt(random.random())*.255
 p=(4+r*math.cos(a),.478+.079*(1-r/.27)+random.uniform(-.015,.016),1.51+r*math.sin(a));size=(random.uniform(.045,.073),random.uniform(.04,.067),random.uniform(.045,.07))
 box(p,size,mango if i%3 else mango2,'Mango cake')
ball((4.04,.58,1.49),(.05,.008,.025),mint,'Mango cake',16,8)
text('망고시루',(4,.246,1.846),.052,ink,P,True)

# One physical third of a letter, tucked beneath the left edge of the baguette tray.
cx,cy,cz=-2.95,1.194,.18
outline=[(-.19,-.14),(.12,-.14),(.12,.125),(.087,.10),(.054,.142),(.021,.102),(-.015,.134),(-.043,.112),(-.082,.144),(-.12,.113),(-.155,.147),(-.19,.12)]
add([(cx+x,cy,cz+z) for x,z in outline],[tuple(reversed(range(len(outline))))],paper,'Letter fragment')
for i,w in enumerate([.11,.15,.095]):box((cx-.06,cy+.001,cz-.095+i*.032),(w,.001,.002),ink,'Letter fragment')
flush(collection=P,bevel=.004)

def parent_group(name,objects,pos,**props):
 root=bpy.data.objects.new(name,None);col(P).objects.link(root);root.location=xyz(pos);bpy.context.view_layer.update()
 for o in objects:
  mw=o.matrix_world.copy();o.parent=root;o.matrix_world=mw
 root['asset_id']=name
 for k,v in props.items():root[k]=v
 return root
door_objects=groups['Safe door'][:]
for o in list(scene.objects):
 if o in old_objects or o.type!='FONT':continue
 if o.data.body=='— — — — —' or o.data.body in [str(i) for i in range(10)]+['C','↵']:door_objects.append(o)
parent_group('BakerySafeHinge',door_objects,(3.285,0,2.075),interactable='bakery-safe',locked=True)
cakeobjs=groups['Mango cake']+[o for o in scene.objects if o not in old_objects and o.type=='FONT' and o.data.body=='망고시루']
parent_group('MangoSiruCake',cakeobjs,(4,.216,1.51),interactable='bakery-cake',reward='mango_siru')
parent_group('BakeryLetterFragment',groups['Letter fragment'],(cx,cy,cz),interactable='bakery-letter',fragment_index=1,fragment_total=3)
for o in scene.objects:
 if o not in old_objects:o['bakery_puzzle_owned']=True
scene['checkout_total']=92500;scene['checkout_bread_count']=27;scene['scope']='Playable bakery puzzle: checkout total, mango siru safe and letter fragment 1/3.'
for o in scene.objects:
 if o.type=='FONT' and o.data.body=='다음 기억으로':o.data.body='다음 기억으로'
camera=bpy.data.cameras.new('Puzzle close-up');camera.lens=41
cam=bpy.data.objects.new('Camera_04_Checkout',camera);col('09_Cameras').objects.link(cam);cam.location=xyz((6.7,2.65,5.8));cam.rotation_euler=(Vector(xyz((3.9,1.02,.8)))-cam.location).to_track_quat('-Z','Y').to_euler()
cam['bakery_puzzle_owned']=True
for f in [font,font_b]:
 if hasattr(f,'pack'):f.pack()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/day-500-01-sungsimdang.blend'))
print(json.dumps({'checkout_breads':27,'total':92500,'cake':'MangoSiruCake','letter':'BakeryLetterFragment'},ensure_ascii=False))
