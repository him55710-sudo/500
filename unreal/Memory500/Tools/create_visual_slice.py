import unreal

source = '/Game/Maps/MemorySalon_SourceBaseline'
destination = '/Game/Maps/MemorySalon_VisualSlice'
assert not unreal.EditorAssetLibrary.does_asset_exist(destination), destination
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_SourceBaseline'
assert unreal.EditorLoadingAndSavingUtils.save_map(world, destination)
unreal.log('MEMORY500_VISUAL_SLICE_CREATED')
