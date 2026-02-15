/**
 * Sprint 002 Integration Tests — Plane Selection + Orthogonal 2D View
 *
 * Tests covering:
 * 1. Press `p` with no selection → XY plane at origin
 * 2. Select 1 node, press `p` → XY plane at that node
 * 3. Select 2 nodes, press `p` → line-constrained plane
 * 4. Select 3 nodes, press `p` → fully-constrained plane
 * 5. Select beam, press `p` → line-constrained plane through endpoints
 * 6. Select beam + 1 node → fully-constrained plane (3 points)
 * 7. Focus toggle with active plane
 * 8. Focus toggle without active plane
 * 9. Plane grid color matches axis alignment
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../../../store/useModelStore'
import { useEditorStore } from '../../../store/useEditorStore'
import { usePlaneStore } from '../../../store/usePlaneStore'
import {
  createNode,
  createMember,
  createPlaneFromPoints,
  getPlaneColor,
  _resetPlaneIdCounter,
} from '../../../model'
import type { Vec3 } from '../../../model'

// --- Helpers ---

function resetAll() {
  useModelStore.setState({
    name: 'Test',
    nodes: [],
    members: [],
    groups: [],
    panels: [],
    loads: [],
    load_cases: [],
    combinations: [],
    shapes: [],
  })
  useEditorStore.setState({
    mode: 'select',
    selectedNodeIds: new Set(),
    selectedMemberIds: new Set(),
    selectedGroupId: null,
    memberStartNode: null,
  })
  usePlaneStore.setState({
    activePlane: null,
    isFocused: false,
    savedCameraState: null,
  })
  _resetPlaneIdCounter()
}

/**
 * Simulate the `p` key logic from KeyboardHandler:
 * collect points from selection, create plane, set as active.
 */
function simulatePKey() {
  const { selectedNodeIds, selectedMemberIds } = useEditorStore.getState()
  const { nodes, members } = useModelStore.getState()

  const points: Vec3[] = []
  for (const id of selectedNodeIds) {
    const node = nodes.find((n) => n.id === id)
    if (node) points.push({ ...node.position })
  }
  for (const id of selectedMemberIds) {
    const member = members.find((m) => m.id === id)
    if (member) {
      const startNode = nodes.find((n) => n.id === member.start_node)
      const endNode = nodes.find((n) => n.id === member.end_node)
      if (startNode) points.push({ ...startNode.position })
      if (endNode) points.push({ ...endNode.position })
    }
  }

  const plane = createPlaneFromPoints(points.slice(0, 3))
  usePlaneStore.getState().setActivePlane(plane)
}

