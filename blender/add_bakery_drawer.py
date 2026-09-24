import bpy,os,ast,math,json,re
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
scene=bpy.data.scenes['Day_500_01_Sungsimdang'];bpy.context.window.scene=scene
M={};B={};groups={};collections={c.name:c for c in scene.collection.children};ink='Espresso ink'
for o in scene.objects:
 if o.type=='MESH':
  for m in o.data.materials:
   if m and m.name.startswith('SSD / '):M[re.sub(r'\.\d+$','',m.name[6:])]=m
src=ast.parse(open(os.path.join(ROOT,'blender/build_sungsimdang.py'),encoding='utf8').read())
exec(compile(ast.Module(body=[n for n in src.body if isinstance(n,ast.FunctionDef) and n.name in ['xyz','col','add','box','tube','ball','path','ring','text','flush']],type_ignores=[]),'helpers','exec'),globals())
font=bpy.data.fonts.load('C:/Windows/Fonts/malgun.ttf',check_existing=True);font_b=bpy.data.fonts.load('C:/Windows/Fonts/malgunbd.ttf',check_existing=True)
for o in list(scene.objects):
 if o.get('drawer_addon'):bpy.data.objects.remove(o,do_unlink=True)
if not scene.get('drawer_vertical_space'):
 for o in list(scene.objects):
  if o.name in ['BakerySafeHinge','MangoSiruCake'] or o.name.startswith(('Safe housing /','Safe lining /')):o.location.z*=.8;o.scale.z*=.8
 scene['drawer_vertical_space']=True
# Replace the old safe keypad with a simple physical keyhole.
for o in list(scene.objects):
 if o.parent and o.parent.name=='BakerySafeHinge':
  if o.type=='FONT' or any(n in o.name for n in ['Safe screen','Safe graphite','Safe amber indicator']):bpy.data.objects.remove(o,do_unlink=True)
for o in scene.objects:
 if o.type=='FONT':
  if o.data.body=='다섯 자리 · 숫자만 입력':o.data.body='망고시루 · 열쇠로 열기'
  if o.data.body=='금고의 다섯 칸에, 원 단위로':o.data.body='계산대 서랍에, 원 단위로'
  if o.data.body=='03  PC방':o.data.body='03  500일 엔딩'
scene.objects['Gate_01_to_02_Pivot']['requires']='usbTaken'
scene['stage_order']='01_sungsimdang -> 02_postech_junction_korea_2026 -> 500_day_finale'
if scene.objects.get('Stage_02_Anchor'):scene.objects['Stage_02_Anchor']['requires']='usbTaken'
if scene.objects.get('Stage_03_Anchor'):scene.objects['Stage_03_Anchor']['title']='500일 엔딩'
before=set(scene.objects)
P='11_Drawer_and_USB'
box((4,.807,1.50),(1.42,.04,1.08),'Safe graphite','Cash drawer')
for x in [3.31,4.69]:box((x,.875,1.50),(.04,.13,1.08),'Safe graphite','Cash drawer')
box((4,.875,1.00),(1.42,.13,.045),'Safe graphite','Cash drawer')
box((4,.902,2.081),(1.55,.215,.075),'Deep olive','Cash drawer')
box((3.75,.934,2.126),(.64,.075,.018),'Safe screen','Cash drawer')
text('— — — — —',(3.75,.912,2.143),.045,'Parchment',P)
for i in range(5):box((4.25+(i%3)*.12,.946-(i//3)*.077,2.139),(.078,.052,.014),'Aged brass','Cash drawer')
text('서랍',(3.43,.873,2.142),.044,'Parchment',P)
# A gold key lying flat in the extending drawer.
ring((4,.851,1.78),.068,.013,'Aged brass','Cake key')
tube((4,.851,1.84),(4,.851,2.005),.017,'Aged brass','Cake key',10)
box((4.035,.851,1.975),(.075,.025,.025),'Aged brass','Cake key')
ball((4.22,.44,2.148),(.047,.047,.012),'Aged brass','Cake keyhole',16,10)
ball((4.22,.443,2.162),(.014,.014,.01),'Espresso ink','Cake keyhole',12,8)
box((4.22,.421,2.164),(.013,.025,.01),'Espresso ink','Cake keyhole')
box((4.10,.34,1.83),(.15,.038,.30),'Safe graphite','Cake USB')
box((4.10,.34,2.00),(.11,.025,.085),'Brushed baking trays','Cake USB')
text('USB',(4.10,.363,1.89),.035,'Parchment',P)
flush(collection=P,bevel=.003)
def parent(name,objects,pos,parent=None):
 root=bpy.data.objects.new(name,None);col(P).objects.link(root);root.location=xyz(pos);root['asset_id']=name;bpy.context.view_layer.update()
 for o in objects:mw=o.matrix_world.copy();o.parent=root;o.matrix_world=mw
 if parent:mw=root.matrix_world.copy();root.parent=parent;root.matrix_world=mw
 return root
drawer=parent('BakeryCashDrawer',groups['Cash drawer']+[o for o in scene.objects if o not in before and o.type=='FONT' and o.data.body!='USB'],(4,0,1.50))
parent('BakeryCakeKey',groups['Cake key'],(4,.85,1.86),drawer)
parent('BakeryCakeUSB',groups['Cake USB']+[o for o in scene.objects if o not in before and o.type=='FONT' and o.data.body=='USB'],(4.1,.34,1.89))
for o in groups['Cake keyhole']:
 mw=o.matrix_world.copy();o.parent=scene.objects['BakerySafeHinge'];o.matrix_world=mw
for o in scene.objects:
 if o not in before:o['drawer_addon']=True
scene['scope']='92,500 drawer -> key -> locked Mango Siru -> eating -> USB -> Junction'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender/day-500-01-sungsimdang.blend'))
print('Cash drawer, cake key and USB added')
