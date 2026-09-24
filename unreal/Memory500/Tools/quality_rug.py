# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: in UE 5.8 after quality_materials.py, via Tools/run_unreal.py.
"""Preserve the story rug artwork while giving its surface a direct textile shader."""

import json
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
if world.get_path_name().split(".")[0] != "/Game/Maps/MemorySalon_VisualSlice":
    raise RuntimeError("The rug override requires MemorySalon_VisualSlice")
lib = unreal.MaterialEditingLibrary
source = unreal.load_asset("/Game/SourceSalon/salon-source/Materials/Aubusson_handwoven_floral_wool")
color = lib.get_material_instance_texture_parameter_value(source, "BaseColorTexture")
detail = unreal.load_asset("/Game/Quality/Textures/T_Quality_Jacquard_nor_dx")
if not color or not detail:
    raise RuntimeError("Original rug color and imported textile normal must exist")
path = "/Game/Quality/Materials/M_Quality_Rug"
material = unreal.load_asset(path)
if not material or unreal.EditorAssetLibrary.get_metadata_tag(material, "QualityComplete") != "1":
    material = material or unreal.AssetToolsHelpers.get_asset_tools().create_asset("M_Quality_Rug", "/Game/Quality/Materials", unreal.Material, unreal.MaterialFactoryNew())
    lib.delete_all_material_expressions(material)
    albedo = lib.create_material_expression(material, unreal.MaterialExpressionTextureSample, -650, -250)
    albedo.set_editor_property("texture", color)
    if not lib.connect_material_property(albedo, "RGB", unreal.MaterialProperty.MP_BASE_COLOR):
        raise RuntimeError("Cannot connect original rug color")
    for value, prop in ((0.96, unreal.MaterialProperty.MP_ROUGHNESS), (0.18, unreal.MaterialProperty.MP_SPECULAR), (0.0, unreal.MaterialProperty.MP_METALLIC)):
        constant = lib.create_material_expression(material, unreal.MaterialExpressionConstant)
        constant.set_editor_property("r", value)
        if not lib.connect_material_property(constant, "", prop):
            raise RuntimeError(f"Cannot connect textile property: {prop}")
    uv = lib.create_material_expression(material, unreal.MaterialExpressionTextureCoordinate)
    uv.set_editor_property("u_tiling", 35.0)
    uv.set_editor_property("v_tiling", 38.0)
    normal = lib.create_material_expression(material, unreal.MaterialExpressionTextureSample)
    normal.set_editor_property("texture", detail)
    normal.set_editor_property("sampler_type", unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL)
    uv_pin = next(pin for pin in lib.get_material_expression_input_names(normal) if pin in ("UVs", "Coordinates"))
    if not lib.connect_material_expressions(uv, "", normal, uv_pin):
        raise RuntimeError("Cannot connect textile detail UV")
    flat = lib.create_material_expression(material, unreal.MaterialExpressionConstant3Vector)
    flat.set_editor_property("constant", unreal.LinearColor(0.0, 0.0, 1.0, 1.0))
    blend = lib.create_material_expression(material, unreal.MaterialExpressionLinearInterpolate)
    blend.set_editor_property("const_alpha", 0.18)
    if not lib.connect_material_expressions(flat, "", blend, "A"):
        raise RuntimeError("Cannot connect flat normal")
    if not lib.connect_material_expressions(normal, "RGB", blend, "B"):
        raise RuntimeError("Cannot connect textile normal")
    if not lib.connect_material_property(blend, "", unreal.MaterialProperty.MP_NORMAL):
        raise RuntimeError("Cannot connect rug normal")
    material.set_editor_property("two_sided", True)
    lib.layout_material_expressions(material)
    lib.recompile_material(material)
    unreal.EditorAssetLibrary.set_metadata_tag(material, "QualityComplete", "1")
    unreal.EditorAssetLibrary.save_loaded_asset(material)
overrides = []
for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
    if actor.get_actor_label() == "Architecture_Aubusson_handwoven_floral_wool":
        component = actor.get_component_by_class(unreal.StaticMeshComponent)
        before = component.get_material(0)
        component.set_material(0, material)
        overrides.append({"actor": actor.get_actor_label(), "before": before.get_path_name(), "after": material.get_path_name(), "color": color.get_path_name()})
if not overrides:
    raise RuntimeError("Expected floral rug actor was not found")
unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
(root / "Evidence/quality-rug-application.json").write_text(json.dumps(overrides, indent=2), encoding="utf8")
unreal.log("QUALITY_RUG_SURFACE_APPLIED")
