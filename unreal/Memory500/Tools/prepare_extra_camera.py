import json
import math
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
request = json.loads((root / 'Tools/extra-camera-request.json').read_text(encoding='utf-8-sig'))
label = request['name']
assert label.endswith('_DETAIL') and label.replace('_', '').isalnum()
subsystem = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
actor = next((item for item in subsystem.get_all_level_actors() if item.get_actor_label() == label), None)
position, target = request['position'], request['target']
actor = actor or subsystem.spawn_actor_from_class(unreal.CameraActor, unreal.Vector(*position))
actor.set_actor_label(label)
actor.tags = ['SupplementaryDetailCamera']
delta = [target[i] - position[i] for i in range(3)]
rotation = unreal.Rotator(pitch=math.degrees(math.atan2(delta[2], math.hypot(delta[0], delta[1]))), yaw=math.degrees(math.atan2(delta[1], delta[0])), roll=0)
actor.set_actor_location(unreal.Vector(*position), False, False)
actor.set_actor_rotation(rotation, False)
actor.camera_component.set_field_of_view(request['fov'])
editor = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
editor.pilot_level_actor(actor)
editor.editor_set_viewport_realtime(True)
performance = unreal.get_default_object(unreal.load_class(None, '/Script/UnrealEd.EditorPerformanceSettings'))
performance.set_editor_property('bThrottleCPUWhenNotForeground', False)
capture = json.loads((root / 'Tools/capture-viewport.json').read_text(encoding='utf-8-sig'))
capture['arguments']['arguments']['captureTransform'] = {
    'location': dict(zip(['x', 'y', 'z'], position)),
    'rotation': {'pitch': rotation.pitch, 'yaw': rotation.yaw, 'roll': 0},
}
(root / 'Tools/capture-current.json').write_text(json.dumps(capture, indent=2), encoding='utf8')
assert editor.save_current_level()
(root / 'Evidence' / f'{label.lower().replace("_", "-")}-camera.json').write_text(json.dumps(request, indent=2), encoding='utf8')
