import unreal

world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_name() == 'MemorySalon_VisualSlice'
subsystem = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
actors = {actor.get_actor_label(): actor for actor in subsystem.get_all_level_actors()}
light = actors.get('Salon_CabinetDisplayLight') or subsystem.spawn_actor_from_class(unreal.RectLight, unreal.Vector(-466, -90, 159))
light.set_actor_label('Salon_CabinetDisplayLight')
light.set_actor_rotation(unreal.Rotator(pitch=-60, yaw=180, roll=0), False)
component = light.get_component_by_class(unreal.RectLightComponent)
component.set_mobility(unreal.ComponentMobility.MOVABLE)
component.set_intensity_units(unreal.LightUnits.LUMENS)
component.set_intensity(130)
component.set_source_width(238)
component.set_source_height(1.5)
component.set_attenuation_radius(180)
component.set_use_temperature(True)
component.set_temperature(3200)
material_path = '/Game/Quality/Materials/M_DisplayStrip'
material = unreal.load_asset(material_path)
if not material:
    material = unreal.AssetToolsHelpers.get_asset_tools().create_asset('M_DisplayStrip', '/Game/Quality/Materials', unreal.Material, unreal.MaterialFactoryNew())
    lib = unreal.MaterialEditingLibrary
    emission = lib.create_material_expression(material, unreal.MaterialExpressionConstant3Vector)
    emission.set_editor_property('constant', unreal.LinearColor(2.4, 1.85, 1.2, 1))
    assert lib.connect_material_property(emission, '', unreal.MaterialProperty.MP_EMISSIVE_COLOR)
    material.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_UNLIT)
    lib.recompile_material(material)
    unreal.EditorAssetLibrary.save_loaded_asset(material)
strip = actors.get('Salon_CabinetDisplayStrip') or subsystem.spawn_actor_from_class(unreal.StaticMeshActor, unreal.Vector(-472, -90, 160))
strip.set_actor_label('Salon_CabinetDisplayStrip')
strip.set_actor_scale3d(unreal.Vector(0.025, 2.38, 0.004))
mesh = strip.get_component_by_class(unreal.StaticMeshComponent)
mesh.set_static_mesh(unreal.load_asset('/Engine/BasicShapes/Cube'))
mesh.set_material(0, material)
mesh.set_collision_profile_name('NoCollision')
mesh.set_cast_shadow(False)
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
