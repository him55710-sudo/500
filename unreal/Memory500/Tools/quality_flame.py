# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: the editor-owning session executes this file via Tools/run_unreal.py.

from pathlib import Path
import json

import unreal

root = Path(unreal.Paths.project_dir())
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
if world.get_path_name().split(".")[0] != "/Game/Maps/MemorySalon_VisualSlice":
    raise RuntimeError("The flame correction belongs in MemorySalon_VisualSlice")
lib = unreal.MaterialEditingLibrary
assets = unreal.AssetToolsHelpers.get_asset_tools()
texture = unreal.load_asset("/Game/Quality/Textures/T_Quality_Flame")
if not texture:
    task = unreal.AssetImportTask()
    task.filename = str(root / "SourceAssets/Quality/brass_candleholders/textures/brass_candleholders_flame_diff_1k.jpg")
    task.destination_path = "/Game/Quality/Textures"
    task.destination_name = "T_Quality_Flame"
    task.automated = True
    task.save = True
    assets.import_asset_tasks([task])
    texture = unreal.load_asset("/Game/Quality/Textures/T_Quality_Flame")
if not isinstance(texture, unreal.Texture2D):
    raise RuntimeError("The original flame texture must import successfully")
texture.set_editor_property("srgb", True)
texture.set_editor_property("max_texture_size", 1024)
path = "/Game/Quality/Materials/M_Quality_CandleFlame"
material = unreal.load_asset(path) or assets.create_asset("M_Quality_CandleFlame", "/Game/Quality/Materials", unreal.Material, unreal.MaterialFactoryNew())
lib.delete_all_material_expressions(material)
material.set_editor_property("blend_mode", unreal.BlendMode.BLEND_ADDITIVE)
material.set_editor_property("shading_model", unreal.MaterialShadingModel.MSM_UNLIT)
material.set_editor_property("two_sided", True)
sample = lib.create_material_expression(material, unreal.MaterialExpressionTextureSample)
sample.set_editor_property("texture", texture)
sample.set_editor_property("sampler_type", unreal.MaterialSamplerType.SAMPLERTYPE_COLOR)
brightness = lib.create_material_expression(material, unreal.MaterialExpressionScalarParameter)
brightness.set_editor_property("parameter_name", "FlameBrightness")
brightness.set_editor_property("default_value", 20.0)
emission = lib.create_material_expression(material, unreal.MaterialExpressionMultiply)
if not lib.connect_material_expressions(sample, "RGB", emission, "A"):
    raise RuntimeError("Cannot connect flame image")
if not lib.connect_material_expressions(brightness, "", emission, "B"):
    raise RuntimeError("Cannot connect flame brightness")
if not lib.connect_material_property(emission, "", unreal.MaterialProperty.MP_EMISSIVE_COLOR):
    raise RuntimeError("Cannot connect additive flame emission")
lib.layout_material_expressions(material)
lib.recompile_material(material)
report = []
for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
    if not actor.get_actor_label().startswith("Quality_brass_candleholders_"):
        continue
    component = actor.get_component_by_class(unreal.StaticMeshComponent)
    if not component or not component.static_mesh:
        continue
    for index in range(component.get_num_materials()):
        original = component.static_mesh.get_material(index)
        if original and original.get_name() == "brass_candleholders_flame":
            component.set_material(index, material)
            report.append({"actor": actor.get_actor_label(), "slot": index, "material": material.get_path_name()})
if not report:
    raise RuntimeError("The visible candle flame slot was not found")
unreal.EditorAssetLibrary.save_loaded_asset(texture)
unreal.EditorAssetLibrary.save_loaded_asset(material)
unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
(root / "Evidence/quality-flame-application.json").write_text(json.dumps(report, indent=2), encoding="utf8")
unreal.log("QUALITY_CANDLE_FLAME_CORRECTED")
