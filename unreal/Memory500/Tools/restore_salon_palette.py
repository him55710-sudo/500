import unreal

material = unreal.load_asset('/Game/Materials/M_SourceVertexPaint')
assert material
count = 0
for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
    component = actor.get_component_by_class(unreal.StaticMeshComponent)
    if not component:
        continue
    for index in range(component.get_num_materials()):
        source = component.get_material(index)
        if source and source.get_name() == 'Hand_painted_miniature':
            component.set_material(index, material)
            count += 1
assert count == 9, f'Expected 3 dolls + carousel + 5 horses; found {count}'
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
unreal.log(f'MEMORY500_PALETTE_RESTORED={count}')
