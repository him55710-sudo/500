import json
from pathlib import Path

import unreal

world = unreal.get_editor_subsystem(unreal.UnrealEditorSubsystem).get_game_world()
assert world
pawn = unreal.GameplayStatics.get_player_pawn(world, 0)
controller = unreal.GameplayStatics.get_player_controller(world, 0)
movement = pawn.get_component_by_class(unreal.CharacterMovementComponent)
state = {'time': 0.0, 'handle': None, 'positions': [], 'before_rotation': str(controller.get_control_rotation()), 'walk_speed_cm_s': movement.get_editor_property('max_walk_speed')}
controller.add_yaw_input(15.0)
controller.add_pitch_input(-5.0)

def tick(delta):
    state['time'] += delta
    point = pawn.get_actor_location()
    state['positions'].append([state['time'], point.x, point.y, point.z])
    if state['time'] < 4.0:
        pawn.add_movement_input(unreal.Vector(1, 0, 0), 1, False)
    elif state['time'] >= 4.5:
        unreal.unregister_slate_post_tick_callback(state['handle'])
        samples = state['positions']
        travel = samples[-1][1] - samples[0][1]
        tail = [row[1] for row in samples if row[0] >= 3.6]
        state['after_rotation'] = str(controller.get_control_rotation())
        state['travel_cm'] = travel
        state['wall_stop_spread_cm'] = max(tail) - min(tail)
        state['stayed_in_room'] = all(abs(row[1]) < 600 and abs(row[2]) < 600 and 80 < row[3] < 120 for row in samples)
        state['collision_stop_verified'] = travel > 350 and state['wall_stop_spread_cm'] < 2 and state['stayed_in_room']
        state['look_input_changed_rotation'] = state['before_rotation'] != state['after_rotation']
        state.pop('handle')
        Path(unreal.Paths.project_dir(), 'Evidence/walkthrough-runtime-verification.json').write_text(json.dumps(state, indent=2), encoding='utf8')

state['handle'] = unreal.register_slate_post_tick_callback(tick)
