import { describe, it, expect, beforeEach } from 'vitest'
import { createPlaneFromPoints, _resetPlaneIdCounter, isOnPlane } from '../../../model/WorkingPlane'
import { createNode, createMember } from '../../../model'
import {
  worldToPlaneLocal,
  planeLocalToWorld,
  snapToPlaneGrid,
  raycastOntoPlane,
  findNearestOnPlaneNode,
} from '../../../editor3d/planeSnap'
import { parseCoordinateInput } from '../../../components/PropertiesPanel'
import { useModelStore } from '../../../store/useModelStore'
import { usePlaneStore } from '../../../store/usePlaneStore'

describe('Sprint 003: 2D Drawing Workflow', () => {
  beforeEach(() => {
    _resetPlaneIdCounter()
    // Reset model store
    useModelStore.setState({
      nodes: [],
      members: [],
      groups: [],
    })
    // Reset plane store
    usePlaneStore.setState({
      activePlane: null,
      isFocused: false,
      savedCameraState: null,
    })
  })

  describe('Node placement on plane', () => {
    it('places a node at a grid-snapped position on the XY plane', () => {
      const plane = createPlaneFromPoints([])
      const point = { x: 2.3, y: 4.7, z: 0 }
      const snapped = snapToPlaneGrid(point, plane, 1.0)

      const node = createNode({ position: snapped })
      useModelStore.getState().addNode(node)

      const stored = useModelStore.getState().nodes
      expect(stored).toHaveLength(1)
      expect(isOnPlane(stored[0].position, plane)).toBe(true)
    })

    it('places a node on a tilted plane', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 0, y: 0, z: 5 },
      ])
      // XZ plane: normal along Y
      const snapped = snapToPlaneGrid({ x: 2.3, y: 0, z: 3.7 }, plane, 1.0)

      const node = createNode({ position: snapped })
      useModelStore.getState().addNode(node)

      const stored = useModelStore.getState().nodes
      expect(stored).toHaveLength(1)
      expect(isOnPlane(stored[0].position, plane)).toBe(true)
    })
  })

  describe('Grid snap accuracy', () => {
    it('snaps to the nearest grid intersection', () => {
      const plane = createPlaneFromPoints([])
      const snapped = snapToPlaneGrid({ x: 0.6, y: 0.4, z: 0 }, plane, 1.0)
      const { u, v } = worldToPlaneLocal(snapped, plane)

      // u and v should be at integer positions
      expect(Math.abs(u - Math.round(u))).toBeLessThan(0.001)
      expect(Math.abs(v - Math.round(v))).toBeLessThan(0.001)
    })
  })

  describe('Beam creation between placed nodes', () => {
    it('creates a member connecting two placed nodes', () => {
      const plane = createPlaneFromPoints([])
      const store = useModelStore.getState()

      const n1 = createNode({ position: snapToPlaneGrid({ x: 0, y: 0, z: 0 }, plane, 1.0) })
      const n2 = createNode({ position: snapToPlaneGrid({ x: 5, y: 0, z: 0 }, plane, 1.0) })
      store.addNode(n1)
      store.addNode(n2)

      const member = createMember(n1.id, n2.id)
      useModelStore.getState().addMember(member)

      const members = useModelStore.getState().members
      expect(members).toHaveLength(1)
      expect(members[0].start_node).toBe(n1.id)
      expect(members[0].end_node).toBe(n2.id)
    })
  })

  describe('Snap to existing node', () => {
    it('finds an existing on-plane node within snap radius', () => {
      const plane = createPlaneFromPoints([])
      const n1 = createNode({ position: { x: 3, y: 5, z: 0 } })
      useModelStore.getState().addNode(n1)

      const nodes = useModelStore.getState().nodes
      const nearId = findNearestOnPlaneNode(
        { x: 3.1, y: 5.1, z: 0 },
        nodes.map((n) => ({ id: n.id, position: n.position })),
        plane,
        0.5,
      )

      expect(nearId).toBe(n1.id)
    })

    it('does not find off-plane nodes', () => {
      const plane = createPlaneFromPoints([])
      const n1 = createNode({ position: { x: 3, y: 5, z: 10 } })
      useModelStore.getState().addNode(n1)

      const nodes = useModelStore.getState().nodes
      const nearId = findNearestOnPlaneNode(
        { x: 3, y: 5, z: 0 },
        nodes.map((n) => ({ id: n.id, position: n.position })),
        plane,
        0.5,
      )

      expect(nearId).toBeNull()
    })
  })

  describe('Coordinate round-trip', () => {
    it('converts world → plane-local → world without loss', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 0, y: 5, z: 0 },
      ])
      const original = { x: 3.5, y: 2.7, z: 0 }
      const { u, v } = worldToPlaneLocal(original, plane)
      const result = planeLocalToWorld(u, v, plane)

      expect(result.x).toBeCloseTo(original.x)
      expect(result.y).toBeCloseTo(original.y)
      expect(result.z).toBeCloseTo(original.z)
    })
  })

  describe('Coordinate editing', () => {
    it('applies relative positive adjustment', () => {
      const result = parseCoordinateInput('+2.5', 5.0)
      expect(result).toBeCloseTo(7.5)
    })

    it('applies relative negative adjustment', () => {
      const result = parseCoordinateInput('-1.5', 10.0)
      expect(result).toBeCloseTo(8.5)
    })

    it('sets absolute value', () => {
      const result = parseCoordinateInput('7', 3)
      expect(result).toBe(7)
    })

    it('rejects invalid input', () => {
      expect(parseCoordinateInput('abc', 5)).toBeNull()
      expect(parseCoordinateInput('', 5)).toBeNull()
    })
  })

  describe('Raycast onto plane', () => {
    it('intersects a downward ray with an XY plane', () => {
      const plane = createPlaneFromPoints([])
      const hit = raycastOntoPlane(
        { x: 5, y: 3, z: 15 },
        { x: 0, y: 0, z: -1 },
        plane,
      )
      expect(hit).not.toBeNull()
      expect(hit!.x).toBeCloseTo(5)
      expect(hit!.y).toBeCloseTo(3)
      expect(hit!.z).toBeCloseTo(0)
    })
  })

  describe('Tilted plane workflow', () => {
    it('creates nodes on a tilted plane that all pass isOnPlane', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 },
      ])

      // Place nodes via snap
      const positions = [
        { x: 0, y: 0, z: 0 },
        { x: 2, y: 2, z: 0 },
        { x: 0, y: 0, z: 3 },
      ]

      for (const pos of positions) {
        const snapped = snapToPlaneGrid(pos, plane, 1.0)
        const node = createNode({ position: snapped })
        useModelStore.getState().addNode(node)
      }

      const storedNodes = useModelStore.getState().nodes
      expect(storedNodes).toHaveLength(3)
      for (const node of storedNodes) {
        expect(isOnPlane(node.position, plane)).toBe(true)
      }
    })
  })

  describe('Focus mode state', () => {
    it('toggleFocus sets isFocused when plane is active', () => {
      const plane = createPlaneFromPoints([])
      usePlaneStore.getState().setActivePlane(plane)
      expect(usePlaneStore.getState().isFocused).toBe(false)

      usePlaneStore.getState().toggleFocus()
      expect(usePlaneStore.getState().isFocused).toBe(true)

      usePlaneStore.getState().toggleFocus()
      expect(usePlaneStore.getState().isFocused).toBe(false)
    })

    it('clearActivePlane resets focus', () => {
      const plane = createPlaneFromPoints([])
      usePlaneStore.getState().setActivePlane(plane)
      usePlaneStore.getState().toggleFocus()
      expect(usePlaneStore.getState().isFocused).toBe(true)

      usePlaneStore.getState().clearActivePlane()
      expect(usePlaneStore.getState().isFocused).toBe(false)
      expect(usePlaneStore.getState().activePlane).toBeNull()
    })
  })
})
