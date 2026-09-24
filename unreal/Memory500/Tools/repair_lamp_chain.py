"""Repair the already imported lamp; regenerated source GLB includes this link."""
import json
from pathlib import Path

import unreal

actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_editor_world()
assert world.get_path_name().split('.')[0] == '/Game/Maps/MemorySalon_VisualSlice'
existing = {actor.get_actor_label(): actor for actor in actors.get_all_level_actors()}
lamp = existing['Quality_RealLamp'].get_component_by_class(unreal.StaticMeshComponent)
brass = next(lamp.get_material(i) for i in range(lamp.get_num_materials()) if 'Realism_Brass' in lamp.get_material(i).get_name())
actor = existing.get('Quality_LampChainLink') or actors.spawn_actor_from_class(unreal.StaticMeshActor, unreal.Vector(-372.7, -394.8, 146.475))
actor.set_actor_label('Quality_LampChainLink')
actor.set_folder_path('Quality/Realism')
actor.tags = ['QualityRealism', 'ImportedLampContactRepair']
component = actor.get_component_by_class(unreal.StaticMeshComponent)
component.set_static_mesh(unreal.load_asset('/Engine/BasicShapes/Cylinder'))
component.set_collision_enabled(unreal.CollisionEnabled.NO_COLLISION)
component.set_material(0, brass)
actor.set_actor_location(unreal.Vector(-372.7, -394.8, 146.475), False, False)
actor.set_actor_scale3d(unreal.Vector(0.0011, 0.0011, 0.0095))
center, extent = actor.get_actor_bounds(False)
assert abs(extent.z * 2 - 0.95) < 0.01
assert unreal.get_editor_subsystem(unreal.LevelEditorSubsystem).save_current_level()
Path(unreal.Paths.project_dir(), 'Evidence/quality-chain-connector.json').write_text(json.dumps({
    'actor': actor.get_actor_label(), 'center_cm': [center.x, center.y, center.z],
    'height_cm': extent.z * 2, 'radius_cm': extent.x, 'collision': False,
    'source_note': 'The regenerated authored-props.glb contains the same link. This actor repairs the pre-existing imported mesh; do not apply twice after reimport.'
}, indent=2), encoding='utf8')
