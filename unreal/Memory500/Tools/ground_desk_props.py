import json
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_VisualSlice'
subsystem = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
actors = {actor.get_actor_label(): actor for actor in subsystem.get_all_level_actors()}
desktop = 108.5
report = []
for label in ['Letter_detail', 'Architecture_Blue_rain_glass', 'LockBox_detail']:
    actor = actors[label]
    center, extent = actor.get_actor_bounds(False)
    bottom = center.z - extent.z
    offset = desktop + 0.03 - bottom
    location = actor.get_actor_location()
    actor.set_actor_location(unreal.Vector(location.x, location.y, location.z + offset), False, False)
    report.append({'actor': label, 'old_bottom_cm': bottom, 'new_bottom_cm': desktop + 0.03, 'offset_cm': offset})
collar = actors.get('Salon_CarafeNeckCollar') or subsystem.spawn_actor_from_class(unreal.StaticMeshActor, unreal.Vector(-415, -390, 156.95))
collar.set_actor_label('Salon_CarafeNeckCollar')
collar.set_actor_scale3d(unreal.Vector(0.077, 0.077, 0.052))
component = collar.get_component_by_class(unreal.StaticMeshComponent)
component.set_static_mesh(unreal.load_asset('/Engine/BasicShapes/Cylinder'))
component.set_material(0, unreal.load_asset('/Game/SourceSalon/salon-source/Materials/Aged_brass'))
component.set_collision_profile_name('NoCollision')
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
(root / 'Evidence/desk-contact-corrections.json').write_text(json.dumps(report, indent=2), encoding='utf8')
