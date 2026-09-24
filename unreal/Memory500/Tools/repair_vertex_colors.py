import unreal

level_editor = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
level_editor.load_level('/Game/Maps/ImportValidation')
material_path = '/Game/Materials/M_SourceVertexPaint'
material = unreal.load_asset(material_path)
if not material:
    material = unreal.AssetToolsHelpers.get_asset_tools().create_asset(
        'M_SourceVertexPaint', '/Game/Materials', unreal.Material, unreal.MaterialFactoryNew())
    vertex = unreal.MaterialEditingLibrary.create_material_expression(
        material, unreal.MaterialExpressionVertexColor, -400, 0)
    roughness = unreal.MaterialEditingLibrary.create_material_expression(
        material, unreal.MaterialExpressionConstant, -400, 180)
    roughness.set_editor_property('r', 0.46)
    assert unreal.MaterialEditingLibrary.connect_material_property(roughness, '', unreal.MaterialProperty.MP_ROUGHNESS)
expressions = unreal.MaterialEditingLibrary.get_material_expressions(material)
vertex = next(item for item in expressions if isinstance(item, unreal.MaterialExpressionVertexColor))
before = unreal.MaterialEditingLibrary.get_material_property_input_node(material, unreal.MaterialProperty.MP_BASE_COLOR)
unreal.log(f'MEMORY500_VERTEX_BASECOLOR_BEFORE={before}')
assert not unreal.MaterialEditingLibrary.connect_material_property(vertex, 'RGB', unreal.MaterialProperty.MP_BASE_COLOR)
assert unreal.MaterialEditingLibrary.connect_material_property(vertex, '', unreal.MaterialProperty.MP_BASE_COLOR)
material.set_editor_property('used_with_nanite', True)
unreal.MaterialEditingLibrary.recompile_material(material)
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()
for actor in actors:
    if actor.get_actor_label() == 'Doll_violinist_detail':
        component = actor.get_component_by_class(unreal.StaticMeshComponent)
        component.set_material(0, material)
unreal.EditorAssetLibrary.save_loaded_asset(material)
level_editor.save_current_level()
unreal.log('MEMORY500_VERTEX_COLORS_REPAIRED')
