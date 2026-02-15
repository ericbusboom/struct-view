/**
 * Sprint 007 Integration Tests
 *
 * End-to-end workflow tests covering:
 * 1. Full placement workflow: draw shape → save → place → verify in model
 * 2. 3D snap engine integration with placement and move
 * 3. Multi-shape management: create, save, load, edit, save-as
 * 4. Equal spacing placement with trussId stamping
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../../../store/useModelStore'
import { useEditor2DStore } from '../../../store/useEditor2DStore'
import { usePlacementStore } from '../../../store/usePlacementStore'
import { useEditorStore } from '../../../store/useEditorStore'
import { commitPlacement } from '../../../editor3d/commitPlacement'
import { snapPoint3D } from '../../../editor3d/snap3d'
import { createNode, createMember } from '../../../model'

beforeEach(() => {
  useModelStore.setState({
    nodes: [],
    members: [],
    shapes: [],
    panels: [],
    loads: [],
    load_cases: [],
    combinations: [],
    name: 'Test Project',
  })
  useEditor2DStore.getState().resetShape()
  usePlacementStore.getState().cancel()
  useEditorStore.getState().setMode('select')
})

describe('Workflow 1: Draw shape → save → place into 3D', () => {
  it('full end-to-end placement workflow', () => {
    // Step 1: Draw a triangle in 2D editor
    const n1 = useEditor2DStore.getState().addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(10, 0)
    const n3 = useEditor2DStore.getState().addNode(5, 5)
    useEditor2DStore.getState().addMember(n1, n2)
    useEditor2DStore.getState().addMember(n2, n3)
    useEditor2DStore.getState().addMember(n1, n3)

    // Mark snap edge
    const snapMemberId = useEditor2DStore.getState().shape.members[0].id
    useEditor2DStore.getState().toggleSnapEdge(snapMemberId)
    expect(useEditor2DStore.getState().isDirty).toBe(true)

    // Step 2: Save to library
    const editorShape = useEditor2DStore.getState().shape
    useModelStore.getState().addShape(JSON.parse(JSON.stringify(editorShape)))
    useEditor2DStore.setState({
      editingShapeId: editorShape.id,
      isDirty: false,
    })

    const savedShapes = useModelStore.getState().shapes
    expect(savedShapes).toHaveLength(1)

    // Step 3: Place into 3D
    usePlacementStore.getState().startPlacement(savedShapes[0])
    expect(usePlacementStore.getState().phase).toBe('picking-edge')

    // Define target edge
    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })
    expect(usePlacementStore.getState().phase).toBe('previewing')

    // Step 4: Commit
    commitPlacement()
    expect(usePlacementStore.getState().phase).toBe('idle')

    // Step 5: Verify model
    const { nodes, members } = useModelStore.getState()
    expect(nodes).toHaveLength(3)
    expect(members).toHaveLength(3)
    // Nodes should be at 3D positions
    const positions = nodes.map((n) => n.position)
    expect(positions.some((p) => Math.abs(p.x) < 0.01 && Math.abs(p.y) < 0.01 && Math.abs(p.z) < 0.01)).toBe(true)
  })

  it('second placement does not merge coincident nodes', () => {
    // Create and save a simple two-node shape
    const n1 = useEditor2DStore.getState().addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(5, 0)
    useEditor2DStore.getState().addMember(n1, n2)
    const shape = JSON.parse(JSON.stringify(useEditor2DStore.getState().shape))
    useModelStore.getState().addShape(shape)

    // First placement
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 5, y: 0, z: 0 },
    })
    commitPlacement()
    expect(useModelStore.getState().nodes).toHaveLength(2)

    // Second placement sharing an endpoint
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setTargetEdge({
      start: { x: 5, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })
    commitPlacement()

    // No merge: 2 existing + 2 placed = 4 nodes (coincident at (5,0,0))
    expect(useModelStore.getState().nodes).toHaveLength(4)
    expect(useModelStore.getState().members).toHaveLength(2)
  })
})

describe('Workflow 2: 3D snap integration', () => {
  it('snap engine snaps to existing model nodes', () => {
    const n = createNode({ position: { x: 5, y: 0, z: 0 } })
    useModelStore.setState({ nodes: [n] })

    const result = snapPoint3D(
      { x: 5.1, y: 0, z: 0 },
      useModelStore.getState().nodes,
      useModelStore.getState().members,
      { snapRadius: 0.5, gridSize: 1.0 },
    )

    expect(result.type).toBe('node')
    expect(result.point.x).toBeCloseTo(5)
  })

  it('snap engine snaps to member midpoints', () => {
    const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
    const n2 = createNode({ id: 'n2', position: { x: 10, y: 0, z: 0 } })
    const m = createMember('n1', 'n2', { id: 'm1' })
    useModelStore.setState({ nodes: [n1, n2], members: [m] })

    const result = snapPoint3D(
      { x: 5.1, y: 0.1, z: 0 },
      useModelStore.getState().nodes,
      useModelStore.getState().members,
      { snapRadius: 0.5, gridSize: 1.0 },
    )

    expect(result.type).toBe('midpoint')
    expect(result.point.x).toBeCloseTo(5)
  })

  it('drag node state management works', () => {
    useEditorStore.getState().setMode('move')
    expect(useEditorStore.getState().mode).toBe('move')

    useEditorStore.getState().setDragNodeId('test-node')
    expect(useEditorStore.getState().dragNodeId).toBe('test-node')

    // Switching mode clears drag
    useEditorStore.getState().setMode('select')
    expect(useEditorStore.getState().dragNodeId).toBeNull()
  })
})

describe('Workflow 3: Multi-shape management', () => {
  it('create, save, switch, and load shapes', () => {
    // Create first shape
    useEditor2DStore.getState().addNode(0, 0)
    useEditor2DStore.getState().addNode(10, 0)
    expect(useEditor2DStore.getState().isDirty).toBe(true)

    // Save as "Shape A"
    const shapeA = JSON.parse(JSON.stringify(useEditor2DStore.getState().shape))
    shapeA.name = 'Shape A'
    useModelStore.getState().addShape(shapeA)
    useEditor2DStore.setState({ editingShapeId: shapeA.id, isDirty: false })

    // Create new shape
    useEditor2DStore.getState().resetShape()
    expect(useEditor2DStore.getState().editingShapeId).toBeNull()
    expect(useEditor2DStore.getState().isDirty).toBe(false)

    // Draw second shape
    useEditor2DStore.getState().addNode(0, 0)
    useEditor2DStore.getState().addNode(5, 5)

    // Save as "Shape B"
    const shapeB = JSON.parse(JSON.stringify(useEditor2DStore.getState().shape))
    shapeB.name = 'Shape B'
    useModelStore.getState().addShape(shapeB)
    useEditor2DStore.setState({ editingShapeId: shapeB.id, isDirty: false })

    expect(useModelStore.getState().shapes).toHaveLength(2)

    // Load Shape A back
    const storedA = useModelStore.getState().shapes.find((s) => s.name === 'Shape A')!
    useEditor2DStore.getState().loadShape(JSON.parse(JSON.stringify(storedA)), storedA.id)
    expect(useEditor2DStore.getState().editingShapeId).toBe(storedA.id)
    expect(useEditor2DStore.getState().shape.nodes).toHaveLength(2)

    // Edit and save back
    useEditor2DStore.getState().addNode(5, 5)
    expect(useEditor2DStore.getState().isDirty).toBe(true)
    useModelStore.getState().updateShape(storedA.id, JSON.parse(JSON.stringify(useEditor2DStore.getState().shape)))
    useEditor2DStore.getState().markClean()
    expect(useEditor2DStore.getState().isDirty).toBe(false)

    // Verify update persisted
    const updatedA = useModelStore.getState().shapes.find((s) => s.name === 'Shape A')!
    expect(updatedA.nodes).toHaveLength(3)
  })
})

describe('Workflow 4: Equal spacing placement', () => {
  it('places 3 copies with separate trussIds', () => {
    // Create a simple beam shape (2 nodes, 1 member)
    const n1 = useEditor2DStore.getState().addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(5, 0)
    useEditor2DStore.getState().addMember(n1, n2)
    const shape = JSON.parse(JSON.stringify(useEditor2DStore.getState().shape))
    useModelStore.getState().addShape(shape)

    // Place 3 copies
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 30, y: 0, z: 0 },
    })
    usePlacementStore.getState().setCount(3)
    expect(usePlacementStore.getState().count).toBe(3)

    commitPlacement()

    const { nodes, members } = useModelStore.getState()
    // 3 copies × 2 nodes = 6 nodes, 3 copies × 1 member = 3 members (no merge)
    expect(nodes).toHaveLength(6)
    expect(members).toHaveLength(3)
    expect(usePlacementStore.getState().phase).toBe('idle')

    // Each copy should have a distinct trussId
    const trussIds = new Set(nodes.map((n) => n.trussId).filter(Boolean))
    expect(trussIds.size).toBe(3)
  })
})

describe('Workflow 5: Placement with offset', () => {
  it('offset slides the shape along the target edge', () => {
    // Create a point shape (1 node at origin)
    useEditor2DStore.getState().addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(1, 0)
    useEditor2DStore.getState().addMember(
      useEditor2DStore.getState().shape.nodes[0].id,
      n2,
    )
    const shape = JSON.parse(JSON.stringify(useEditor2DStore.getState().shape))
    useModelStore.getState().addShape(shape)

    // Place with offset = 0
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })
    usePlacementStore.getState().setOffset(0)
    commitPlacement()

    const nodesAt0 = useModelStore.getState().nodes
    const minX0 = Math.min(...nodesAt0.map((n) => n.position.x))

    // Clear and place with offset = 0.5
    useModelStore.setState({ nodes: [], members: [] })
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })
    usePlacementStore.getState().setOffset(0.5)
    commitPlacement()

    const nodesAtHalf = useModelStore.getState().nodes
    const minXHalf = Math.min(...nodesAtHalf.map((n) => n.position.x))

    // The offset=0.5 placement should be shifted along the edge
    expect(minXHalf).toBeGreaterThan(minX0)
  })
})
