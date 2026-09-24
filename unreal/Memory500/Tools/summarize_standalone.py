import csv
import json
import statistics
import struct
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
label = sys.argv[1]
assert label.replace('-', '').replace('_', '').isalnum()
profile = root / 'Evidence' / f'{label}.csv'
screenshot = root / 'Evidence' / f'{label}.png'
resolution = struct.unpack('>II', screenshot.read_bytes()[16:24])
csv.field_size_limit(10_000_000)
with profile.open(encoding='utf8', newline='') as stream:
    rows = list(csv.DictReader(stream))
keys = ['FrameTime', 'GPUTime', 'GameThreadTime', 'GPU/LumenReflections', 'GPU/ShadowDepths', 'GPU/TemporalSuperResolution', 'GPUMem/LocalUsedMB', 'GPUMem/LocalBudgetMB']
result = {'source': profile.name, 'screenshot': screenshot.name, 'verified_viewport_pixels': resolution, 'internal_screen_percentage': int(sys.argv[2]), 'context': 'Uncooked standalone UE5.8 development runtime; no editor open, Codex open; first200rows omitted, screenshot at frame100; RTX4050Laptop6GB', 'metrics': {}}
for key in keys:
    values = []
    for row in rows[200:]:
        try:
            values.append(float(row[key]))
        except (KeyError, TypeError, ValueError):
            continue
    if values:
        ordered = sorted(values)
        result['metrics'][key] = {'mean': statistics.fmean(values), 'median': statistics.median(values), 'p95': ordered[int((len(ordered)-1)*0.95)], 'samples': len(values)}
result['fps_from_mean_frame_time'] = 1000 / result['metrics']['FrameTime']['mean']
(root / 'Evidence' / f'{label}-performance.json').write_text(json.dumps(result, indent=2), encoding='utf8')
print(json.dumps(result, indent=2))
