"""Reuse the local CC0 Quaternius female character in a tailored cabin uniform."""
import bpy
from mathutils import Vector

def build_attendant(scene, root_path, location):
 before=set(scene.objects)
 bpy.ops.import_scene.gltf(filepath=root_path+'/public/assets/hayoung-casual.gltf')
 imported=set(scene.objects)-before
 for ob in imported:
  if ob.type=='ARMATURE':
   action=next((a for a in bpy.data.actions if a.name.startswith('Idle_Neutral')),None)
   if action:
    ob.animation_data_create();ob.animation_data.action=action
    if action.slots:ob.animation_data.action_slot=action.slots[0]
 scene.frame_set(1);bpy.context.view_layer.update()
 dg=bpy.context.evaluated_depsgraph_get()
 sources=[o for o in imported if o.type=='MESH' and o.name.startswith('Casual_')]
 evaluated=[]
 for source in sources:
  mesh=bpy.data.meshes.new_from_object(source.evaluated_get(dg),depsgraph=dg)
  mesh.transform(source.matrix_world);evaluated.append((source,mesh))
 points=[v.co for _,me in evaluated for v in me.vertices]
 low=min(v.z for v in points);height=max(v.z for v in points)-low;scale=1.78/height
 center=Vector(((min(v.x for v in points)+max(v.x for v in points))/2,(min(v.y for v in points)+max(v.y for v in points))/2,low))
 root=bpy.data.objects.new('JourneyAttendant',None);scene.collection.objects.link(root);root.location=location
 def material(name,color,rough=.65,metal=0):
  m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
  bsdf=m.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(*color,1);bsdf.inputs['Roughness'].default_value=rough;bsdf.inputs['Metallic'].default_value=metal;return m
 navy=material('Crew midnight tailored uniform',(.024,.055,.10));shoe=material('Crew polished shoes',(.02,.026,.033),.3)
 teal=material('Crew silk scarf',(.10,.47,.47),.32);gold=material('Crew brass insignia',(.8,.58,.21),.28,.7);ivory=material('Crew ivory collar',(.91,.9,.82))
 for source,me in evaluated:
  for vert in me.vertices:vert.co=(vert.co-center)*scale
  for i,m in enumerate(me.materials):
   if source.name.startswith('Casual_Body') and not m.name.startswith('Skin'):me.materials[i]=navy
   elif source.name.startswith('Casual_Legs'):me.materials[i]=navy
   elif source.name.startswith('Casual_Feet') and not m.name.startswith('Skin'):me.materials[i]=shoe
  ob=bpy.data.objects.new('CrewFemale_'+source.name,me);scene.collection.objects.link(ob);ob.parent=root
 def accessory(name,p,size,mat):
  bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=10,location=(0,0,0))
  ob=bpy.context.object;ob.name=name;ob.parent=root;ob.location=p;ob.scale=size;ob.data.materials.append(mat)
  for poly in ob.data.polygons:poly.use_smooth=True
  return ob
 # Source character faces Blender -Y (game +Z).
 accessory('CrewScarfCollar',(0,-.005,1.41),(.115,.085,.035),ivory)
 accessory('CrewScarfKnot',(.05,-.092,1.395),(.045,.032,.045),teal)
 tail=accessory('CrewScarfTail',(.085,-.107,1.30),(.033,.018,.105),teal);tail.rotation_euler.y=-.2
 accessory('CrewWingBadge',(-.12,-.124,1.25),(.065,.014,.014),gold)
 accessory('CrewPillboxHat',(0,.005,1.755),(.155,.14,.052),navy)
 accessory('CrewHatBadge',(0,-.132,1.755),(.033,.009,.018),gold)
 for ob in imported:bpy.data.objects.remove(ob,do_unlink=True)
 return root
