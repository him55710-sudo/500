import unreal

unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).editor_set_viewport_realtime(True)
unreal.log('MEMORY500_REALTIME_VIEWPORT_ENABLED')
