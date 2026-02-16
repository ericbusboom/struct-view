import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../../../store/useModelStore'
import { useEditorStore } from '../../../store/useEditorStore'
import { usePlaneStore } from '../../../store/usePlaneStore'
import { createNode, createMember, createGroup, createPlaneFromPoints, isOnPlane, _resetPlaneIdCounter } from '../../../model'
import { saveToShape2D, placeShapeOnPlane } from '../../../editor2d/shapeToPlane'
import { generatePrattTruss, generateWarrenTruss } from '../../../editor2d/trussTemplates'

function resetStores() {
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
  usePlaneStore.setState({ activePlane: null, isFocused: false, savedCameraState: null })
  _resetPlaneIdCounter()
}

describe('Sprint 005: Grouping + Truss Library', () => {
  beforeEach(resetStores)

  describe('Group creation workflow', () => {
    it('creates a group from selected nodes and sets groupId on nodes/members', () => {
      const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
      const n2 = createNode({ id: 'n2', position: { x: 5, y: 0, z: 0 } })
      const n3 = createNode({ id: 'n3', position: { x: 2.5, y: 0, z: 3 } })
      const m1 = createMember('n1', 'n2', { id: 'm1' })
      const m2 = createMember('n2', 'n3', { id: 'm2' })
      const m3 = createMember('n3', 'n1', { id: 'm3' })
      useModelStore.setState({ nodes: [n1, n2, n3], members: [m1, m2, m3] })

      // Create a group
      const group = createGroup('Triangle', { nodeIds: ['n1', 'n2', 'n3'], memberIds: ['m1', 'm2', 'm3'] })
      useModelStore.getState().addGroup(group)

      // Set groupId on nodes and members
      for (const id of group.nodeIds) {
        useModelStore.getState().updateNode(id, { groupId: group.id })
      }
      for (const id of group.memberIds) {
        useModelStore.getState().updateMember(id, { groupId: group.id })
      }

      // Verify
      const state = useModelStore.getState()
      expect(state.groups).toHaveLength(1)
      expect(state.nodes.every((n) => n.groupId === group.id)).toBe(true)
      expect(state.members.every((m) => m.groupId === group.id)).toBe(true)
    })

    it('selecting a group sets selectedGroupId and clears node selection', () => {
      useEditorStore.getState().select('n1', 'node')
      expect(useEditorStore.getState().selectedNodeIds.size).toBe(1)

      useEditorStore.getState().selectGroup('g1')
      expect(useEditorStore.getState().selectedGroupId).toBe('g1')
      expect(useEditorStore.getState().selectedNodeIds.size).toBe(0)
    })

    it('removing a group clears groupId from nodes and members', () => {
      const n1 = createNode({ id: 'n1', groupId: 'g1' })
      const m1 = createMember('n1', 'n2', { id: 'm1', groupId: 'g1' })
      const group = createGroup('Test', { id: 'g1', nodeIds: ['n1'], memberIds: ['m1'] })
      useModelStore.setState({ nodes: [n1], members: [m1], groups: [group] })

      useModelStore.getState().removeGroup('g1')

      expect(useModelStore.getState().groups).toHaveLength(0)
      expect(useModelStore.getState().nodes[0].groupId).toBeUndefined()
      expect(useModelStore.getState().members[0].groupId).toBeUndefined()
    })
  })

  describe('Save to library workflow', () => {
    it('saves plane nodes as Shape2D and adds to store', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 0, y: 0, z: 3 },
      ])

      // Create nodes on the XZ plane (y=0)
      const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
      const n2 = createNode({ id: 'n2', position: { x: 5, y: 0, z: 0 } })
      const n3 = createNode({ id: 'n3', position: { x: 2.5, y: 0, z: 3 } })
      const m1 = createMember('n1', 'n2', { id: 'm1' })
      const m2 = createMember('n2', 'n3', { id: 'm2' })

      // Filter to on-plane nodes
      const allNodes = [n1, n2, n3]
      const allMembers = [m1, m2]
      const planeNodes = allNodes.filter((n) => isOnPlane(n.position, plane))
      expect(planeNodes).toHaveLength(3)

      // Save to shape
      const shape = saveToShape2D(planeNodes, allMembers, plane, 'Triangle Truss')
      expect(shape.name).toBe('Triangle Truss')
      expect(shape.nodes).toHaveLength(3)
      expect(shape.members).toHaveLength(2)

      // Verify normalization (min coords at 0,0)
      const minX = Math.min(...shape.nodes.map((n) => n.x))
      const minY = Math.min(...shape.nodes.map((n) => n.y))
      expect(minX).toBeCloseTo(0)
      expect(minY).toBeCloseTo(0)

      // Add to store
      useModelStore.getState().addShape(shape)
      expect(useModelStore.getState().shapes).toHaveLength(1)
    })

    it('off-plane nodes are excluded from save', () => {
      const plane = createPlaneFromPoints([]) // XY at z=0

      const onPlane = createNode({ id: 'n1', position: { x: 1, y: 2, z: 0 } })
      const offPlane = createNode({ id: 'n2', position: { x: 1, y: 2, z: 5 } })
      const planeNodes = [onPlane, offPlane].filter((n) => isOnPlane(n.position, plane))

      expect(planeNodes).toHaveLength(1)
      expect(planeNodes[0].id).toBe('n1')
    })
  })

  describe('Place from library workflow', () => {
    it('places a template onto a plane and creates group', () => {
      // Generate a Pratt truss template
      const pratt = generatePrattTruss(10, 2, 4)
      useModelStore.getState().addShape(pratt)

      // Set up a working plane (XZ at y=0)
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 },
        { x: 0, y: 0, z: 2 },
      ])

      // Place the shape onto the plane
      const { nodes, members } = placeShapeOnPlane(pratt, plane, { u: 0, v: 0 })

      // All placed nodes should be on the plane
      for (const node of nodes) {
        expect(isOnPlane(node.position, plane, 0.01)).toBe(true)
      }

      // Create group
      const group = createGroup(pratt.name)
      for (const node of nodes) {
        useModelStore.getState().addNode({ ...node, groupId: group.id })
      }
      for (const member of members) {
        useModelStore.getState().addMember({ ...member, groupId: group.id })
      }
      useModelStore.getState().addGroup({
        ...group,
        nodeIds: nodes.map((n) => n.id),
        memberIds: members.map((m) => m.id),
      })

      // Verify
      const state = useModelStore.getState()
      expect(state.groups).toHaveLength(1)
      expect(state.groups[0].name).toBe('Pratt Truss')
      expect(state.groups[0].nodeIds).toHaveLength(nodes.length)
      expect(state.groups[0].memberIds).toHaveLength(members.length)
      expect(state.nodes.filter((n) => n.groupId === group.id)).toHaveLength(nodes.length)
    })

    it('placed nodes have unique IDs (no collisions with existing)', () => {
      const pratt = generatePrattTruss(10, 2, 4)
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 },
        { x: 0, y: 0, z: 2 },
      ])

      // Place twice
      const first = placeShapeOnPlane(pratt, plane, { u: 0, v: 0 })
      const second = placeShapeOnPlane(pratt, plane, { u: 15, v: 0 })

      const allIds = [
        ...first.nodes.map((n) => n.id),
        ...second.nodes.map((n) => n.id),
      ]
      const uniqueIds = new Set(allIds)
      expect(uniqueIds.size).toBe(allIds.length)
    })

    it('placement offset shifts nodes correctly', () => {
      const warren = generateWarrenTruss(6, 2, 4)
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
      ])

      const offset = { u: 5, v: 3 }
      const { nodes } = placeShapeOnPlane(warren, plane, offset)

      // The minimum position should be shifted by offset
      const minX = Math.min(...nodes.map((n) => n.position.x))
      const minZ = Math.min(...nodes.map((n) => n.position.z))
      expect(minX).toBeCloseTo(5, 1)
      expect(minZ).toBeCloseTo(3, 1)
    })
  })

  describe('End-to-end: draw, save, place', () => {
    it('draws on a plane, saves to library, places on another plane as group', () => {
      // Step 1: Create a working plane and draw nodes
      const plane1 = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 0, y: 0, z: 3 },
      ])
      usePlaneStore.getState().setActivePlane(plane1)

      const n1 = createNode({ id: 'd1', position: { x: 0, y: 0, z: 0 } })
      const n2 = createNode({ id: 'd2', position: { x: 5, y: 0, z: 0 } })
      const n3 = createNode({ id: 'd3', position: { x: 2.5, y: 0, z: 3 } })
      const m1 = createMember('d1', 'd2', { id: 'dm1' })
      const m2 = createMember('d2', 'd3', { id: 'dm2' })
      const m3 = createMember('d3', 'd1', { id: 'dm3' })
      useModelStore.setState({
        ...useModelStore.getState(),
        nodes: [n1, n2, n3],
        members: [m1, m2, m3],
      })

      // Step 2: Save to library
      const planeNodes = useModelStore.getState().nodes.filter((n) => isOnPlane(n.position, plane1))
      const shape = saveToShape2D(planeNodes, useModelStore.getState().members, plane1, 'Custom Triangle')
      useModelStore.getState().addShape(shape)
      expect(useModelStore.getState().shapes).toHaveLength(1)

      // Step 3: Place on a different plane (XZ at y=5)
      const plane2 = createPlaneFromPoints([
        { x: 0, y: 5, z: 0 },
        { x: 5, y: 5, z: 0 },
        { x: 0, y: 5, z: 3 },
      ])
      usePlaneStore.getState().setActivePlane(plane2)

      const { nodes, members } = placeShapeOnPlane(shape, plane2, { u: 0, v: 0 })
      const group = createGroup('Custom Triangle')

      for (const node of nodes) {
        useModelStore.getState().addNode({ ...node, groupId: group.id })
      }
      for (const member of members) {
        useModelStore.getState().addMember({ ...member, groupId: group.id })
      }
      useModelStore.getState().addGroup({
        ...group,
        nodeIds: nodes.map((n) => n.id),
        memberIds: members.map((m) => m.id),
      })

      // Step 4: Verify
      const state = useModelStore.getState()

      // Original 3 nodes + 3 placed nodes = 6 total
      expect(state.nodes).toHaveLength(6)
      expect(state.members).toHaveLength(6)
      expect(state.groups).toHaveLength(1)

      // Placed nodes are on plane2
      const groupNodes = state.nodes.filter((n) => n.groupId === group.id)
      expect(groupNodes).toHaveLength(3)
      for (const gn of groupNodes) {
        expect(isOnPlane(gn.position, plane2, 0.01)).toBe(true)
      }

      // Placed nodes are NOT on plane1 (different y)
      for (const gn of groupNodes) {
        expect(isOnPlane(gn.position, plane1, 0.01)).toBe(false)
      }

      // Select the group
      useEditorStore.getState().selectGroup(group.id)
      expect(useEditorStore.getState().selectedGroupId).toBe(group.id)
    })
  })

  describe('Template generation to library', () => {
    it('generates all template types and adds to shapes store', () => {
      const pratt = generatePrattTruss(10, 2, 4)
      const warren = generateWarrenTruss(8, 1.5, 6)
      useModelStore.getState().addShape(pratt)
      useModelStore.getState().addShape(warren)

      const shapes = useModelStore.getState().shapes
      expect(shapes).toHaveLength(2)
      expect(shapes[0].name).toBe('Pratt Truss')
      expect(shapes[1].name).toBe('Warren Truss')
      expect(shapes[0].nodes.length).toBeGreaterThan(0)
      expect(shapes[1].nodes.length).toBeGreaterThan(0)
    })
  })
})
