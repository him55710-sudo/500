import unreal

actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()
volume = next(actor for actor in actors if actor.get_actor_label() == 'EvaluationExposure')
settings = volume.get_editor_property('settings')
settings.set_editor_property('auto_exposure_min_brightness', 32.0)
settings.set_editor_property('auto_exposure_max_brightness', 32.0)
volume.set_editor_property('settings', settings)
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
