import json
import os
import sys
import time
from pathlib import Path

engine_root = Path(os.environ.get('MEMORY500_UNREAL_ROOT', r'C:\Program Files\Epic Games\UE_5.8'))
sys.path.insert(0, str(engine_root / 'Engine/Plugins/Experimental/PythonScriptPlugin/Content/Python'))
import remote_execution

script = Path(sys.argv[1]).resolve()
output = Path(sys.argv[2]).resolve()
session = remote_execution.RemoteExecution()
session.start()
try:
    deadline = time.monotonic() + 12
    expected_pid = json.loads((Path(__file__).parent / 'editor-session.json').read_text(encoding='utf-8-sig'))['pid']
    selected = None
    checked = set()
    while time.monotonic() < deadline:
        for node in session.remote_nodes:
            if node.get('project_name') != 'Memory500' or node['node_id'] in checked:
                continue
            session.open_command_connection(node['node_id'])
            identity = session.run_command("__import__('os').getpid()", exec_mode=remote_execution.MODE_EVAL_STATEMENT, raise_on_failure=True)
            if int(identity['result']) == expected_pid:
                selected = node
                break
            checked.add(node['node_id'])
            session.close_command_connection()
        if selected is not None:
            break
        time.sleep(0.25)
    if selected is None:
        raise RuntimeError(f'Owned editor PID {expected_pid} not found; will not modify another editor')
    result = session.run_command(str(script), raise_on_failure=False)
    output.write_text(json.dumps(result, indent=2), encoding='utf8')
    if not result['success']:
        raise RuntimeError(result['result'])
    print(f'Unreal execution succeeded: {script.name}; evidence: {output}')
finally:
    session.stop()
