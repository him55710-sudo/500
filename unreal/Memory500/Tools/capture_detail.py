import json
import math
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
subsystem = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
label = 'DESK_DETAIL'
actor = next((actor for actor in subsystem.get_all_level_actors() if actor.get_actor_label() == label), None)
actor = actor or subsystem.spawn_actor_from_class(unreal.CameraActor, unreal.Vector(-345, -245, 195))
actor.set_actor_label(label)
actor.tags = ['SupplementaryDetailCamera']
position = [-345, -245, 195]
target = [-345, -378, 112]
delta = [target[i] - position[i] for i in range(3)]
rotation = unreal.Rotator(pitch=math.degrees(math.atan2(delta[2], math.hypot(delta[0], delta[1]))), yaw=math.degrees(math.atan2(delta[1], delta[0])), roll=0)
actor.set_actor_location(unreal.Vector(*position), False, False)
actor.set_actor_rotation(rotation, False)
actor.camera_component.set_field_of_view(55)
editor = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
editor.pilot_level_actor(actor)
editor.editor_set_viewport_realtime(True)
assert editor.save_current_level()
(root / 'Evidence/desk-detail-camera.json').write_text(json.dumps({'name': label, 'location_cm': position, 'rotation': [rotation.pitch, rotation.yaw, rotation.roll], 'horizontal_fov': 55, 'role': 'supplementary detail QA, not a fixed A/B/C comparison'}, indent=2), encoding='utf8')
