import bpy
from mathutils import Vector
path=r'C:\Users\user\Downloads\500일 방탈출\public\assets\hayoung-casual.gltf'
bpy.ops.import_scene.gltf(filepath=path)
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
points=[o.matrix_world @ Vector(corner) for o in meshes for corner in o.bound_box]
mins=[min(p[i] for p in points) for i in range(3)]
maxs=[max(p[i] for p in points) for i in range(3)]
print('MODEL_BOUNDS',mins,maxs,'DIMENSIONS',[maxs[i]-mins[i] for i in range(3)])
print('MODEL_MESHES',[(o.name, len(o.data.vertices), len(o.data.polygons)) for o in meshes])
print('MODEL_ACTIONS',[a.name for a in bpy.data.actions])
