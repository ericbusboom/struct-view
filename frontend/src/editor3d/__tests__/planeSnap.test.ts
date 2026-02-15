import { describe, it, expect, beforeEach } from 'vitest'
import {
  worldToPlaneLocal,
  planeLocalToWorld,
  snapToPlaneGrid,
  raycastOntoPlane,
  findNearestOnPlaneNode,
} from '../planeSnap'
import { createPlaneFromPoints, _resetPlaneIdCounter } from '../../model/WorkingPlane'

describe('planeSnap', () => {
  beforeEach(() => _resetPlaneIdCounter())

  describe('worldToPlaneLocal / planeLocalToWorld round-trip', () => {
    it('round-trips a point on the XY plane', () => {
      const plane = createPlaneFromPoints([])
      const point = { x: 3, y: 7, z: 0 }
      const { u, v } = worldToPlaneLocal(point, plane)
      const result = planeLocalToWorld(u, v, plane)
      expect(result.x).toBeCloseTo(3)
      expect(result.y).toBeCloseTo(7)
      expect(result.z).toBeCloseTo(0)
    })

    it('round-trips a point on a tilted plane', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 0, y: 0, z: 5 },
      ])
      // This is an XZ plane (normal along Y)
      const point = { x: 2, y: 0, z: 3 }
      const { u, v } = worldToPlaneLocal(point, plane)
      const result = planeLocalToWorld(u, v, plane)
      expect(result.x).toBeCloseTo(2)
      expect(result.y).toBeCloseTo(0)
      expect(result.z).toBeCloseTo(3)
    })

    it('round-trips a point on a plane offset from origin', () => {
      const plane = createPlaneFromPoints([{ x: 10, y: 20, z: 5 }])
      const point = { x: 13, y: 24, z: 5 }
      const { u, v } = worldToPlaneLocal(point, plane)
      const result = planeLocalToWorld(u, v, plane)
      expect(result.x).toBeCloseTo(13)
      expect(result.y).toBeCloseTo(24)
      expect(result.z).toBeCloseTo(5)
    })
  })

  describe('worldToPlaneLocal', () => {
    it('returns (0, 0) for the plane anchor point', () => {
      const plane = createPlaneFromPoints([{ x: 5, y: 3, z: 0 }])
      const { u, v } = worldToPlaneLocal({ x: 5, y: 3, z: 0 }, plane)
      expect(u).toBeCloseTo(0)
      expect(v).toBeCloseTo(0)
    })

    it('decomposes XY plane points into u/v along tangent axes', () => {
      const plane = createPlaneFromPoints([])
      // Default XY plane: tangentU ~ X, tangentV ~ Y
      const { u, v } = worldToPlaneLocal({ x: 4, y: 7, z: 0 }, plane)
      // u should be along X, v along Y (or vice versa depending on tangent computation)
      expect(Math.sqrt(u * u + v * v)).toBeCloseTo(Math.sqrt(16 + 49))
    })
  })

  describe('snapToPlaneGrid', () => {
    it('snaps a point on the XY plane to grid=1.0', () => {
      const plane = createPlaneFromPoints([])
      const result = snapToPlaneGrid({ x: 2.3, y: 4.7, z: 0 }, plane, 1.0)
      // Should snap to nearest integer grid on the plane
      const { u, v } = worldToPlaneLocal(result, plane)
      expect(u).toBeCloseTo(Math.round(u))
      expect(v).toBeCloseTo(Math.round(v))
    })

    it('snaps exactly to grid intersections', () => {
      const plane = createPlaneFromPoints([])
      const result = snapToPlaneGrid({ x: 0.6, y: 0.4, z: 0 }, plane, 1.0)
      // In plane-local coords, should be at integer positions
      const { u, v } = worldToPlaneLocal(result, plane)
      expect(Math.abs(u - Math.round(u))).toBeLessThan(0.001)
      expect(Math.abs(v - Math.round(v))).toBeLessThan(0.001)
    })

    it('respects custom grid size', () => {
      const plane = createPlaneFromPoints([])
      const result = snapToPlaneGrid({ x: 0.37, y: 0.62, z: 0 }, plane, 0.5)
      const { u, v } = worldToPlaneLocal(result, plane)
      // Should be at multiples of 0.5
      expect(Math.abs(u / 0.5 - Math.round(u / 0.5))).toBeLessThan(0.001)
      expect(Math.abs(v / 0.5 - Math.round(v / 0.5))).toBeLessThan(0.001)
    })

    it('snapped point lies on the plane', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 0, y: 5, z: 0 },
      ])
      const result = snapToPlaneGrid({ x: 2.3, y: 4.7, z: 0.1 }, plane, 1.0)
      // Distance from plane should be ~0 (normal is Z)
      const dist = Math.abs(
        (result.x - plane.point.x) * plane.normal.x +
          (result.y - plane.point.y) * plane.normal.y +
          (result.z - plane.point.z) * plane.normal.z,
      )
      expect(dist).toBeLessThan(0.001)
    })
  })

  describe('raycastOntoPlane', () => {
    it('intersects a vertical ray with the XY plane', () => {
      const plane = createPlaneFromPoints([])
      const origin = { x: 3, y: 5, z: 10 }
      const dir = { x: 0, y: 0, z: -1 }
      const result = raycastOntoPlane(origin, dir, plane)
      expect(result).not.toBeNull()
      expect(result!.x).toBeCloseTo(3)
      expect(result!.y).toBeCloseTo(5)
      expect(result!.z).toBeCloseTo(0)
    })

    it('intersects an angled ray', () => {
      const plane = createPlaneFromPoints([])
      const origin = { x: 0, y: 0, z: 10 }
      // Ray pointing down and to the right
      const len = Math.sqrt(1 + 1 + 1)
      const dir = { x: 1 / len, y: 1 / len, z: -1 / len }
      const result = raycastOntoPlane(origin, dir, plane)
      expect(result).not.toBeNull()
      expect(result!.x).toBeCloseTo(10)
      expect(result!.y).toBeCloseTo(10)
      expect(result!.z).toBeCloseTo(0)
    })

    it('returns null for ray parallel to plane', () => {
      const plane = createPlaneFromPoints([])
      const origin = { x: 0, y: 0, z: 5 }
      const dir = { x: 1, y: 0, z: 0 } // parallel to XY plane
      const result = raycastOntoPlane(origin, dir, plane)
      expect(result).toBeNull()
    })

    it('returns null for ray pointing away from plane', () => {
      const plane = createPlaneFromPoints([])
      const origin = { x: 0, y: 0, z: 5 }
      const dir = { x: 0, y: 0, z: 1 } // pointing up, away from z=0
      const result = raycastOntoPlane(origin, dir, plane)
      expect(result).toBeNull()
    })

    it('works with offset plane', () => {
      const plane = createPlaneFromPoints([{ x: 0, y: 0, z: 3 }])
      const origin = { x: 2, y: 4, z: 10 }
      const dir = { x: 0, y: 0, z: -1 }
      const result = raycastOntoPlane(origin, dir, plane)
      expect(result).not.toBeNull()
      expect(result!.x).toBeCloseTo(2)
      expect(result!.y).toBeCloseTo(4)
      expect(result!.z).toBeCloseTo(3)
    })
  })

  describe('findNearestOnPlaneNode', () => {
    it('finds a node on the plane within snap radius', () => {
      const plane = createPlaneFromPoints([])
      const nodes = [
        { id: 'n1', position: { x: 3, y: 5, z: 0 } },
        { id: 'n2', position: { x: 10, y: 10, z: 0 } },
      ]
      const result = findNearestOnPlaneNode(
        { x: 3.1, y: 5.1, z: 0 },
        nodes,
        plane,
        0.5,
      )
      expect(result).toBe('n1')
    })

    it('returns null when no node is within snap radius', () => {
      const plane = createPlaneFromPoints([])
      const nodes = [{ id: 'n1', position: { x: 10, y: 10, z: 0 } }]
      const result = findNearestOnPlaneNode(
        { x: 0, y: 0, z: 0 },
        nodes,
        plane,
        0.5,
      )
      expect(result).toBeNull()
    })

    it('ignores off-plane nodes', () => {
      const plane = createPlaneFromPoints([])
      const nodes = [
        { id: 'n1', position: { x: 1, y: 1, z: 5 } }, // off-plane
        { id: 'n2', position: { x: 1, y: 1, z: 0 } }, // on-plane
      ]
      const result = findNearestOnPlaneNode(
        { x: 1.1, y: 1.1, z: 0 },
        nodes,
        plane,
        0.5,
      )
      expect(result).toBe('n2')
    })

    it('returns the nearest node when multiple are in range', () => {
      const plane = createPlaneFromPoints([])
      const nodes = [
        { id: 'n1', position: { x: 1, y: 0, z: 0 } },
        { id: 'n2', position: { x: 0.1, y: 0, z: 0 } },
      ]
      const result = findNearestOnPlaneNode(
        { x: 0, y: 0, z: 0 },
        nodes,
        plane,
        1.5,
      )
      expect(result).toBe('n2')
    })
  })
})
