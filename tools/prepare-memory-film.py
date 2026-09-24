"""Create display-sized web copies; keep the personal album originals untouched."""
from pathlib import Path
import re
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
source = root / '프롤로그 사진집'
target = root / 'public/assets/prologue'
target.mkdir(parents=True, exist_ok=True)
photos = sorted(source.iterdir(), key=lambda p: int(m.group(1)) if (m := re.search(r'_(\d\d)$', p.stem)) else 0)
total = 0
for index, path in enumerate(photos):
    with Image.open(path) as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        photo.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
        output = target / f'memory-{index + 1:02}.webp'
        photo.save(output, 'WEBP', quality=88, method=6)
        total += output.stat().st_size
        print(f'{output.name}: {photo.width}x{photo.height}')
print(f'{len(photos)} photos, {total / 1024 / 1024:.2f} MB')
