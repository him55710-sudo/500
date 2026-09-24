from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_VisualSlice'
subsystem = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
if not any(actor.get_actor_label() == 'Salon_ReadingBook_0' for actor in subsystem.get_all_level_actors()):
    manager = unreal.InterchangeManager.get_interchange_manager_scripted()
    source = manager.create_source_data(str(root / 'SourceExports/reading-books.glb'))
    params = unreal.ImportAssetParameters()
    params.is_automated = True
    pipelines = unreal.InterchangeProjectSettingsScript.get_pipeline_stack_from_source_data(True, source)
    stack = unreal.InterchangePipelineStackOverride()
    for pipeline in pipelines:
        if isinstance(pipeline, unreal.InterchangeGenericAssetsPipeline):
            pipeline.mesh_pipeline.set_editor_property('collision', False)
            pipeline.mesh_pipeline.set_editor_property('build_nanite', False)
        stack.add_pipeline(pipeline)
    params.override_pipelines = stack.get_editor_property('override_pipelines')
    assert manager.import_scene('/Game/SalonDetails/ReadingBooks', source, params)
unreal.EditorAssetLibrary.save_directory('/Game/SalonDetails/ReadingBooks')
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
