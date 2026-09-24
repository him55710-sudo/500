# /// script
# requires-python = ">=3.11"
# dependencies = ["Pillow>=11,<13", "numpy>=2,<3"]
# ///
# How to run: uv run Tools/quality_realism_textures.py
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "SourceAssets/Quality/Realism/Textures"
ROOT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(50026)
size = 1024
y, x = np.mgrid[0:size, 0:size] / size
waves = sum(np.sin(2 * np.pi * (x * fx + y * fy) + phase) * strength for fx, fy, phase, strength in (
    (5, 3, 0.8, 0.25), (11, 13, 2.1, 0.15), (29, 17, 1.3, 0.08), (83, 73, 0.2, 0.03),
))
grain = rng.normal(0, 0.006, (size, size))
for name, rgb, roughness, variation in (
    ("Brass", (137, 99, 48), 0.29, 0.13),
    ("BlueGlaze", (39, 90, 112), 0.19, 0.08),
    ("GreenGlass", (22, 83, 44), 0.16, 0.05),
):
    micro = waves * variation + grain
    colour = np.clip(np.array(rgb)[None, None, :] * (1 + micro[:, :, None]), 0, 255).astype(np.uint8)
    Image.fromarray(colour).save(ROOT / f"{name}_Color.png")
    rough = np.clip((roughness + waves * 0.055 + grain * 1.5) * 255, 0, 255).astype(np.uint8)
    Image.fromarray(rough).save(ROOT / f"{name}_Rough.png")
    dy, dx = np.gradient(waves * 0.006 + grain * 0.025)
    normal = np.stack((-dx * 5, -dy * 5, np.ones_like(dx)), axis=-1)
    normal /= np.linalg.norm(normal, axis=-1, keepdims=True)
    Image.fromarray(np.clip((normal * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)).save(ROOT / f"{name}_Normal.png")
print("Generated nine original 1K surface maps")
