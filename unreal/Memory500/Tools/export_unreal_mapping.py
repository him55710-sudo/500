import json
from pathlib import Path

import unreal

rows = []
for actor in unreal.get_editor_subsystem(unreal.EditorActorSubsystem).get_all_level_actors():
    component = actor.get_component_by_class(unreal.StaticMeshComponent)
    center, extent = actor.get_actor_bounds(False)
    rows.append({'label': actor.get_actor_label(), 'actor_path': actor.get_path_name(),
                 'mesh': component.static_mesh.get_path_name() if component and component.static_mesh else None,
                 'materials': [component.get_material(i).get_path_name() if component.get_material(i) else None for i in range(component.get_num_materials())] if component else [],
                 'center_cm': [center.x, center.y, center.z], 'extent_cm': [extent.x, extent.y, extent.z]})
(Path(unreal.Paths.project_dir()) / 'Evidence/quality-scene-mapping.json').write_text(json.dumps(rows, indent=2), encoding='utf8')
