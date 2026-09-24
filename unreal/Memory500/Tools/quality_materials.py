# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: execute this file in UE 5.8 via Tools/run_unreal.py.
"""Create physically scaled PBR materials and apply reversible component overrides."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Final

import unreal

ROOT: Final = Path(unreal.Paths.project_dir())
LIB: Final = unreal.MaterialEditingLibrary
ASSETS: Final = unreal.AssetToolsHelpers.get_asset_tools()
DESTINATION: Final = "/Game/Quality/Materials"


@dataclass(frozen=True, slots=True)
class Surface:
    name: str
    source: str
    tile_cm: float
    tint: tuple[float, float, float]
    normal_strength: float
    roughness_scale: float
    color_variation: float = 1.0


SURFACES: Final = (
    Surface("Walnut", "american_walnut_veneer", 100.0, (0.72, 0.52, 0.34), 0.25, 0.72),
    Surface("Plaster", "white_plaster_02", 100.0, (0.72, 0.67, 0.56), 0.28, 1.0, 0.25),
    Surface("Jacquard", "quatrefoil_jacquard_fabric", 28.2, (0.65, 0.44, 0.43), 0.45, 1.0),
)


def texture(surface: Surface, channel: str) -> unreal.Texture2D:
    """Import a map without gamma correction on physical data channels."""
    name = f"T_Quality_{surface.name}_{channel}"
    asset_path = f"/Game/Quality/Textures/{name}"
    loaded = unreal.load_asset(asset_path)
    if not loaded:
        task = unreal.AssetImportTask()
        task.filename = str(ROOT / "SourceAssets/Quality" / surface.source / f"{channel}.jpg")
        task.destination_path = "/Game/Quality/Textures"
        task.destination_name = name
        task.automated = True
        task.save = True
        ASSETS.import_asset_tasks([task])
        loaded = unreal.load_asset(asset_path)
    if not isinstance(loaded, unreal.Texture2D):
        raise RuntimeError(f"Texture import failed: {asset_path}")
    loaded.set_editor_property("srgb", channel == "Diffuse")
    loaded.set_editor_property("max_texture_size", 2048)
    if channel == "nor_dx":
        loaded.set_editor_property("compression_settings", unreal.TextureCompressionSettings.TC_NORMALMAP)
        loaded.set_editor_property("flip_green_channel", False)
    if channel == "Rough":
        loaded.set_editor_property("compression_settings", unreal.TextureCompressionSettings.TC_MASKS)
    unreal.EditorAssetLibrary.save_loaded_asset(loaded)
    return loaded


def link(source: unreal.MaterialExpression, target: unreal.MaterialExpression, pin: str) -> None:
    """Connect the first output, failing loudly if the engine rejects the pin."""
    if not LIB.connect_material_expressions(source, "", target, pin):
        raise RuntimeError(f"Cannot connect {source.get_name()} to {target.get_name()}.{pin}")


def material(surface: Surface) -> unreal.Material:
    """Build a tunable, world aligned material once; source UVs remain untouched."""
    name = f"M_Quality_{surface.name}"
    existing = unreal.load_asset(f"{DESTINATION}/{name}")
    if isinstance(existing, unreal.Material) and unreal.EditorAssetLibrary.get_metadata_tag(existing, "QualityComplete") == "3":
        return existing
    result = existing or ASSETS.create_asset(name, DESTINATION, unreal.Material, unreal.MaterialFactoryNew())
    if not isinstance(result, unreal.Material):
        raise RuntimeError(f"Could not create {name}")
    LIB.delete_all_material_expressions(result)
    result.set_editor_property("tangent_space_normal", False)
    result.set_editor_property("two_sided", surface.name == "Jacquard")
    result.set_editor_property("used_with_nanite", True)
    size = LIB.create_material_expression(result, unreal.MaterialExpressionVectorParameter, -1000, -200)
    size.set_editor_property("parameter_name", "TileSizeCm")
    size.set_editor_property("default_value", unreal.LinearColor(*([surface.tile_cm] * 3), 1.0))
    projected = {}
    for index, channel in enumerate(("Diffuse", "nor_dx", "Rough")):
        tex = LIB.create_material_expression(result, unreal.MaterialExpressionTextureObject, -1000, index * 240)
        tex.set_editor_property("texture", texture(surface, channel))
        sampler = unreal.MaterialSamplerType.SAMPLERTYPE_COLOR
        if channel == "nor_dx":
            sampler = unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL
        if channel == "Rough":
            sampler = unreal.MaterialSamplerType.SAMPLERTYPE_MASKS
        tex.set_editor_property("sampler_type", sampler)
        function_name = "WorldAlignedNormal" if channel == "nor_dx" else "WorldAlignedTexture"
        function = unreal.load_asset(f"/Engine/Functions/Engine_MaterialFunctions01/Texturing/{function_name}")
        call = LIB.create_material_expression(result, unreal.MaterialExpressionMaterialFunctionCall, -680, index * 240)
        if not call.set_material_function(function):
            raise RuntimeError(f"Cannot load {function_name}")
        inputs = list(LIB.get_material_expression_input_names(call))
        outputs = list(LIB.get_material_expression_output_names(call))
        texture_pin = next(pin for pin in inputs if pin.replace(" ", "").startswith("TextureObject"))
        size_pin = next(pin for pin in inputs if pin.replace(" ", "").startswith("TextureSize"))
        output_pin = next(pin for pin in outputs if "XYZ" in pin)
        link(tex, call, texture_pin)
        link(size, call, size_pin)
        passthrough = LIB.create_material_expression(result, unreal.MaterialExpressionMultiply, -400, index * 240)
        if not LIB.connect_material_expressions(call, output_pin, passthrough, "A"):
            raise RuntimeError(f"Cannot connect projection: {output_pin}")
        passthrough.set_editor_property("const_b", 1.0)
        projected[channel] = passthrough
    tint = LIB.create_material_expression(result, unreal.MaterialExpressionVectorParameter, -400, -220)
    tint.set_editor_property("parameter_name", "Tint")
    tint.set_editor_property("default_value", unreal.LinearColor(*surface.tint, 1.0))
    link(tint, projected["Diffuse"], "B")
    variation = LIB.create_material_expression(result, unreal.MaterialExpressionScalarParameter, -400, -380)
    variation.set_editor_property("parameter_name", "ColorVariation")
    variation.set_editor_property("default_value", surface.color_variation)
    albedo = LIB.create_material_expression(result, unreal.MaterialExpressionLinearInterpolate, -100, -220)
    link(tint, albedo, "A")
    link(projected["Diffuse"], albedo, "B")
    link(variation, albedo, "Alpha")
    projected["Diffuse"] = albedo
    roughness = LIB.create_material_expression(result, unreal.MaterialExpressionScalarParameter, -620, 820)
    roughness.set_editor_property("parameter_name", "RoughnessScale")
    roughness.set_editor_property("default_value", surface.roughness_scale)
    link(roughness, projected["Rough"], "B")
    for channel, prop in (("Diffuse", unreal.MaterialProperty.MP_BASE_COLOR), ("Rough", unreal.MaterialProperty.MP_ROUGHNESS)):
        if not LIB.connect_material_property(projected[channel], "", prop):
            raise RuntimeError(f"Cannot connect {channel} material property")
    normal = LIB.create_material_expression(result, unreal.MaterialExpressionLinearInterpolate, -80, 260)
    vertex = LIB.create_material_expression(result, unreal.MaterialExpressionVertexNormalWS, -400, 740)
    strength = LIB.create_material_expression(result, unreal.MaterialExpressionScalarParameter, -400, 900)
    strength.set_editor_property("parameter_name", "NormalStrength")
    strength.set_editor_property("default_value", surface.normal_strength)
    link(vertex, normal, "A")
    link(projected["nor_dx"], normal, "B")
    link(strength, normal, "Alpha")
    normalized = LIB.create_material_expression(result, unreal.MaterialExpressionNormalize, 100, 260)
    link(normal, normalized, list(LIB.get_material_expression_input_names(normalized))[0])
    if not LIB.connect_material_property(normalized, "", unreal.MaterialProperty.MP_NORMAL):
        raise RuntimeError("Cannot connect world normal")
    LIB.layout_material_expressions(result)
    LIB.recompile_material(result)
    unreal.EditorAssetLibrary.set_metadata_tag(result, "QualityComplete", "3")
    unreal.EditorAssetLibrary.save_loaded_asset(result)
    return result


def main() -> None:
    """Apply only to the dedicated quality level, never to source or puzzle IDs."""
    world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
    if world.get_path_name().split(".")[0] != "/Game/Maps/MemorySalon_VisualSlice":
        raise RuntimeError(f"Open MemorySalon_VisualSlice before applying materials: {world.get_path_name()}")
    materials = {surface.name: material(surface) for surface in SURFACES}
    replacements = {
        "Petrol_painted_plaster": materials["Plaster"],
        "Dark_walnut": materials["Walnut"],
        "Walnut___fine_satin": materials["Walnut"],
        "Raspberry_silk_velvet": materials["Jacquard"],
    }
    replacements.update({f"Walnut_plank_{index}": materials["Walnut"] for index in range(6)})
    report = []
    actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors()
    for actor in actors:
        label = actor.get_actor_label()
        if label.startswith(("Tile", "Quality_")):
            continue
        component = actor.get_component_by_class(unreal.StaticMeshComponent)
        if not component or not component.static_mesh:
            continue
        for index in range(component.get_num_materials()):
            source = component.static_mesh.get_material(index)
            target = replacements.get(source.get_name()) if source else None
            if target:
                before = component.get_material(index)
                if isinstance(before, unreal.MaterialInstanceConstant) and before.get_editor_property("parent") == target:
                    continue
                component.set_material(index, target)
                report.append({"actor": label, "slot": index, "before": before.get_path_name() if before else None, "after": target.get_path_name()})
    unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
    (ROOT / "Evidence/quality-material-application.json").write_text(json.dumps(report, indent=2), encoding="utf8")
    unreal.log(f"QUALITY_MATERIALS_APPLIED: {len(report)} slots")


main()
