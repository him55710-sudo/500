import json
import math
from pathlib import Path

import unreal

root = Path(unreal.Paths.project_dir())
editor = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
actors = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
level_path = '/Game/Maps/MemorySalon_SourceBaseline'
if unreal.EditorAssetLibrary.does_asset_exist(level_path):
    raise FileExistsError(level_path)
assert editor.new_level(level_path)
manager = unreal.InterchangeManager.get_interchange_manager_scripted()
source = manager.create_source_data(str(root / 'SourceExports/salon-source.glb'))
parameters = unreal.ImportAssetParameters()
parameters.is_automated = True
parameters.replace_existing = False
assert manager.import_scene('/Game/SourceSalon', source, parameters)
vertex_material = unreal.load_asset('/Game/Materials/M_SourceVertexPaint')
assert vertex_material
report = []
for actor in actors.get_all_level_actors():
    component = actor.get_component_by_class(unreal.StaticMeshComponent)
    if component and component.static_mesh:
        mesh = component.static_mesh
        for index in range(component.get_num_materials()):
            material = component.get_material(index)
            if material and material.get_name() in {'Handpainted', 'Hand_painted_miniature'}:
                component.set_material(index, vertex_material)
        body = mesh.get_editor_property('body_setup')
        if body:
            body.set_editor_property('collision_trace_flag', unreal.CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE)
        component.set_collision_profile_name('BlockAll')
    loc = actor.get_actor_location()
    report.append({'name': actor.get_actor_label(), 'location_cm': [loc.x, loc.y, loc.z]})
camera_specs = [
    ('CAM_A', (0, 350, 163), (-150, -350, 220)),
    ('CAM_B', (-140, -40, 163), (-330, -370, 130)),
    ('CAM_C', (-300, -40, 163), (-510, -60, 145)),
]
horizontal_fov = math.degrees(2 * math.atan(math.tan(math.radians(65 / 2)) * 16 / 9))
cameras = []
for name, position, target in camera_specs:
    delta = [target[index] - position[index] for index in range(3)]
    rotation = unreal.Rotator(pitch=math.degrees(math.atan2(delta[2], math.hypot(*delta[:2]))), yaw=math.degrees(math.atan2(delta[1], delta[0])), roll=0)
    camera = actors.spawn_actor_from_class(unreal.CameraActor, unreal.Vector(*position), rotation)
    camera.set_actor_label(name)
    camera.tags = ['FixedEvaluationCamera']
    camera.camera_component.set_field_of_view(horizontal_fov)
    camera.camera_component.set_aspect_ratio(16 / 9)
    camera.camera_component.set_constraint_aspect_ratio(True)
    cameras.append({'name': name, 'location_cm': position, 'rotation': [rotation.pitch, rotation.yaw, rotation.roll], 'horizontal_fov': horizontal_fov, 'vertical_fov': 65, 'resolution': [1920, 1080]})
unreal.EditorAssetLibrary.save_directory('/Game/SourceSalon')
assert editor.save_current_level()
(root / 'Evidence/salon-import.json').write_text(json.dumps(report, indent=2), encoding='utf8')
(root / 'Evidence/fixed-cameras.json').write_text(json.dumps(cameras, indent=2), encoding='utf8')
unreal.EditorLevelLibrary.set_level_viewport_camera_info(unreal.Vector(*camera_specs[0][1]), unreal.Rotator(pitch=cameras[0]['rotation'][0], yaw=cameras[0]['rotation'][1], roll=0))
unreal.log('MEMORY500_SALON_IMPORT_COMPLETE')
