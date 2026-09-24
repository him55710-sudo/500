"""Wider bakery with separate order desk, PIN register and cake safe.
Run after add_bakery_drawer.py. Reversible stored base transforms make reruns safe.
"""
import bpy,os,json,ast,re,math
from mathutils import Vector,Matrix
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
layout=json.load(open(os.path.join(ROOT,'src/bakery-layout.json'),encoding='utf8'))
scene=bpy.data.scenes['Day_500_01_Sungsimdang'];bpy.context.window.scene=scene
for o in list(scene.objects):
 if o.get('wide_bakery_owned'):bpy.data.objects.remove(o,do_unlink=True)
# Restore authored base transforms before applying the new layout.
for o in scene.objects:
 if not o.parent:
  if 'wide_bakery_base' not in o:o['wide_bakery_base']=[v for row in o.matrix_world for v in row]
  a=o['wide_bakery_base'];o.matrix_world=Matrix([a[i:i+4] for i in range(0,16,4)])
M={};B={};groups={};collections={c.name:c for c in scene.collection.children};ink='Espresso ink'
for o in scene.objects:
 if o.type=='MESH':
  for m in o.data.materials:
   if m and m.name.startswith('SSD / '):M[re.sub(r'\.\d+$','',m.name[6:])]=m
src=ast.parse(open(os.path.join(ROOT,'blender/build_sungsimdang.py'),encoding='utf8').read())
exec(compile(ast.Module(body=[n for n in src.body if isinstance(n,ast.FunctionDef) and n.name in ['xyz','col','add','box','tube','ball','path','ring','text','flush']],type_ignores=[]),'helpers','exec'),globals())
font=bpy.data.fonts.load('C:/Windows/Fonts/malgun.ttf',check_existing=True);font_b=bpy.data.fonts.load('C:/Windows/Fonts/malgunbd.ttf',check_existing=True)
def move(o,delta):o.location+=Vector(xyz(delta))
scale=Matrix.Diagonal((layout['roomScale'],layout['roomScale'],1,1))
architecture=('Architecture /','Tiles /','Cutaway side wall /','Wainscot /','Window ','Ceiling beams /','Full enclosure /','Removable ceiling /','Brand plaque /','Wheat insignia /','Gate frame /','Door reader /','Route plaque /','Pendant /')
display=('Island ','Labels /','Unit price plates /')
rack=('Back rack /','Back trays /','Gift boxes /')
for o in list(scene.objects):
 if o.parent:continue
 n=o.name;body=o.data.body if o.type=='FONT' else ''
 if n.startswith(('POS /','Paper bags /','Bag handles /')) or (o.type=='FONT' and body in ['성심당','DAEJEON','포장해 드릴게요'] and o.location.x>3.5):
  bpy.data.objects.remove(o,do_unlink=True);continue
 if n=='Gate_01_to_02_Pivot' or n.startswith(architecture):o.matrix_world=scale@o.matrix_world
 elif n in ['BakerySafeHinge','MangoSiruCake','BakeryCakeUSB'] or n.startswith(('Safe housing /','Safe lining /')):move(o,layout['safeShift'])
 elif n=='BakeryCashDrawer':move(o,layout['cashShift'])
 elif n=='BakeryLetterFragment' or n.startswith(display) or body.startswith('개당 '):move(o,layout['displayShift'])
 elif o.get('checkout_item') or n.startswith(('Puzzle counter /','Order trays /','Order quantity cards /','Checkout clue /')) or (o.type=='FONT' and any(c.name=='10_Bakery_puzzle' for c in o.users_collection) and body!='망고시루 · 열쇠로 열기'):
  move(o,layout['orderShift'])
 elif n.startswith('Bread_'):move(o,layout['rackShift'] if o.location.y>3 else layout['displayShift'])
 elif n.startswith(rack) or body in ['갓 구운 빵','대전의 마음'] or (body=='성심당' and o.location.x<0):move(o,layout['rackShift'])
 elif n.startswith(('Tray station /','Stacked trays /','Tongs /')) or body in ['쟁반과 집게','01  /  대전']:move(o,layout['trayShift'])
 elif o.type=='FONT':
  if body=='망고시루 · 열쇠로 열기':move(o,layout['safeShift'])
  elif abs(o.location.y-4.49)<.05 or abs(o.location.y-4.59)<.1 or body=='잠김':o.location.x*=1.4;o.location.y*=1.4
  else:move(o,layout['displayShift'])
 if o.type=='FONT' and body=='계산대 서랍에, 원 단위로':o.data.body='계산대 키패드에 입력해 주세요'
