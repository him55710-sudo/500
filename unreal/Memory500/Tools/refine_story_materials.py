import json
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_VisualSlice'
lib = unreal.MaterialEditingLibrary
assets = unreal.AssetToolsHelpers.get_asset_tools()
destination = '/Game/Quality/Materials'
paint_path = destination + '/M_SalonStoryPaint'
paint = unreal.load_asset(paint_path)
if not paint:
    paint = unreal.EditorAssetLibrary.duplicate_asset(destination + '/M_Quality_Walnut', paint_path)
if unreal.EditorAssetLibrary.get_metadata_tag(paint, 'StorySurfaceComplete') != '1':
    vertex = lib.create_material_expression(paint, unreal.MaterialExpressionVertexColor)
    assert lib.connect_material_property(vertex, '', unreal.MaterialProperty.MP_BASE_COLOR)
    old_roughness = lib.get_material_property_input_node(paint, unreal.MaterialProperty.MP_ROUGHNESS)
    limited = lib.create_material_expression(paint, unreal.MaterialExpressionClamp)
    limited.set_editor_property('min_default', 0.42)
    limited.set_editor_property('max_default', 0.72)
    input_pin = list(lib.get_material_expression_input_names(limited))[0]
    assert lib.connect_material_expressions(old_roughness, '', limited, input_pin)
    assert lib.connect_material_property(limited, '', unreal.MaterialProperty.MP_ROUGHNESS)
    lib.layout_material_expressions(paint)
    lib.recompile_material(paint)
    unreal.EditorAssetLibrary.set_metadata_tag(paint, 'StorySurfaceComplete', '1')
    unreal.EditorAssetLibrary.save_loaded_asset(paint)
paint_instance = unreal.load_asset(destination + '/MI_SalonStoryPaint') or assets.create_asset('MI_SalonStoryPaint', destination, unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
lib.set_material_instance_parent(paint_instance, paint)
lib.set_material_instance_scalar_parameter_value(paint_instance, 'NormalStrength', 0.07)
lib.set_material_instance_scalar_parameter_value(paint_instance, 'RoughnessScale', 1.3)
lib.set_material_instance_vector_parameter_value(paint_instance, 'TileSizeCm', unreal.LinearColor(35, 35, 35, 1))
lib.update_material_instance(paint_instance)
unreal.EditorAssetLibrary.save_loaded_asset(paint_instance)
colors = [(0.16, 0.06, 0.045), (0.075, 0.14, 0.12), (0.31, 0.21, 0.1), (0.08, 0.11, 0.18), (0.35, 0.12, 0.1)]
book_materials = {}
for index, color in enumerate(colors):
    name = f'MI_SalonBookCloth_{index}'
    instance = unreal.load_asset(destination + '/' + name) or assets.create_asset(name, destination, unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
    lib.set_material_instance_parent(instance, unreal.load_asset(destination + '/M_Quality_Jacquard'))
    for name, value in [('ColorVariation', 0.0), ('NormalStrength', 0.12), ('RoughnessScale', 1.2)]:
        lib.set_material_instance_scalar_parameter_value(instance, name, value)
    lib.set_material_instance_vector_parameter_value(instance, 'Tint', unreal.LinearColor(*color, 1))
    lib.set_material_instance_vector_parameter_value(instance, 'TileSizeCm', unreal.LinearColor(6, 6, 6, 1))
    lib.update_material_instance(instance)
    unreal.EditorAssetLibrary.save_loaded_asset(instance)
    book_materials[f'Book_{index}'] = instance
report = []
for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
    component = actor.get_component_by_class(unreal.StaticMeshComponent)
    if not component or not component.static_mesh:
        continue
    for index in range(component.get_num_materials()):
        source = component.static_mesh.get_material(index)
        name = source.get_name() if source else ''
        target = paint_instance if name == 'Hand_painted_miniature' else book_materials.get(name)
        if target:
            component.set_material(index, target)
            report.append({'actor': actor.get_actor_label(), 'slot': index, 'material': target.get_path_name()})
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
(root / 'Evidence/story-surface-iteration04.json').write_text(json.dumps(report, indent=2), encoding='utf8')
