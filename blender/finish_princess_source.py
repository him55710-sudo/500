"""Give the unbatched editable source the same camera and lights as the game export scene."""
import bpy, os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
scene=bpy.context.scene
with bpy.data.libraries.load(os.path.join(root,'blender','hayoung-kitty-heaven.blend'),link=False) as (src,dst):
 dst.objects=[n for n in src.objects if n in ['Princess room camera','Cloud daylight','Rose window glow','Portrait fill']]
 dst.worlds=['Pearl sky']
for obj in dst.objects:
 if obj:scene.collection.objects.link(obj)
 if obj and obj.type=='CAMERA':scene.camera=obj
scene.world=dst.worlds[0]
try:scene.render.engine='CYCLES'
except TypeError:pass
scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1440;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
for area in bpy.context.screen.areas:
 if area.type=='VIEW_3D':
  area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.shading.type='MATERIAL'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root,'blender','hayoung-kitty-heaven-editable.blend'))
print('Editable princess room ready:',len(scene.objects),'objects')