# The drawer no longer has a second, misleading PIN display.
for o in list(scene.objects):
 if o.parent and o.parent.name=='BakeryCashDrawer' and (o.type=='FONT' and o.data.body!='서랍' or 'Safe screen' in o.name):bpy.data.objects.remove(o,do_unlink=True)
before=set(scene.objects);P='12_Wide_bakery_register'
# Cashier counter: a real opening lets the drawer extend into the aisle.
for x in [3.54,5.46]:box((x,.56,-2.47),(.12,1.10,1.30),'Honey oak','Register counter')
box((4.5,.35,-2.47),(1.85,.66,1.28),'Deep olive','Register counter')
box((4.5,1.12,-2.47),(2.16,.12,1.42),'Ivory enamel','Register counter')
box((4.5,.98,-3.08),(2.0,.22,.09),'Honey oak','Register counter')
box((4.5,.56,-1.811),(1.84,.025,.014),'Aged brass','Register counter')
text('계 산 대',(4.5,.60,-1.795),.17,'Parchment',P,True)
text('열쇠 서랍',(4.5,.88,-1.905),.063,'Parchment',P)
# A visible customer-facing PIN terminal on top of the cashier counter.
box((4.5,1.20,-2.23),(.50,.15,.45),'Safe graphite','Register terminal')
box((4.5,1.61,-2.23),(1.12,.84,.14),'Deep olive','Register terminal')
box((4.5,1.85,-2.151),(.94,.20,.024),'Safe screen','Register terminal')
text('— — — — —',(4.5,1.811,-2.132),.071,'Parchment',P)
for i,label in enumerate(['1','2','3','4','5','6','7','8','9','C','0','OK']):
 x=4.22+(i%3)*.28;y=1.65-(i//3)*.112
 box((x,y,-2.138),(.22,.089,.038),'Ivory enamel','Register terminal')
 text(label,(x,y-.025,-2.112),.057,'Espresso ink',P,True)
box((4.5,2.18,-2.34),(2.05,.22,.035),'Deep olive','Register signage')
text('빵값 합계 · 비밀번호 입력',(4.5,2.13,-2.312),.080,'Parchment',P,True)
# The cake safe now stands on its own pedestal, away from the counter.
box((1,.38,-4.46),(1.65,.76,1.22),'Roasted walnut','Safe pedestal')
box((1,.77,-4.46),(1.72,.065,1.28),'Ivory enamel','Safe pedestal')
box((1,1.77,-4.46),(1.98,.36,.035),'Deep olive','Safe signage')
text('망고시루 금고',(1,1.795,-4.435),.13,'Parchment',P,True)
text('계산대 서랍의 열쇠로 열기',(1,1.67,-4.434),.060,'Parchment',P)
# Close the unused recess of the bread-counting table.
box((4,.57,4.36),(1.65,.93,.075),'Deep olive','Order table panel')
flush(collection=P,bevel=.005)
root=bpy.data.objects.new('BakeryRegister',None);col(P).objects.link(root);root['asset_id']='BakeryRegister';root['interactable']='bakery-register';root.location=xyz((4.5,1.61,-2.23));bpy.context.view_layer.update()
for o in groups['Register terminal']+[o for o in scene.objects if o not in before and o.type=='FONT' and (o.data.body in ['— — — — —','C','OK'] or o.data.body.isdigit())]:
 mw=o.matrix_world.copy();o.parent=root;o.matrix_world=mw
for o in scene.objects:
 if o not in before:o['wide_bakery_owned']=True
scene['bakery_layout_version']=3;scene['bakery_floor_dimensions']='16.8m x 14m';scene['scope']='Separated order table / PIN register and key drawer / Mango Siru safe'
cam=scene.objects['Camera_02_Player'];cam.location=xyz((.6,1.68,5.65));cam.rotation_euler=(Vector(xyz((2.9,1.3,-2.6)))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=24
scene.camera=cam
for f in [font,font_b]:
 if hasattr(f,'pack'):f.pack()
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/day-500-01-sungsimdang.blend'))
print('Expanded to 16.8 x 14m. Order table, PIN register, key drawer and standalone cake safe separated.')
