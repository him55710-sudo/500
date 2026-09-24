import json
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_VisualSlice'
assets = unreal.AssetToolsHelpers.get_asset_tools()
lib = unreal.MaterialEditingLibrary
texture_path = '/Game/Quality/Textures/residential_garden_2k'
texture = unreal.load_asset(texture_path)
if not texture:
    task = unreal.AssetImportTask()
    task.filename = str(root / 'SourceAssets/WindowVista/residential_garden_2k.hdr')
    task.destination_path = '/Game/Quality/Textures'
    task.automated = True
    task.save = True
    assets.import_asset_tasks([task])
    texture = unreal.load_asset(texture_path)
assert isinstance(texture, unreal.TextureCube), type(texture)
path = '/Game/Quality/Materials/M_SalonWindowVista'
material = unreal.load_asset(path) or assets.create_asset('M_SalonWindowVista', '/Game/Quality/Materials', unreal.Material, unreal.MaterialFactoryNew())
lib.delete_all_material_expressions(material)
material.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_UNLIT)
material.set_editor_property('used_with_nanite', True)
material.set_editor_property('two_sided', True)
camera = lib.create_material_expression(material, unreal.MaterialExpressionCameraVectorWS)
direction = lib.create_material_expression(material, unreal.MaterialExpressionMultiply)
direction.set_editor_property('const_b', -1.0)
assert lib.connect_material_expressions(camera, '', direction, 'A')
sample = lib.create_material_expression(material, unreal.MaterialExpressionTextureSampleParameterCube)
sample.set_editor_property('parameter_name', 'ExteriorPanorama')
sample.set_editor_property('texture', texture)
sample.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_LINEAR_COLOR)
uv_pin = list(lib.get_material_expression_input_names(sample))[0]
assert lib.connect_material_expressions(direction, '', sample, uv_pin)
brightness = lib.create_material_expression(material, unreal.MaterialExpressionMultiply)
brightness.set_editor_property('const_b', 40.0)
assert lib.connect_material_expressions(sample, 'RGB', brightness, 'A')
assert lib.connect_material_property(brightness, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
lib.layout_material_expressions(material)
lib.recompile_material(material)
unreal.EditorAssetLibrary.save_loaded_asset(material)
report = []
for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
    if actor.get_actor_label() not in ['ArchedWindow_detail', 'ArchedWindow_001_detail']:
        continue
    component = actor.get_component_by_class(unreal.StaticMeshComponent)
    for index in range(component.get_num_materials()):
        source = component.static_mesh.get_material(index)
        if source.get_name() == 'Clear_morning_window_glass':
            report.append({'actor': actor.get_actor_label(), 'slot': index, 'before': component.get_material(index).get_path_name()})
            component.set_material(index, material)
assert len(report) == 2
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
(root / 'Evidence/window-vista-application.json').write_text(json.dumps(report, indent=2), encoding='utf8')
