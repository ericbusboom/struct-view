import { describe, it, expect, beforeEach } from 'vitest'
import {
  createPlaneFromPoints,
  _resetPlaneIdCounter,
  isOnPlane,
  NEAR_PLANE_THRESHOLD,
} from '../../../model/WorkingPlane'
import { createNode, createMember } from '../../../model'
import type { Vec3 } from '../../../model'
import {
  rotatePlane,
  getRotationAxes,
  snapPlaneAngle,
  alignPlaneToAxis,
  computeRotationSpeed,
  TAP_ANGLE,
  AXIS_NORMALS,
} from '../../../editor3d/planeRotation'
import { findNearestOnPlaneNode, snapToPlaneGrid } from '../../../editor3d/planeSnap'
import { useModelStore } from '../../../store/useModelStore'
import { usePlaneStore } from '../../../store/usePlaneStore'

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

function vecLength(v: Vec3): number {
  return Math.sqrt(dot(v, v))
}

function angleBetweenDeg(a: Vec3, b: Vec3): number {
  const d = dot(a, b)
  return Math.acos(Math.min(1, Math.max(-1, d))) * (180 / Math.PI)
}

describe('Sprint 004: Plane Rotation + Cross-Plane Nodes', () => {
  beforeEach(() => {
    _resetPlaneIdCounter()
    useModelStore.setState({ nodes: [], members: [], groups: [] })
    usePlaneStore.setState({ activePlane: null, isFocused: false, savedCameraState: null })
  })

  describe('Plane rotation workflow', () => {
    it('rotates a plane by a tap angle and verifies angle changed', () => {
      const plane = createPlaneFromPoints([])
      const rotated = rotatePlane(plane, plane.tangentU, TAP_ANGLE)

      const angle = angleBetweenDeg(plane.normal, rotated.normal)
      expect(angle).toBeCloseTo(TAP_ANGLE, 1)
    })

    it('simulates hold rotation with increasing speed', () => {
      let plane = createPlaneFromPoints([])
      const axis = plane.tangentU
      const dt = 1 / 60 // 60fps frame

      // Simulate 1 second of holding (60 frames)
      for (let i = 0; i < 60; i++) {
        const holdDuration = i * dt
        const speed = computeRotationSpeed(holdDuration)
        const angle = speed * dt
        plane = rotatePlane(plane, axis, angle)
      }

      // After 1 second the plane should have rotated significantly
      const totalAngle = angleBetweenDeg(
        createPlaneFromPoints([]).normal,
        plane.normal,
      )
      expect(totalAngle).toBeGreaterThan(3) // at least a few degrees
      expect(totalAngle).toBeLessThan(90) // not a full quarter turn in 1 sec
    })

    it('preserves orthonormality after many incremental rotations', () => {
      let plane = createPlaneFromPoints([])
      const axis = { x: 0.577, y: 0.577, z: 0.577 } // diagonal

      for (let i = 0; i < 720; i++) {
        plane = rotatePlane(plane, axis, 0.5) // 360 degrees total
      }

      expect(vecLength(plane.normal)).toBeCloseTo(1, 4)
      expect(vecLength(plane.tangentU)).toBeCloseTo(1, 4)
      expect(vecLength(plane.tangentV)).toBeCloseTo(1, 4)
      expect(dot(plane.normal, plane.tangentU)).toBeCloseTo(0, 3)
      expect(dot(plane.normal, plane.tangentV)).toBeCloseTo(0, 3)
      expect(dot(plane.tangentU, plane.tangentV)).toBeCloseTo(0, 3)
    })
  })

  describe('15-degree snap', () => {
    it('snaps plane to 15° when within threshold', () => {
      const plane = createPlaneFromPoints([])
      const axis = plane.tangentU

      // Rotate 14.7° (0.3° from 15° snap)
      const rotated = rotatePlane(plane, axis, 14.7)
      const snapped = snapPlaneAngle(rotated, axis)

      const angle = angleBetweenDeg(
        { x: 0, y: 0, z: 1 }, // original normal
        snapped.normal,
      )
      expect(angle).toBeCloseTo(15, 0)
    })

    it('does not snap at 12° (3° from 15°)', () => {
      const plane = createPlaneFromPoints([])
      const axis = plane.tangentU
      const rotated = rotatePlane(plane, axis, 12)
      const snapped = snapPlaneAngle(rotated, axis)

      const angle = angleBetweenDeg({ x: 0, y: 0, z: 1 }, snapped.normal)
      expect(angle).toBeCloseTo(12, 0) // not snapped
    })
  })

  describe('Axis alignment', () => {
    it('aligns XY plane to each axis', () => {
      const plane = createPlaneFromPoints([])

      for (const [key, target] of Object.entries(AXIS_NORMALS)) {
        const aligned = alignPlaneToAxis(plane, target)
        const angle = angleBetweenDeg(aligned.normal, target)
        expect(angle).toBeLessThan(0.01)
      }
    })

    it('aligns a rotated plane to Y axis', () => {
      let plane = createPlaneFromPoints([])
      // Rotate arbitrarily
      plane = rotatePlane(plane, { x: 1, y: 0, z: 0 }, 37)
      plane = rotatePlane(plane, { x: 0, y: 1, z: 0 }, 22)

      const aligned = alignPlaneToAxis(plane, AXIS_NORMALS.y)
      expect(aligned.normal.y).toBeCloseTo(1, 5)
      expect(aligned.normal.x).toBeCloseTo(0, 5)
      expect(aligned.normal.z).toBeCloseTo(0, 5)

      // Orthonormality
      expect(dot(aligned.normal, aligned.tangentU)).toBeCloseTo(0, 5)
      expect(dot(aligned.normal, aligned.tangentV)).toBeCloseTo(0, 5)
    })
  })

  describe('Line constraint rotation', () => {
    it('only provides horizontal rotation axis for line-constrained plane', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
      ])
      const axes = getRotationAxes(plane)

      expect(axes.horizontal).not.toBeNull()
      expect(axes.vertical).toBeNull() // left/right disabled
    })

    it('provides no rotation axes for fully-constrained plane', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ])
      const axes = getRotationAxes(plane)

      expect(axes.horizontal).toBeNull()
      expect(axes.vertical).toBeNull()
    })

    it('ignores axis alignment not perpendicular to constraint line', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
      ])
      // X axis is parallel to the line — should be ignored
      const aligned = alignPlaneToAxis(plane, { x: 1, y: 0, z: 0 })
      expect(aligned).toBe(plane) // unchanged reference
    })
  })

  describe('Cross-plane node visibility', () => {
    it('detects near-plane nodes within threshold', () => {
      const plane = createPlaneFromPoints([]) // XY at z=0

      const onPlane = isOnPlane({ x: 1, y: 2, z: 0 }, plane)
      const nearPlane = isOnPlane({ x: 1, y: 2, z: 0.3 }, plane, NEAR_PLANE_THRESHOLD)
      const farAway = isOnPlane({ x: 1, y: 2, z: 5 }, plane, NEAR_PLANE_THRESHOLD)

      expect(onPlane).toBe(true)
      expect(nearPlane).toBe(true)
      expect(farAway).toBe(false)
    })

    it('nodes on a rotated plane are near the original plane when close', () => {
      const plane1 = createPlaneFromPoints([]) // XY at z=0
      let plane2 = createPlaneFromPoints([])
      // Rotate plane2 by 5° — nodes on plane2 near the origin are still close to plane1
      plane2 = rotatePlane(plane2, plane2.tangentU, 5)

      // A node at origin is on both planes
      const nodePos = snapToPlaneGrid({ x: 0, y: 0, z: 0 }, plane2, 1.0)
      expect(isOnPlane(nodePos, plane1, NEAR_PLANE_THRESHOLD)).toBe(true)
    })
  })

  describe('Cross-plane node sharing', () => {
    it('snaps to a near-plane node when drawing a beam', () => {
      const plane = createPlaneFromPoints([]) // XY at z=0

      // Add a node slightly above the plane (cross-plane node)
      const crossPlaneNode = createNode({ position: { x: 3, y: 0, z: 0.2 } })
      useModelStore.getState().addNode(crossPlaneNode)

      const nodes = useModelStore.getState().nodes.map((n) => ({
        id: n.id,
        position: n.position,
      }))

      // Snap should find the cross-plane node (within NEAR_PLANE_THRESHOLD)
      const snapped = findNearestOnPlaneNode(
        { x: 3, y: 0, z: 0 },
        nodes,
        plane,
        0.5,
      )
      expect(snapped).toBe(crossPlaneNode.id)
    })

    it('prefers on-plane nodes over near-plane nodes', () => {
      const plane = createPlaneFromPoints([])

      const onPlaneNode = createNode({ position: { x: 3, y: 0, z: 0 } })
      const nearPlaneNode = createNode({ position: { x: 3.1, y: 0, z: 0.3 } })
      useModelStore.getState().addNode(onPlaneNode)
      useModelStore.getState().addNode(nearPlaneNode)

      const nodes = useModelStore.getState().nodes.map((n) => ({
        id: n.id,
        position: n.position,
      }))

      const snapped = findNearestOnPlaneNode(
        { x: 3.05, y: 0, z: 0 },
        nodes,
        plane,
        0.5,
      )
      expect(snapped).toBe(onPlaneNode.id)
    })

    it('creates a beam connecting nodes from two different planes', () => {
      const planeA = createPlaneFromPoints([]) // XY at z=0
      const planeB = createPlaneFromPoints([{ x: 0, y: 0, z: 0.3 }]) // XY at z=0.3

      // Add nodes on each plane
      const nodeA = createNode({
        position: snapToPlaneGrid({ x: 0, y: 0, z: 0 }, planeA, 1.0),
      })
      const nodeB = createNode({
        position: snapToPlaneGrid({ x: 3, y: 0, z: 0.3 }, planeB, 1.0),
      })
      useModelStore.getState().addNode(nodeA)
      useModelStore.getState().addNode(nodeB)

      // nodeB is near planeA (0.3 < NEAR_PLANE_THRESHOLD)
      expect(isOnPlane(nodeB.position, planeA, NEAR_PLANE_THRESHOLD)).toBe(true)

      // Create a beam across planes
      const member = createMember(nodeA.id, nodeB.id)
      useModelStore.getState().addMember(member)

      const members = useModelStore.getState().members
      expect(members).toHaveLength(1)
      expect(members[0].start_node).toBe(nodeA.id)
      expect(members[0].end_node).toBe(nodeB.id)
    })
  })
})