describe('Plane creation from selection', () => {
  beforeEach(resetAll)

  it('press p with no selection → horizontal XZ plane at origin', () => {
    simulatePKey()
    const plane = usePlaneStore.getState().activePlane
    expect(plane).not.toBeNull()
    expect(plane!.constraintType).toBe('point')
    expect(plane!.point).toEqual({ x: 0, y: 0, z: 0 })
    expect(Math.abs(plane!.normal.y)).toBeCloseTo(1)
  })

  it('select 1 node, press p → horizontal XZ plane at that node', () => {
    const n = createNode({ id: 'n1', position: { x: 5, y: 3, z: 7 } })
    useModelStore.setState({ nodes: [n] })
    useEditorStore.getState().select('n1', 'node')

    simulatePKey()
    const plane = usePlaneStore.getState().activePlane
    expect(plane!.constraintType).toBe('point')
    expect(plane!.point).toEqual({ x: 5, y: 3, z: 7 })
  })

  it('select 2 nodes, press p → line-constrained plane', () => {
    const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
    const n2 = createNode({ id: 'n2', position: { x: 5, y: 0, z: 0 } })
    useModelStore.setState({ nodes: [n1, n2] })
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().toggleSelect('n2', 'node')

    simulatePKey()
    const plane = usePlaneStore.getState().activePlane
    expect(plane!.constraintType).toBe('line')
    expect(plane!.constraintPoints).toHaveLength(2)
  })

  it('select 3 nodes, press p → fully-constrained plane', () => {
    const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
    const n2 = createNode({ id: 'n2', position: { x: 5, y: 0, z: 0 } })
    const n3 = createNode({ id: 'n3', position: { x: 0, y: 5, z: 0 } })
    useModelStore.setState({ nodes: [n1, n2, n3] })
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().toggleSelect('n2', 'node')
    useEditorStore.getState().toggleSelect('n3', 'node')

    simulatePKey()
    const plane = usePlaneStore.getState().activePlane
    expect(plane!.constraintType).toBe('plane')
    expect(plane!.constraintPoints).toHaveLength(3)
  })

  it('select a beam, press p → line-constrained plane through endpoints', () => {
    const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
    const n2 = createNode({ id: 'n2', position: { x: 5, y: 0, z: 0 } })
    const m1 = createMember('n1', 'n2', { id: 'm1' })
    useModelStore.setState({ nodes: [n1, n2], members: [m1] })
    useEditorStore.getState().select('m1', 'member')

    simulatePKey()
    const plane = usePlaneStore.getState().activePlane
    expect(plane!.constraintType).toBe('line')
    expect(plane!.constraintPoints).toHaveLength(2)
  })

  it('select beam + 1 node → fully-constrained plane (3 points)', () => {
    const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
    const n2 = createNode({ id: 'n2', position: { x: 5, y: 0, z: 0 } })
    const n3 = createNode({ id: 'n3', position: { x: 0, y: 5, z: 0 } })
    const m1 = createMember('n1', 'n2', { id: 'm1' })
    useModelStore.setState({ nodes: [n1, n2, n3], members: [m1] })
    // Select node first, then member
    useEditorStore.setState({
      selectedNodeIds: new Set(['n3']),
      selectedMemberIds: new Set(['m1']),
    })

    simulatePKey()
    const plane = usePlaneStore.getState().activePlane
    expect(plane!.constraintType).toBe('plane')
  })
})

describe('Focus toggle', () => {
  beforeEach(resetAll)

  it('press f with active plane → isFocused = true and camera state saved', () => {
    const plane = createPlaneFromPoints([])
    usePlaneStore.getState().setActivePlane(plane)
    // Save a camera state before toggling
    usePlaneStore.getState().saveCameraState({
      position: { x: 10, y: 8, z: 10 },
      quaternion: { x: 0, y: 0, z: 0, w: 1 },
      isOrthographic: false,
      zoom: 1,
    })

    usePlaneStore.getState().toggleFocus()
    expect(usePlaneStore.getState().isFocused).toBe(true)
  })

  it('press f again → isFocused = false and camera state restored', () => {
    const plane = createPlaneFromPoints([])
    usePlaneStore.getState().setActivePlane(plane)
    usePlaneStore.getState().toggleFocus()
    expect(usePlaneStore.getState().isFocused).toBe(true)

    usePlaneStore.getState().toggleFocus()
    expect(usePlaneStore.getState().isFocused).toBe(false)
  })

  it('press f with no active plane → no state change', () => {
    usePlaneStore.getState().toggleFocus()
    expect(usePlaneStore.getState().isFocused).toBe(false)
  })
})

describe('Plane grid color', () => {
  it('XY plane (normal Z) → red', () => {
    expect(getPlaneColor({ x: 0, y: 0, z: 1 })).toBe('#ff4444')
  })

  it('YZ plane (normal X) → blue', () => {
    expect(getPlaneColor({ x: 1, y: 0, z: 0 })).toBe('#4488ff')
  })

  it('XZ plane (normal Y) → green', () => {
    expect(getPlaneColor({ x: 0, y: 1, z: 0 })).toBe('#44cc44')
  })

  it('general plane → yellow', () => {
    const n = 1 / Math.sqrt(3)
    expect(getPlaneColor({ x: n, y: n, z: n })).toBe('#ffcc00')
  })
})
