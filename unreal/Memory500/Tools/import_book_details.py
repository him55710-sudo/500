from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_VisualSlice'
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
if not any(actor.get_actor_label() == 'Salon_BookSpineFoil' for actor in actors.get_all_level_actors()):
    manager = unreal.InterchangeManager.get_interchange_manager_scripted()
    parameters = unreal.ImportAssetParameters()
    parameters.is_automated = True
    parameters.replace_existing = False
    source = manager.create_source_data(str(root / 'SourceExports/book-details.glb'))
    pipelines = unreal.InterchangeProjectSettingsScript.get_pipeline_stack_from_source_data(True, source)
    stack = unreal.InterchangePipelineStackOverride()
    for pipeline in pipelines:
        if isinstance(pipeline, unreal.InterchangeGenericAssetsPipeline):
            pipeline.get_editor_property('mesh_pipeline').set_editor_property('collision', False)
        stack.add_pipeline(pipeline)
    parameters.override_pipelines = stack.get_editor_property('override_pipelines')
    assert manager.import_scene('/Game/SalonDetails', source, parameters)
unreal.EditorAssetLibrary.save_directory('/Game/SalonDetails')
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
