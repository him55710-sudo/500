import json
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir()).resolve()
request = json.loads((root / 'Tools/capture-request.json').read_text(encoding='utf8'))
camera = next(actor for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors() if actor.get_actor_label() == request['camera'])
specs = json.loads((root / 'Evidence/fixed-cameras.json').read_text(encoding='utf8'))
spec = next(row for row in specs if row['name'] == request['camera'])
position = camera.get_actor_location()
rotation = camera.get_actor_rotation()
assert all(abs(actual - expected) < 0.001 for actual, expected in zip([position.x, position.y, position.z], spec['location_cm']))
assert all(abs(actual - expected) < 0.001 for actual, expected in zip([rotation.pitch, rotation.yaw, rotation.roll], spec['rotation']))
assert abs(camera.camera_component.field_of_view - spec['horizontal_fov']) < 0.001
output = root / 'Evidence' / f"{request['prefix']}-{request['camera']}.png"
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
unreal.SystemLibrary.execute_console_command(world, 'r.ScreenPercentage 100')
unreal.SystemLibrary.execute_console_command(world, 'r.HighResScreenshotDelay 64')
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).get_pilot_level_actor() == camera
unreal.AutomationLibrary.take_high_res_screenshot(1920, 1080, str(output), delay=0.0, force_game_view=True)
unreal.log(f'MEMORY500_FIXED_CAPTURE_REQUESTED={output}')
