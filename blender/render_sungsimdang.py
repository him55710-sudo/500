import bpy,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s=bpy.data.scenes['Day_500_01_Sungsimdang'];bpy.context.window.scene=s
s.cycles.device='CPU'
s.cycles.samples=24;s.render.resolution_percentage=80
s.eevee.taa_render_samples=32
for cam,filename in [('Camera_01_Interior','sungsimdang-interior.png'),('Camera_03_Bread','sungsimdang-breads.png'),('Camera_02_Player','sungsimdang-player.png')]:
 s.camera=s.objects[cam];s.render.filepath=os.path.join(ROOT,'blender',filename)
 bpy.ops.render.render(write_still=True)
 print('FINISHED '+filename,flush=True)
