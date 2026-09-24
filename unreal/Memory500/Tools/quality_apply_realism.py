# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: execute through Tools/run_unreal.py in a separate call after quality_stage_realism.py.
from __future__ import annotations

import json
from pathlib import Path
from typing import Final

import unreal

ROOT: Final = Path(unreal.Paths.project_dir())
SUBSYSTEM: Final = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
if world.get_path_name().split(".")[0] != "/Game/Maps/MemorySalon_VisualSlice":
    raise RuntimeError("Realism overrides belong only in MemorySalon_VisualSlice")
actors = {actor.get_actor_label(): actor for actor in SUBSYSTEM.get_all_level_actors()}
plan = json.loads((ROOT / "SourceAssets/Quality/Realism/trim-plan.json").read_text(encoding="utf8"))
staged = json.loads((ROOT / "Evidence/quality-realism-stage.json").read_text(encoding="utf8"))
expected = [name for group in staged for name in group["actors"]]
required_originals = [row["original_actor"] for row in plan] + [f"Architecture_Book_{index}" for index in range(5)]
for name in expected + required_originals:
    if name not in actors or not actors[name].get_component_by_class(unreal.StaticMeshComponent):
        raise RuntimeError(f"Required mesh actor is missing: {name}")
for row in plan:
    replacement = row["replacement_actor"]
    if not replacement:
        continue
    original = actors[row["original_actor"]].get_component_by_class(unreal.StaticMeshComponent)
    target = actors[replacement].get_component_by_class(unreal.StaticMeshComponent)
    if original.get_num_materials() != target.get_num_materials():
        raise RuntimeError(f"Material slots differ for preserved architecture: {replacement}")
    for slot in range(original.get_num_materials()):
        target.set_material(slot, original.get_material(slot))
hidden = []
previous_trim = ["Quality_Trim_Architecture_Aged_brass", "Quality_Trim_Architecture_Dark_walnut", "Quality_Trim_Architecture_Warm_bulb"]
for name in required_originals + ["Salon_BookSpineFoil", "Salon_CarafeNeckCollar"] + previous_trim:
    actor = actors.get(name)
    if not actor:
        continue
    component = actor.get_component_by_class(unreal.StaticMeshComponent)
    if not component:
        raise RuntimeError(f"Expected a replacement visual component: {name}")
    component.set_visibility(False, False)
    component.set_hidden_in_game(True, False)
    component.set_cast_shadow(False)
    actor.set_actor_hidden_in_game(True)
    hidden.append(name)
scan_targets = json.loads((ROOT / "SourceAssets/Quality/Realism/placement.json").read_text(encoding="utf8"))["objects"]
book_target = next(row for row in scan_targets if row["name"] == "Quality_RealShelfBooks")
book_actor = actors["Quality_RealShelfBooks"]
book_center, book_extent = book_actor.get_actor_bounds(False)
target = book_target["min_cm"]
offset = unreal.Vector(target[0] - (book_center.x - book_extent.x), target[1] - (book_center.y - book_extent.y), target[2] - (book_center.z - book_extent.z))
book_actor.set_actor_location(book_actor.get_actor_location() + offset, False, True)
mesh_editor = unreal.get_editor_subsystem(unreal.StaticMeshEditorSubsystem)
report = []
for name in expected:
    actor = actors[name]
    component = actor.get_component_by_class(unreal.StaticMeshComponent)
    if not component.static_mesh:
        raise RuntimeError(f"No imported mesh on {name}")
    shapes = mesh_editor.get_simple_collision_count(component.static_mesh)
    if shapes != 0:
        raise RuntimeError(f"Unexpected generated collision on {name}: {shapes}")
    center, extent = actor.get_actor_bounds(False)
    report.append({"actor": name, "min_cm": [center.x - extent.x, center.y - extent.y, center.z - extent.z],
                   "max_cm": [center.x + extent.x, center.y + extent.y, center.z + extent.z],
                   "simple_collision_shapes": shapes})
unreal.EditorAssetLibrary.save_directory("/Game/Quality/Models/Realism")
if not unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level():
    raise RuntimeError("The realism level could not be saved")
(ROOT / "Evidence/quality-realism-application.json").write_text(json.dumps({"hidden_original_visuals": hidden, "new_visuals": report}, indent=2), encoding="utf8")
unreal.log(f"QUALITY_REALISM_APPLIED: {len(report)} replacement meshes; original story roots preserved")
