"""Render inspectable overview and top plan from the saved Junction scene."""
import bpy, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s=bpy.data.scenes['Day_500_02_Junction'];bpy.context.window.scene=s
s.render.engine='CYCLES';s.cycles.samples=12;s.cycles.use_denoising=True
s.render.resolution_x=1400;s.render.resolution_y=1200;s.render.resolution_percentage=100
s.render.image_settings.file_format=next(i.identifier for i in s.render.image_settings.bl_rna.properties['file_format'].enum_items if i.identifier=='PNG')
for o in s.objects:
 if o.name.startswith(('Roof trusses /','Spot housings /')):o.hide_render=True
s.camera=s.objects['Camera_Junction'];s.render.filepath=os.path.join(ROOT,'blender/junction-purple-overview.png')
bpy.ops.render.render(write_still=True)
s.camera=s.objects['Camera_Plan'];s.render.resolution_x=1400;s.render.resolution_y=1400
s.render.filepath=os.path.join(ROOT,'blender/junction-purple-plan.png')
bpy.ops.render.render(write_still=True)
