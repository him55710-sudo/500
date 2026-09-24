# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: execute in the MemorySalon_VisualSlice editor via Tools/run_unreal.py.
"""Import the licensed prop package into an explicitly isolated visual level."""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Final

import unreal

ROOT: Final = Path(unreal.Paths.project_dir())
ACTORS: Final = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
MANAGER: Final = unreal.InterchangeManager.get_interchange_manager_scripted()


@dataclass(frozen=True, slots=True)
class Placement:
    asset_id: str
    resolution: str
    position: tuple[float, float, float]
    yaw: float = 0.0
    selected_variant: str = ""


def bounds(actors: list[unreal.Actor]) -> tuple[list[float], list[float]]:
    """Aggregate only imported visible meshes; scene helper bounds are excluded."""
    minima = [math.inf] * 3
    maxima = [-math.inf] * 3
    for actor in actors:
        center, extent = actor.get_actor_bounds(False)
        for index, (value, radius) in enumerate(zip((center.x, center.y, center.z), (extent.x, extent.y, extent.z), strict=True)):
            minima[index] = min(minima[index], value - radius)
            maxima[index] = max(maxima[index], value + radius)
    return minima, maxima


def place(spec: Placement) -> list[unreal.Actor]:
    """Preserve glTF assembly offsets while grounding models in centimeters."""
    prefix = f"Quality_{spec.asset_id}_"
    existing = [actor for actor in ACTORS.get_all_level_actors() if actor.get_actor_label().startswith(prefix)]
    if existing:
        minimum, maximum = bounds(existing)
        offset = unreal.Vector(spec.position[0] - (minimum[0] + maximum[0]) * 0.5, spec.position[1] - (minimum[1] + maximum[1]) * 0.5, spec.position[2] - minimum[2])
        for actor in existing:
            actor.set_actor_location(actor.get_actor_location() + offset, False, True)
        return existing
    previous = {actor.get_path_name() for actor in ACTORS.get_all_level_actors()}
    source_path = ROOT / "SourceAssets/Quality" / spec.asset_id / f"{spec.asset_id}_{spec.resolution}.gltf"
    source = MANAGER.create_source_data(str(source_path))
    params = unreal.ImportAssetParameters()
    params.is_automated = True
    params.replace_existing = False
    if not MANAGER.import_scene(f"/Game/Quality/Models/{spec.asset_id}", source, params):
        raise RuntimeError(f"Import failed: {source_path}")
    created = [actor for actor in ACTORS.get_all_level_actors() if actor.get_path_name() not in previous]
    meshes = []
    angle = math.radians(spec.yaw)
    for actor in created:
        component = actor.get_component_by_class(unreal.StaticMeshComponent)
        if not component or not component.static_mesh:
            continue
        original = actor.get_actor_label()
        if spec.selected_variant and spec.selected_variant not in original:
            actor.set_actor_label(f"QualityUnused_{spec.asset_id}_{original}")
            actor.set_actor_hidden_in_game(True)
            actor.set_is_temporarily_hidden_in_editor(True)
            component.set_collision_enabled(unreal.CollisionEnabled.NO_COLLISION)
            continue
        actor.set_actor_label(prefix + original)
        actor.set_folder_path("Quality/RealObjects")
        actor.tags = ["QualityRealObject", "PolyHavenCC0"]
        location = actor.get_actor_location()
        actor.set_actor_location(unreal.Vector(location.x * math.cos(angle) - location.y * math.sin(angle), location.x * math.sin(angle) + location.y * math.cos(angle), location.z), False, True)
        actor.add_actor_world_rotation(unreal.Rotator(pitch=0.0, yaw=spec.yaw, roll=0.0), False, True)
        component.set_collision_profile_name("BlockAll")
        body = component.static_mesh.get_editor_property("body_setup")
        if body:
            body.set_editor_property("collision_trace_flag", unreal.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
        meshes.append(actor)
    if not meshes:
        raise RuntimeError(f"No renderable meshes: {spec.asset_id}")
    minimum, maximum = bounds(meshes)
    offset = unreal.Vector(spec.position[0] - (minimum[0] + maximum[0]) * 0.5, spec.position[1] - (minimum[1] + maximum[1]) * 0.5, spec.position[2] - minimum[2])
    for actor in meshes:
        actor.set_actor_location(actor.get_actor_location() + offset, False, True)
    return meshes


def resize_height(actors: list[unreal.Actor], height_cm: float) -> None:
    minimum, maximum = bounds(actors)
    factor = height_cm / (maximum[2] - minimum[2])
    pivot = unreal.Vector((minimum[0] + maximum[0]) * 0.5, (minimum[1] + maximum[1]) * 0.5, minimum[2])
    for actor in actors:
        scale = actor.get_actor_scale3d()
        offset = actor.get_actor_location() - pivot
        actor.set_actor_scale3d(unreal.Vector(scale.x * factor, scale.y * factor, scale.z * factor))
        actor.set_actor_location(pivot + unreal.Vector(offset.x * factor, offset.y * factor, offset.z * factor), False, True)


def main() -> None:
    """Only the editor-owning session may run this serial import operation."""
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    if world.get_path_name().split(".")[0] != "/Game/Maps/MemorySalon_VisualSlice":
        raise RuntimeError(f"Open MemorySalon_VisualSlice before importing: {world.get_path_name()}")
    chair = place(Placement("ArmChair_01", "2k", (-280.0, 230.0, 3.0), 15.0))
    table = place(Placement("round_wooden_table_01", "2k", (-275.0, 70.0, 3.0)))
    resize_height(table, 72.0)
    _, table_top = bounds(table)
    vase = place(Placement("antique_ceramic_vase_01", "1k", (-280.0, 70.0, table_top[2] + 0.1)))
    resize_height(vase, 28.0)
    candle = place(Placement("brass_candleholders", "1k", (-320.0, -385.0, 109.0), selected_variant="02"))
    for actor in candle:
        component = actor.get_component_by_class(unreal.StaticMeshComponent)
        component.set_editor_property("disallow_nanite", True)
    report = []
    for group in (chair, table, vase, candle):
        minimum, maximum = bounds(group)
        report.append({"actors": [actor.get_actor_label() for actor in group], "min_cm": minimum, "max_cm": maximum, "size_cm": [maximum[index] - minimum[index] for index in range(3)]})
    unreal.EditorAssetLibrary.save_directory("/Game/Quality")
    unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
    (ROOT / "Evidence/quality-prop-application.json").write_text(json.dumps(report, indent=2), encoding="utf8")
    unreal.log(f"QUALITY_REAL_PROPS_APPLIED: {sum(len(group) for group in (chair, table, vase, candle))} meshes")


main()
