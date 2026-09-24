import bpy
from mathutils import Vector
bpy.ops.import_scene.gltf(filepath=r'C:\Users\user\Downloads\500일 방탈출\public\assets\hayoung-casual.gltf')
for o in bpy.context.scene.objects:
 if o.type=='MESH':
  pts=[o.matrix_world @ Vector(c) for c in o.bound_box]
  mn=[min(p[i] for p in pts) for i in range(3)];mx=[max(p[i] for p in pts) for i in range(3)]
  print('OBJECT',o.name,'DIM',[round(mx[i]-mn[i],3) for i in range(3)],'LOC',list(o.location),'SCALE',list(o.scale))
