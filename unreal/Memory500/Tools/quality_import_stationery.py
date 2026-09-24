# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: the editor-owning session executes this file via Tools/run_unreal.py.

from pathlib import Path
import json

import unreal

root = Path(unreal.Paths.project_dir())
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
if world.get_path_name().split(".")[0] != "/Game/Maps/MemorySalon_VisualSlice":
    raise RuntimeError("Stationery belongs only in MemorySalon_VisualSlice")
expected = json.loads((root / "Evidence/quality-stationery-build.json").read_text(encoding="utf8"))
existing = [actor for actor in actors.get_all_level_actors() if actor.get_actor_label().startswith("Quality_Stationery_")]
if not existing:
    manager = unreal.InterchangeManager.get_interchange_manager_scripted()
    source = manager.create_source_data(str(root / "SourceAssets/Quality/Stationery/salon-stationery.glb"))
    params = unreal.ImportAssetParameters()
    params.is_automated = True
    params.replace_existing = False
    pipelines = unreal.InterchangeProjectSettingsScript.get_pipeline_stack_from_source_data(True, source)
    stack = unreal.InterchangePipelineStackOverride()
    configured = False
    for pipeline in pipelines:
        if isinstance(pipeline, unreal.InterchangeGenericAssetsPipeline):
            mesh_pipeline = pipeline.get_editor_property("mesh_pipeline")
            mesh_pipeline.set_editor_property("collision", False)
            mesh_pipeline.set_editor_property("build_nanite", False)
            configured = True
        stack.add_pipeline(pipeline)
    if not configured:
        raise RuntimeError("The scene pipeline must expose mesh collision controls")
    params.override_pipelines = stack.get_editor_property("override_pipelines")
    (root / "Evidence/quality-stationery-import-plan.json").write_text(json.dumps({"pipeline_classes": [pipeline.get_class().get_name() for pipeline in pipelines], "generate_collision": False, "build_nanite": False}, indent=2), encoding="utf8")
    if not manager.import_scene("/Game/Quality/Models/Stationery", source, params):
        raise RuntimeError("Stationery import failed")
report = []
mesh_editor = unreal.get_editor_subsystem(unreal.StaticMeshEditorSubsystem)
for actor in actors.get_all_level_actors():
    if not actor.get_actor_label().startswith("Quality_Stationery_"):
        continue
    component = actor.get_component_by_class(unreal.StaticMeshComponent)
    if not component or not component.static_mesh:
        continue
    actor.set_folder_path("Quality/Stationery")
    actor.tags = ["QualityStationery", "OriginalAuthoredAsset"]
    center, extent = actor.get_actor_bounds(False)
    collision_shapes = mesh_editor.get_simple_collision_count(component.static_mesh)
    report.append({"actor": actor.get_actor_label(), "center_cm": [center.x, center.y, center.z], "extent_cm": [extent.x, extent.y, extent.z], "simple_collision_shapes": collision_shapes})
    if collision_shapes != 0:
        raise RuntimeError(f"Unexpected collision generation: {actor.get_actor_label()}")
if len(report) != len(expected):
    raise RuntimeError(f"Expected {len(expected)} stationery meshes, found {len(report)}")
unreal.EditorAssetLibrary.save_directory("/Game/Quality/Models/Stationery")
unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
(root / "Evidence/quality-stationery-application.json").write_text(json.dumps(report, indent=2), encoding="utf8")
unreal.log(f"QUALITY_STATIONERY_APPLIED: {len(report)} meshes")
