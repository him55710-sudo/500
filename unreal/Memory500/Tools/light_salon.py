import json
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_VisualSlice'
subsystem = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
actors = {actor.get_actor_label(): actor for actor in subsystem.get_all_level_actors()}
specs = [
    ('Baseline_Window', (-530, -350, 255), -8, 0, 3400, 5900, 100, 180),
    ('Salon_WindowNorth', (-530, 380, 255), -8, 0, 2400, 5900, 100, 180),
    ('Baseline_Chandelier', (0, -60, 385), -90, 0, 2200, 3000, 65, 65),
]
for name, location, pitch, yaw, lumens, temperature, width, height in specs:
    actor = actors.get(name) or subsystem.spawn_actor_from_class(unreal.RectLight, unreal.Vector(*location))
    actor.set_actor_label(name)
    actor.set_actor_location(unreal.Vector(*location), False, False)
    actor.set_actor_rotation(unreal.Rotator(pitch=pitch, yaw=yaw, roll=0), False)
    component = actor.get_component_by_class(unreal.RectLightComponent)
    component.set_mobility(unreal.ComponentMobility.MOVABLE)
    component.set_intensity_units(unreal.LightUnits.LUMENS)
    component.set_intensity(lumens)
    component.set_attenuation_radius(1800)
    component.set_source_width(width)
    component.set_source_height(height)
    component.set_temperature(temperature)
    component.set_use_temperature(True)
for actor in actors.values():
    if actor.get_actor_label().startswith('FrameCover'):
        for item in [actor, *actor.get_attached_actors(reset_array=True, recursively_include_attached_actors=True)]:
            item.set_actor_hidden_in_game(True)
            item.set_is_temporarily_hidden_in_editor(True)
settings = actors['EvaluationExposure'].get_editor_property('settings')
settings.set_editor_property('auto_exposure_min_brightness', 24.0)
settings.set_editor_property('auto_exposure_max_brightness', 24.0)
actors['EvaluationExposure'].set_editor_property('settings', settings)
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
(root / 'Evidence/lighting-iteration02.json').write_text(json.dumps(specs, indent=2), encoding='utf8')
