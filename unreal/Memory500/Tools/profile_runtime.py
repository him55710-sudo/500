import json
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_game_world()
assert world
request_file = root / 'Tools/profile-request.json'
request = json.loads(request_file.read_text(encoding='utf-8-sig')) if request_file.exists() else {'screen_percentage': 100, 'label': 'native'}
percentage = float(request['screen_percentage'])
assert 50 <= percentage <= 100
for command in [f'r.ScreenPercentage {percentage}', 'r.VSync 0', 't.MaxFPS 0', 'stat unit', 'stat fps', 'r.GPUCsvStatsEnabled 1', 'csvprofile start']:
    unreal.SystemLibrary.execute_console_command(world, command)
state = {'elapsed': 0.0, 'handle': None, 'samples': []}


def tick(delta):
    state['elapsed'] += delta
    state['samples'].append(delta)
    if state['elapsed'] >= 20.0:
        unreal.unregister_slate_post_tick_callback(state['handle'])
        unreal.SystemLibrary.execute_console_command(world, 'csvprofile stop')
        (root / 'Evidence/runtime-frame-samples.json').write_text(json.dumps({'duration': state['elapsed'], 'samples': state['samples'], 'request': request, 'context': '1080p PIE, two editor processes and Codex open; includes profiling setup'}, indent=2), encoding='utf8')


state['handle'] = unreal.register_slate_post_tick_callback(tick)
