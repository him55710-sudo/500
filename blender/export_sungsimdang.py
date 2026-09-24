"""Export only the authored bakery into a game-ready GLB; retain editable source."""
import bpy,os,json,struct
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=bpy.data.scenes['Day_500_01_Sungsimdang']
bpy.context.window.scene=src
hidden=[(c,c.hide_viewport,c.hide_render) for c in src.collection.children]
for c,_,_ in hidden:c.hide_viewport=False;c.hide_render=False
bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
export=bpy.data.scenes.new('SSD_EXPORT_TEMP');mapping={};export_materials={}
for o in src.objects:
 if o.type not in ['MESH','FONT','EMPTY']:continue
 if o.name.startswith('Stage_'):continue
 if o.type in ['MESH','FONT']:
  mesh=bpy.data.meshes.new_from_object(o.evaluated_get(dg),depsgraph=dg)
  # glTF cannot export procedural noise. Preserve its authored base colour in
  # temporary materials; keep the editable source's procedural nodes intact.
  for i,original in enumerate(mesh.materials):
   if original not in export_materials:
    flat=original.copy();flat.name=original.name+' / glTF'
    if flat.use_nodes:
     bsdf=next((n for n in flat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
     if bsdf:
      for socket in ['Base Color','Normal']:
       for link in list(bsdf.inputs[socket].links):flat.node_tree.links.remove(link)
      bsdf.inputs['Base Color'].default_value=original.diffuse_color
    export_materials[original]=flat
   mesh.materials[i]=export_materials[original]
  n=bpy.data.objects.new(o.name,mesh)
 else:n=bpy.data.objects.new(o.name,None)
 n.matrix_world=o.matrix_world.copy();export.collection.objects.link(n)
 for k in o.keys():n[k]=o[k]
 mapping[o]=n
for o,n in mapping.items():
 if o.parent in mapping:
  mw=n.matrix_world.copy();n.parent=mapping[o.parent];n.matrix_world=mw
bpy.context.window.scene=export
outdir=os.path.join(ROOT,'public','assets','world-spaces');os.makedirs(outdir,exist_ok=True)
out=os.path.join(outdir,'sungsimdang-room.glb')
bpy.ops.export_scene.gltf(filepath=out,use_active_scene=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
with open(out,'rb') as f:
 magic,version,total=struct.unpack('<4sII',f.read(12));assert magic==b'glTF' and version==2
 length,kind=struct.unpack('<II',f.read(8));data=json.loads(f.read(length))
assert sum(bool(n.get('extras',{}).get('product_name')) for n in data['nodes'])==86
assert sum(bool(n.get('extras',{}).get('checkout_item')) for n in data['nodes'])==27
assert any(n['name'].startswith('Gate_01_to_02_Pivot') for n in data['nodes'])
for c,hv,hr in hidden:c.hide_viewport=hv;c.hide_render=hr
bpy.context.window.scene=src
for o in list(export.objects):bpy.data.objects.remove(o,do_unlink=True)
bpy.data.scenes.remove(export)
for material in export_materials.values():bpy.data.materials.remove(material)
print(json.dumps({'glb':out,'bytes':total,'nodes':len(data['nodes']),'meshes':len(data.get('meshes',[]))},ensure_ascii=False))
