import bpy
from mathutils import Vector
path=r'C:\Users\user\Downloads\500일 방탈출\public\assets\hayoung-casual.gltf'
out=r'C:\Users\user\Downloads\500일 방탈출\blender\hayoung-casual-preview.png'
bpy.ops.import_scene.gltf(filepath=path)
for o in bpy.context.scene.objects:
 if o.type=='MESH' and o.name in {'Cube','Icosphere'}: o.hide_render=True; o.hide_viewport=True
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.name not in {'Cube','Icosphere'}]
points=[o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
mins=[min(p[i] for p in points) for i in range(3)]; maxs=[max(p[i] for p in points) for i in range(3)]
center=Vector(tuple((mins[i]+maxs[i])/2 for i in range(3))); height=maxs[2]-mins[2]
print('CHARACTER_BOUNDS',mins,maxs,'HEIGHT',height,'CENTER',list(center))
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE';scene.render.resolution_x=720;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=out
world=scene.world or bpy.data.worlds.new('Preview');scene.world=world;world.use_nodes=True;world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.06,.075,.12,1);world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.35
for name,loc,power,color,size in [('Key',(4,-4,4),600,(1,.82,.68),4),('Fill',(-4,-1,2),450,(.55,.72,1),3),('Rim',(2,3,4),700,(1,.54,.69),2)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(center-o.location).to_track_quat('-Z','Y').to_euler()
camd=bpy.data.cameras.new('Preview');cam=bpy.data.objects.new('Preview',camd);scene.collection.objects.link(cam);cam.location=center+Vector((0,-5,0));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();camd.type='ORTHO';camd.ortho_scale=max(height*1.2,2);scene.camera=cam
bpy.ops.render.render(write_still=True)
print('RENDERED',out)
