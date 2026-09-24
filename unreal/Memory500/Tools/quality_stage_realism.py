# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: the editor owner executes this through Tools/run_unreal.py, then waits before quality_apply_realism.py.
from __future__ import annotations

import json
import struct
from pathlib import Path
from typing import Final

import unreal

ROOT: Final = Path(unreal.Paths.project_dir())
ACTORS: Final = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
if world.get_path_name().split(".")[0] != "/Game/Maps/MemorySalon_VisualSlice":
    raise RuntimeError("Open the isolated visual slice before staging realism assets")
manager = unreal.InterchangeManager.get_interchange_manager_scripted()
reports = []
for filename, destination in (("trimmed-architecture-v2.glb", "TrimmedV2"), ("authored-props.glb", "Authored"), ("real-plants-books.glb", "Scans")):
    path = ROOT / "SourceAssets/Quality/Realism" / filename
    data = path.read_bytes()
    length = struct.unpack_from("<I", data, 12)[0]
    document = json.loads(data[20:20 + length])
    expected = {node["name"] for node in document["nodes"] if "mesh" in node}
    existing = {actor.get_actor_label(): actor for actor in ACTORS.get_all_level_actors()}
    present = expected.intersection(existing)
    if present and present != expected:
        raise RuntimeError(f"Partial import must be reviewed before retry: {filename}, {sorted(present)}")
    if not present:
        source = manager.create_source_data(str(path))
        params = unreal.ImportAssetParameters()
        params.is_automated = True
        params.replace_existing = False
        pipelines = unreal.InterchangeProjectSettingsScript.get_pipeline_stack_from_source_data(True, source)
        stack = unreal.InterchangePipelineStackOverride()
        configured = False
        for pipeline in pipelines:
            if pipeline.get_class().get_name() == "InterchangeGenericAssetsPipeline":
                mesh_pipeline = pipeline.get_editor_property("mesh_pipeline")
                mesh_pipeline.set_editor_property("collision", False)
                mesh_pipeline.set_editor_property("build_nanite", False)
                configured = True
            stack.add_pipeline(pipeline)
        if not configured:
            raise RuntimeError("The complete Interchange stack must expose collision generation")
        params.override_pipelines = stack.get_editor_property("override_pipelines")
        if not manager.import_scene(f"/Game/Quality/Models/Realism/{destination}", source, params):
            raise RuntimeError(f"Realism import failed: {filename}")
    current = {actor.get_actor_label(): actor for actor in ACTORS.get_all_level_actors()}
    if not expected.issubset(current):
        raise RuntimeError(f"Missing imported actors: {sorted(expected.difference(current))}")
    for name in sorted(expected):
        actor = current[name]
        actor.set_folder_path("Quality/Realism")
        actor.tags = ["QualityRealism"]
    reports.append({"file": filename, "actors": sorted(expected), "collision_generation": False, "nanite": False})
unreal.EditorAssetLibrary.save_directory("/Game/Quality/Models/Realism")
unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
(ROOT / "Evidence/quality-realism-stage.json").write_text(json.dumps(reports, indent=2), encoding="utf8")
unreal.log("QUALITY_REALISM_STAGED: let the editor settle, then run quality_apply_realism.py")
