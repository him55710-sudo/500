import bpy,os,json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=bpy.data.scenes['Day_500_02_Junction'];bpy.context.window.scene=src;bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
tmp=bpy.data.scenes.new('JUNCTION_EXPORT');mapping={}
for o in src.objects:
 if o.type not in ['MESH','FONT','EMPTY']:continue
 if any(p.name=='JunctionHyunsu' for p in [o.parent] if p):continue
 n=bpy.data.objects.new(o.name,bpy.data.meshes.new_from_object(o.evaluated_get(dg),depsgraph=dg) if o.type in ['MESH','FONT'] else None)
 tmp.collection.objects.link(n);n.matrix_world=o.matrix_world.copy();mapping[o]=n
 for k in o.keys():n[k]=o[k]
for o,n in mapping.items():
 if o.parent in mapping:mw=n.matrix_world.copy();n.parent=mapping[o.parent];n.matrix_world=mw
bpy.context.window.scene=tmp
dest=os.path.join(ROOT,'public/assets/world-spaces/junction-finale.glb')
bpy.ops.export_scene.gltf(filepath=dest,use_active_scene=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
bpy.context.window.scene=src
for o in list(tmp.objects):bpy.data.objects.remove(o,do_unlink=True)
bpy.data.scenes.remove(tmp)
print(json.dumps({'file':dest,'bytes':os.path.getsize(dest)}))
