# /// script
# requires-python = ">=3.11"
# dependencies = ["Pillow>=11,<13"]
# ///
# How to run: uv run Tools/quality_stationery_textures.py from the Unreal project.

from pathlib import Path
import random

from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1] / "SourceAssets/Quality/Stationery"
root.mkdir(parents=True, exist_ok=True)
width, height = 1024, 1448
rng = random.Random(500)
serif = "C:/Windows/Fonts/times.ttf"
hand = "C:/Windows/Fonts/segoepr.ttf"


def paper() -> Image.Image:
    noise = Image.frombytes("L", (width, height), rng.randbytes(width * height))
    channels = [noise.point(lambda value, base=base: base + round((value - 128) / 64)) for base in (230, 221, 199)]
    image = Image.merge("RGB", channels)
    draw = ImageDraw.Draw(image)
    for inset in range(12):
        color = (217 + inset, 209 + inset, 187 + inset)
        draw.rectangle((inset, inset, width - inset - 1, height - inset - 1), outline=color)
    return image


def staff(draw: ImageDraw.ImageDraw, top: int, pitches: list[int]) -> None:
    left, right, gap = 95, 935, 13
    for line in range(5):
        draw.line((left, top + line * gap, right, top + line * gap), fill=(97, 90, 77), width=2)
    for bar in range(5):
        x = left + bar * (right - left) // 4
        draw.line((x, top, x, top + gap * 4), fill=(73, 66, 55), width=2)
    for index, pitch in enumerate(pitches):
        x = left + 25 + index * 52
        y = top + gap * 4 - pitch * gap / 2
        draw.ellipse((x - 8, y - 5, x + 8, y + 5), fill=(60, 56, 48))
        draw.line((x + 7, y, x + 7, y - 43), fill=(60, 56, 48), width=2)
        if pitch < 0:
            draw.line((x - 12, top + gap * 5, x + 12, top + gap * 5), fill=(80, 73, 63), width=2)


score = paper()
draw = ImageDraw.Draw(score)
draw.text((width / 2, 75), "EVENING STUDY", anchor="mt", font=ImageFont.truetype(serif, 39), fill=(65, 59, 49))
draw.text((width / 2, 129), "Original piano sketch in C", anchor="mt", font=ImageFont.truetype(serif, 22), fill=(90, 82, 70))
draw.text((95, 193), "Moderato", font=ImageFont.truetype(serif, 25), fill=(73, 66, 57))
motif = [0, 2, 4, 7, 6, 4, 2, 0, 2, 4, 5, 9, 7, 4, 2, 0]
for system in range(4):
    top = 275 + system * 270
    staff(draw, top, motif[system * 3:] + motif[:system * 3])
    staff(draw, top + 105, [0, 4, 7, 4, 2, 5, 7, 5, 0, 4, 7, 4, 0, 2, 4, 0])
    draw.line((89, top, 89, top + 157), fill=(84, 77, 65), width=3)
    draw.text((101, top - 36), "p" if system < 2 else "mf", font=ImageFont.truetype(serif, 25), fill=(81, 74, 62))
draw.text((635, 1390), "softer at the return", font=ImageFont.truetype(hand, 18), fill=(125, 119, 104))
score.save(root / "original-score.png")

notebook = paper()
draw = ImageDraw.Draw(notebook)
for y in range(130, 1370, 49):
    draw.line((75, y, 948, y), fill=(171, 177, 164), width=1)
draw.line((140, 60, 140, 1390), fill=(184, 147, 132), width=2)
draw.text((176, 90), "Evening practice", font=ImageFont.truetype(hand, 40), fill=(87, 83, 74))
notes = [(202, "let the phrase breathe"), (347, "left hand very quiet"), (492, "repeat slowly"), (688, "listen to the last note")]
for y, content in notes:
    draw.text((177, y), content, font=ImageFont.truetype(hand, 29), fill=(118, 112, 98))
draw.line((176, 551, 453, 541), fill=(131, 121, 103), width=2)
draw.arc((524, 770, 819, 905), 25, 328, fill=(150, 139, 118), width=2)
draw.text((584, 820), "again", font=ImageFont.truetype(hand, 26), fill=(126, 119, 103))
notebook.save(root / "practice-notes.png")
paper().save(root / "paper-plain.png")
print(f"STATIONERY_TEXTURES_READY: {root}")
