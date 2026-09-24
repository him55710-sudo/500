import unreal

settings = unreal.get_default_object(unreal.load_class(None, '/Script/UnrealEd.LevelEditorPlaySettings'))
settings.set_editor_property('NewWindowWidth', 1920)
settings.set_editor_property('NewWindowHeight', 1080)
character_class = unreal.load_class(None, '/Game/FirstPerson/Blueprints/BP_FirstPersonCharacter.BP_FirstPersonCharacter_C')
character = unreal.get_default_object(character_class)
movement = character.get_component_by_class(unreal.CharacterMovementComponent)
assert movement
movement.set_editor_property('max_walk_speed', 220.0)
camera = character.get_component_by_class(unreal.CameraComponent)
if camera:
    camera.set_editor_property('field_of_view', 97.1143316653)
blueprint = unreal.load_asset('/Game/FirstPerson/Blueprints/BP_FirstPersonCharacter')
unreal.BlueprintEditorLibrary.compile_blueprint(blueprint)
unreal.EditorAssetLibrary.save_loaded_asset(blueprint)
unreal.log('MEMORY500_WALKTHROUGH_CONFIGURED')
