import json
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_VisualSlice'
lib = unreal.MaterialEditingLibrary
assets = unreal.AssetToolsHelpers.get_asset_tools()
subsystem = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
actors = {actor.get_actor_label(): actor for actor in subsystem.get_all_level_actors()}
parent = unreal.load_asset('/Game/Quality/Materials/M_Quality_Walnut')
report = []
for index in range(6):
    name = f'MI_Salon_Floor_{index}'
    path = f'/Game/Quality/Materials/{name}'
    instance = unreal.load_asset(path) or assets.create_asset(name, '/Game/Quality/Materials', unreal.MaterialInstanceConstant, unreal.MaterialInstanceConstantFactoryNew())
    lib.set_material_instance_parent(instance, parent)
    lib.set_material_instance_scalar_parameter_value(instance, 'RoughnessScale', 1.3)
    lib.set_material_instance_scalar_parameter_value(instance, 'NormalStrength', 0.18)
    variation = [0.96, 1.0, 0.93, 1.05, 1.02, 0.98][index]
    lib.set_material_instance_vector_parameter_value(instance, 'Tint', unreal.LinearColor(0.72 * variation, 0.52 * variation, 0.34 * variation, 1))
    lib.update_material_instance(instance)
    unreal.EditorAssetLibrary.save_loaded_asset(instance)
    actor = actors[f'Architecture_Walnut_plank_{index}']
    actor.get_component_by_class(unreal.StaticMeshComponent).set_material(0, instance)
    report.append({'actor': actor.get_actor_label(), 'material': path, 'roughness_scale': 1.3})
for index, location in enumerate([(555, -420, 277), (555, 490, 277), (-555, 100, 277)]):
    name = f'Salon_Sconce_{index}'
    actor = actors.get(name) or subsystem.spawn_actor_from_class(unreal.PointLight, unreal.Vector(*location))
    actor.set_actor_label(name)
    component = actor.get_component_by_class(unreal.PointLightComponent)
    component.set_mobility(unreal.ComponentMobility.MOVABLE)
    component.set_intensity_units(unreal.LightUnits.LUMENS)
    component.set_intensity(420)
    component.set_attenuation_radius(650)
    component.set_source_radius(8)
    component.set_temperature(3100)
    component.set_use_temperature(True)
    report.append({'actor': name, 'location_cm': location, 'lumens': 420})
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
(root / 'Evidence/surface-iteration03.json').write_text(json.dumps(report, indent=2), encoding='utf8')
