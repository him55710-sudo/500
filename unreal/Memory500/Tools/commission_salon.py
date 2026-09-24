import json
import math
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
editor = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
registry = unreal.AssetRegistryHelpers.get_asset_registry()
registry.scan_paths_synchronous(['/Game/FirstPerson', '/Game/Input', '/Game/Characters'], True)
camera_data = json.loads((root / 'Evidence/fixed-cameras.json').read_text())
targets = [(-150, -350, 220), (-330, -370, 130), (-510, -60, 145)]
for spec, target in zip(camera_data, targets):
    camera = next(actor for actor in actors.get_all_level_actors() if actor.get_actor_label() == spec['name'])
    delta = [target[index] - spec['location_cm'][index] for index in range(3)]
    rotation = unreal.Rotator(pitch=math.degrees(math.atan2(delta[2], math.hypot(*delta[:2]))), yaw=math.degrees(math.atan2(delta[1], delta[0])), roll=0)
    camera.set_actor_rotation(rotation, False)
    spec['rotation'] = [rotation.pitch, rotation.yaw, rotation.roll]
(root / 'Evidence/fixed-cameras.json').write_text(json.dumps(camera_data, indent=2), encoding='utf8')
existing = {actor.get_actor_label() for actor in actors.get_all_level_actors()}
light_specs = [
    ('Baseline_Window', (-550, -350, 245), (0, 0), 9000, 6500, 190, 300),
    ('Baseline_Chandelier', (0, -60, 385), (-90, 0), 6500, 3100, 160, 160),
]
for name, position, angles, lumens, temperature, width, height in light_specs:
    if name in existing:
        continue
    light = actors.spawn_actor_from_class(unreal.RectLight, unreal.Vector(*position), unreal.Rotator(pitch=angles[0], yaw=angles[1], roll=0))
    light.set_actor_label(name)
    component = light.get_component_by_class(unreal.RectLightComponent)
    component.set_mobility(unreal.ComponentMobility.MOVABLE)
    component.set_intensity_units(unreal.LightUnits.LUMENS)
    component.set_intensity(lumens)
    component.set_attenuation_radius(2000)
    component.set_source_width(width)
    component.set_source_height(height)
    component.set_temperature(temperature)
    component.set_use_temperature(True)
if 'EvaluationExposure' not in existing:
    volume = actors.spawn_actor_from_class(unreal.PostProcessVolume, unreal.Vector())
    volume.set_actor_label('EvaluationExposure')
    volume.set_editor_property('unbound', True)
    settings = volume.get_editor_property('settings')
    for name, value in [('auto_exposure_min_brightness', 6.0), ('auto_exposure_max_brightness', 6.0), ('motion_blur_amount', 0.0), ('bloom_intensity', 0.1)]:
        settings.set_editor_property('override_' + name, True)
        settings.set_editor_property(name, value)
    volume.set_editor_property('settings', settings)
game_mode = unreal.load_class(None, '/Game/FirstPerson/Blueprints/BP_FirstPersonGameMode.BP_FirstPersonGameMode_C')
assert game_mode
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
world.get_world_settings().set_editor_property('default_game_mode', game_mode)
if 'Salon_PlayerStart' not in existing:
    start = actors.spawn_actor_from_class(unreal.PlayerStart, unreal.Vector(0, 350, 100), unreal.Rotator(pitch=0, yaw=-102.09476, roll=0))
    start.set_actor_label('Salon_PlayerStart')
assert editor.save_current_level()
unreal.log('MEMORY500_SALON_COMMISSIONED')
