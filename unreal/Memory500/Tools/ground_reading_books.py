import json
from pathlib import Path

import unreal

world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_VisualSlice'
actors = {actor.get_actor_label(): actor for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()}
report = []
for group, bottom in [([(0, -255, 49, -12), (1, -256, 50, 13)], 75.1), ([(2, -485, -150, -5), (3, -486, -149, 8), (4, -485, -150, -3)], 12.6)]:
    for index, x, y, yaw in group:
        actor = actors[f'Salon_ReadingBook_{index}']
        actor.set_actor_rotation(unreal.Rotator(pitch=90, yaw=yaw, roll=0), False)
        center, extent = actor.get_actor_bounds(False)
        location = actor.get_actor_location()
        actor.set_actor_location(unreal.Vector(location.x + x - center.x, location.y + y - center.y, location.z + bottom - center.z + extent.z), False, False)
        center, extent = actor.get_actor_bounds(False)
        assert 1.0 < extent.z * 2 < 5.0
        report.append({'label': actor.get_actor_label(), 'bottom_cm': center.z - extent.z, 'top_cm': center.z + extent.z, 'center_xy': [center.x, center.y], 'yaw': yaw})
        bottom = center.z + extent.z + 0.02
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
Path(unreal.Paths.project_dir(), 'Evidence/reading-book-contact-corrections.json').write_text(json.dumps(report, indent=2), encoding='utf8')
