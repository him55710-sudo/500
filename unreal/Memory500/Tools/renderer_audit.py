import json
from pathlib import Path

import unreal

names = ['r.AntiAliasingMethod', 'r.ScreenPercentage', 'sg.AntiAliasingQuality', 'sg.GlobalIlluminationQuality', 'sg.ReflectionQuality', 'sg.ShadowQuality', 'r.DefaultFeature.AutoExposure.ExtendDefaultLuminanceRange', 'r.Lumen.DiffuseIndirect.Allow', 'r.TextureStreaming', 'r.Streaming.PoolSize']
data = {name: unreal.SystemLibrary.get_console_variable_float_value(name) for name in names}
data['camera'] = str(unreal.EditorLevelLibrary.get_level_viewport_camera_info())
(Path(unreal.Paths.project_dir()) / 'Evidence/renderer-audit.json').write_text(json.dumps(data, indent=2))
