from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir()).resolve()
camera = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).get_pilot_level_actor()
assert camera and camera.actor_has_tag('SupplementaryDetailCamera')
filename = camera.get_actor_label().lower().replace('_', '-') + '.png'
unreal.SystemLibrary.execute_console_command(unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world(), 'r.ScreenPercentage 100')
unreal.AutomationLibrary.take_high_res_screenshot(1920, 1080, str(root / 'Evidence' / filename), delay=0.0, force_game_view=True)
