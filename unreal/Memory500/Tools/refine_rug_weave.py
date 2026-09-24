from pathlib import Path

import unreal

assert unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world().get_name() == 'MemorySalon_VisualSlice'
lib = unreal.MaterialEditingLibrary
path = '/Game/Quality/Materials/M_SalonWovenRug'
mat = unreal.load_asset(path)
if not mat:
    mat = unreal.EditorAssetLibrary.duplicate_asset('/Game/Quality/Materials/M_Quality_Rug', path)
if unreal.EditorAssetLibrary.get_metadata_tag(mat, 'WeaveComplete') != '1':
    normal = lib.get_material_property_input_node(mat, unreal.MaterialProperty.MP_NORMAL)
    normal.set_editor_property('const_alpha', 0.36)
    mat.set_editor_property('shading_model', unreal.MaterialShadingModel.MSM_DEFAULT_LIT)
    uv = lib.create_material_expression(mat, unreal.MaterialExpressionTextureCoordinate)
    uv.set_editor_property('u_tiling', 35.0)
    uv.set_editor_property('v_tiling', 38.0)
    rough = lib.create_material_expression(mat, unreal.MaterialExpressionTextureSample)
    rough.set_editor_property('texture', unreal.load_asset('/Game/Quality/Textures/T_Quality_Jacquard_Rough'))
    rough.set_editor_property('sampler_type', unreal.MaterialSamplerType.SAMPLERTYPE_MASKS)
    assert lib.connect_material_expressions(uv, '', rough, 'UVs')
    scale = lib.create_material_expression(mat, unreal.MaterialExpressionMultiply)
    scale.set_editor_property('const_b', 0.08)
    assert lib.connect_material_expressions(rough, 'R', scale, 'A')
    offset = lib.create_material_expression(mat, unreal.MaterialExpressionAdd)
    offset.set_editor_property('const_b', 0.90)
    assert lib.connect_material_expressions(scale, '', offset, 'A')
    assert lib.connect_material_property(offset, '', unreal.MaterialProperty.MP_ROUGHNESS)
    lib.recompile_material(mat)
    unreal.EditorAssetLibrary.set_metadata_tag(mat, 'WeaveComplete', '1')
    unreal.EditorAssetLibrary.save_loaded_asset(mat)
for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
    if actor.get_actor_label() == 'Architecture_Aubusson_handwoven_floral_wool':
        actor.get_component_by_class(unreal.StaticMeshComponent).set_material(0, mat)
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
