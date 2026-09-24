"""Create an editable Blender 5.2 source scene for the CC0 casual player avatar."""
import bpy
import os
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "public", "assets", "hayoung-casual.gltf")
OUTPUT = os.path.join(ROOT, "blender", "hayoung-casual-avatar.blend")

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=SOURCE)
scene = bpy.context.scene
scene.name = "Hayoung_Casual_CC0_Avatar"

# The source pack includes a unit cube and a large sphere helper alongside the rig.
for obj in scene.objects:
    if obj.type == "MESH" and obj.name in {"Cube", "Icosphere"}:
        obj.hide_render = True
        obj.hide_viewport = True

avatar_meshes = [obj for obj in scene.objects if obj.type == "MESH" and obj.name not in {"Cube", "Icosphere"}]
points = [obj.matrix_world @ Vector(corner) for obj in avatar_meshes for corner in obj.bound_box]
center = Vector(tuple((min(p[i] for p in points) + max(p[i] for p in points)) / 2 for i in range(3)))
height = max(p.z for p in points) - min(p.z for p in points)

world = scene.world or bpy.data.worlds.new("Soft studio")
scene.world = world
world.use_nodes = True
world.node_tree.nodes.get("Background").inputs["Color"].default_value = (0.12, 0.15, 0.21, 1)
world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.45

for name, location, energy, color, size in [
    ("Key", (3.8, -3.6, 4.2), 620, (1.0, 0.83, 0.73), 4.0),
    ("Fill", (-3.8, -1.5, 2.1), 440, (0.62, 0.76, 1.0), 3.2),
    ("Rim", (2.5, 2.5, 3.8), 680, (1.0, 0.62, 0.76), 2.2),
]:
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.color = color
    data.shape = "DISK"
    data.size = size
    light = bpy.data.objects.new(name, data)
    scene.collection.objects.link(light)
    light.location = location
    light.rotation_euler = (center - light.location).to_track_quat("-Z", "Y").to_euler()

camera_data = bpy.data.cameras.new("Avatar portrait")
camera = bpy.data.objects.new("Avatar portrait", camera_data)
scene.collection.objects.link(camera)
camera.location = center + Vector((0, -5.0, 0))
camera.rotation_euler = (center - camera.location).to_track_quat("-Z", "Y").to_euler()
camera_data.type = "ORTHO"
camera_data.ortho_scale = max(height * 1.2, 2.0)
scene.camera = camera

scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 720
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = os.path.join(ROOT, "blender", "hayoung-casual-preview.png")
scene.view_settings.view_transform = "AgX"
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=OUTPUT)

print("HAYOUNG_AVATAR_READY", OUTPUT, "height=", round(height, 3), "m", "animations=", len(bpy.data.actions))
