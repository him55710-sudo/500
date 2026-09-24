import json
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir()).resolve()
request = json.loads((root / 'Tools/capture-request.json').read_text(encoding='utf8'))
camera = next(actor for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors() if actor.get_actor_label() == request['camera'])
editor = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
performance = unreal.get_default_object(unreal.load_class(None, '/Script/UnrealEd.EditorPerformanceSettings'))
performance.set_editor_property('bThrottleCPUWhenNotForeground', False)
editor.editor_set_viewport_realtime(True)
editor.pilot_level_actor(camera)
unreal.log(f'MEMORY500_CAMERA_PREPARED={camera.get_actor_label()}')
