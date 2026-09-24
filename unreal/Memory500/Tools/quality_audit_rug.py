# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
# How to run: the editor-owning session executes this file via Tools/run_unreal.py.
"""Read the live rug graph and component without changing assets or the level."""

from pathlib import Path
import json

import unreal

root = Path(unreal.Paths.project_dir())
lib = unreal.MaterialEditingLibrary
material = unreal.load_asset("/Game/Quality/Materials/M_Quality_Rug")
if not isinstance(material, unreal.Material):
    raise RuntimeError("The applied rug material must exist")
properties: dict[str, dict[str, object]] = {}
for name, prop in (
    ("base_color", unreal.MaterialProperty.MP_BASE_COLOR),
    ("roughness", unreal.MaterialProperty.MP_ROUGHNESS),
    ("specular", unreal.MaterialProperty.MP_SPECULAR),
    ("metallic", unreal.MaterialProperty.MP_METALLIC),
    ("normal", unreal.MaterialProperty.MP_NORMAL),
    ("emissive", unreal.MaterialProperty.MP_EMISSIVE_COLOR),
):
    node = lib.get_material_property_input_node(material, prop)
    result: dict[str, object] = {"connected": node is not None}
    if node:
        result["class"] = node.get_class().get_name()
        result["path"] = node.get_path_name()
        result["output"] = lib.get_material_property_input_node_output_name(material, prop)
        if isinstance(node, unreal.MaterialExpressionConstant):
            result["value"] = node.get_editor_property("r")
        if isinstance(node, unreal.MaterialExpressionTextureSample):
            texture = node.get_editor_property("texture")
            result["texture"] = texture.get_path_name() if texture else None
            result["sampler"] = str(node.get_editor_property("sampler_type"))
        if isinstance(node, unreal.MaterialExpressionLinearInterpolate):
            result["alpha"] = node.get_editor_property("const_alpha")
    properties[name] = result
components: list[dict[str, object]] = []
for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
    if "Aubusson" not in actor.get_actor_label():
        continue
    component = actor.get_component_by_class(unreal.StaticMeshComponent)
    if not component:
        continue
    center, extent = actor.get_actor_bounds(False)
    components.append({
        "actor": actor.get_actor_label(),
        "materials": [component.get_material(index).get_path_name() for index in range(component.get_num_materials())],
        "min_z_cm": center.z - extent.z,
        "max_z_cm": center.z + extent.z,
    })
report = {
    "world": unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world().get_path_name(),
    "material": material.get_path_name(),
    "tangent_space_normal": material.get_editor_property("tangent_space_normal"),
    "two_sided": material.get_editor_property("two_sided"),
    "blend_mode": str(material.get_editor_property("blend_mode")),
    "properties": properties,
    "components": components,
}
(root / "Evidence/quality-rug-live-audit.json").write_text(json.dumps(report, indent=2), encoding="utf8")
unreal.log("QUALITY_RUG_LIVE_AUDIT_COMPLETE")
