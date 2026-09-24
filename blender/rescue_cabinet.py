"""Glass trophy bookcase, shared by the full scene builder and the focused updater."""
import bpy

def build_glass_cabinet(scene, cabinet, door):
    # Keep the original hinge and all trophies / medicine / gameplay object names.
    for root in (cabinet, door):
        for child in list(root.children_recursive):
            bpy.data.objects.remove(child, do_unlink=True)

    def material(name, color, metal=0, roughness=.35, alpha=1, emission=0):
        m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
        m.use_nodes = True
        n = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        n.inputs['Base Color'].default_value = (*color, 1)
        n.inputs['Metallic'].default_value = metal
        n.inputs['Roughness'].default_value = roughness
        n.inputs['Alpha'].default_value = alpha
        if alpha < 1:
            m.surface_render_method = 'DITHERED'
            n.inputs['Coat Weight'].default_value = .35
            n.inputs['Coat Roughness'].default_value = .13
        if emission:
            n.inputs['Emission Color'].default_value = (*color, 1)
            n.inputs['Emission Strength'].default_value = emission
        return m

    glass = material('Cabinet clear glass', (.72, .93, .91), .08, .14, .10)
    edge = material('Cabinet polished glass edges', (.40, .72, .66), .2, .2, .42)
    brass = material('Cabinet champagne frame', (.66, .47, .22), .78, .25)
    base = material('Cabinet ivory plinth', (.82, .80, .73), .05, .35)
    led = material('Cabinet warm shelf light', (1, .88, .64), 0, .3, emission=1.2)

    def box(name, center, size, mat, parent=cabinet, bevel=0):
        # Author in the game's x/up-y/z coordinates, convert to Blender z-up.
        x, y, z = center
        a, b, c = (v / 2 for v in size)
        vertices = [(x+i*a, -(z+k*c), y+j*b) for i,j,k in
                    [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),
                     (-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
        faces = [(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)]
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(vertices, [], faces)
        mesh.materials.append(mat)
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        scene.collection.objects.link(obj)
        obj.parent = parent
        if bevel:
            modifier = obj.modifiers.new('Rounded polished edges', 'BEVEL')
            modifier.width = bevel
            modifier.segments = 3
        return obj

    for y, height in [(.12,.18),(2.72,.07)]:
        box('Cabinet_Plinth_'+str(y), (-2.9,y,-4.34), (2.94,height,.91), base, bevel=.02)
        box('Cabinet_BrassRim_'+str(y), (-2.9,y+height/2,-4.34), (2.96,.018,.93), brass, bevel=.005)
    for x in [-4.3,-1.5]:
        for z in [-4.74,-3.91]:
            box('Cabinet_Corner', (x,1.44,z), (.042,2.55,.042), brass, bevel=.008)
        box('Cabinet_GlassSide', (x,1.44,-4.325), (.012,2.49,.79), glass)
    box('Cabinet_GlassBack', (-2.9,1.44,-4.74), (2.76,2.49,.012), glass)
    for y in [.94,1.74]:
        box('Cabinet_GlassShelf', (-2.9,y,-4.33), (2.76,.018,.80), glass)
        box('Cabinet_ShelfEdge', (-2.9,y,-3.927), (2.74,.015,.01), edge)
        box('Cabinet_ShelfLight', (-2.9,y+.022,-4.70), (2.64,.018,.022), led)
        for x in [-4.25,-1.55]:
            for z in [-4.66,-4.00]:
                box('Cabinet_ShelfBracket', (x,y-.025,z), (.10,.032,.055), brass, bevel=.005)

    # Door coordinates stay local to the existing left hinge (-4.3, 0, -3.88).
    box('CabinetDoor_GlassPane', (1.38,1.44,0), (2.68,2.44,.014), glass, door)
    for x in [.035,2.725]:
        box('CabinetDoor_Frame', (x,1.44,0), (.038,2.51,.036), brass, door, .006)
        box('CabinetDoor_GlassEdge', (x+.022,1.44,.009), (.009,2.44,.010), edge, door)
    for y in [.185,2.695]:
        box('CabinetDoor_Frame', (1.38,y,0), (2.73,.04,.036), brass, door, .006)
    for y in [.40,2.43]:
        box('CabinetDoor_Hinge', (.016,y,-.022), (.09,.15,.08), brass, door, .012)
    for y in [1.24,1.60]:
        box('CabinetDoor_HandleMount', (2.52,y,.07), (.055,.045,.13), brass, door, .01)
    box('CabinetDoor_Handle', (2.52,1.42,.14), (.036,.41,.04), brass, door, .012)
    return cabinet, door
