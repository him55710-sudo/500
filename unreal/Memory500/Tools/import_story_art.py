from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_VisualSlice'
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
assert not any(actor.get_actor_label() == 'StoryPhoto_0' for actor in actors.get_all_level_actors())
manager = unreal.InterchangeManager.get_interchange_manager_scripted()
source = manager.create_source_data(str(root / 'SourceExports/story-art.glb'))
parameters = unreal.ImportAssetParameters()
parameters.is_automated = True
parameters.replace_existing = False
assert manager.import_scene('/Game/StoryArt', source, parameters)
for actor in actors.get_all_level_actors():
    if actor.get_actor_label().startswith('FrameCover'):
        actor.set_actor_hidden_in_game(True)
        actor.set_is_temporarily_hidden_in_editor(True)
        actor.tags = ['StoryPreservedHiddenForInspection']
    if actor.get_actor_label().startswith('Story'):
        actor.tags = ['OriginalWebArtwork']
        component = actor.get_component_by_class(unreal.StaticMeshComponent)
        if component:
            component.set_collision_enabled(unreal.CollisionEnabled.NO_COLLISION)
unreal.EditorAssetLibrary.save_directory('/Game/StoryArt')
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
unreal.log('MEMORY500_STORY_ART_RESTORED')
