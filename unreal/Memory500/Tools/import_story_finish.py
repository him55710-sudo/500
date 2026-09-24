from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
assert unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world().get_name() == 'MemorySalon_VisualSlice'
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
if not any(actor.get_actor_label() == 'Salon_StoryFinish' for actor in actors.get_all_level_actors()):
    manager = unreal.InterchangeManager.get_interchange_manager_scripted()
    source = manager.create_source_data(str(root / 'SourceExports/story-finish.glb'))
    parameters = unreal.ImportAssetParameters()
    parameters.is_automated = True
    stack = unreal.InterchangePipelineStackOverride()
    for pipeline in unreal.InterchangeProjectSettingsScript.get_pipeline_stack_from_source_data(True, source):
        if isinstance(pipeline, unreal.InterchangeGenericAssetsPipeline):
            pipeline.mesh_pipeline.set_editor_property('collision', False)
            pipeline.mesh_pipeline.set_editor_property('build_nanite', False)
        stack.add_pipeline(pipeline)
    parameters.override_pipelines = stack.get_editor_property('override_pipelines')
    assert manager.import_scene('/Game/SalonDetails/StoryFinish', source, parameters)
unreal.EditorAssetLibrary.save_directory('/Game/SalonDetails/StoryFinish')
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
