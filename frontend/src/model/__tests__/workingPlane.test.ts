import { describe, it, expect, beforeEach } from 'vitest'
import { createPlaneFromPoints, getPlaneColor, _resetPlaneIdCounter } from '../WorkingPlane'
import type { Vec3 } from '../schemas'

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

function length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

describe('createPlaneFromPoints', () => {
  beforeEach(() => _resetPlaneIdCounter())

  describe('0 points — horizontal XY plane at origin (Z-up)', () => {
    it('creates an XY plane with normal along Z', () => {
      const plane = createPlaneFromPoints([])
      expect(plane.normal.z).toBeCloseTo(1)
      expect(plane.normal.x).toBeCloseTo(0)
      expect(plane.normal.y).toBeCloseTo(0)
    })

    it('has anchor at origin', () => {
      const plane = createPlaneFromPoints([])
      expect(plane.point).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('has point constraint type', () => {
      const plane = createPlaneFromPoints([])
      expect(plane.constraintType).toBe('point')
    })

    it('has orthogonal tangent vectors', () => {
      const plane = createPlaneFromPoints([])
      expect(dot(plane.tangentU, plane.tangentV)).toBeCloseTo(0)
      expect(dot(plane.tangentU, plane.normal)).toBeCloseTo(0)
      expect(dot(plane.tangentV, plane.normal)).toBeCloseTo(0)
    })

    it('tangent vectors are unit length', () => {
      const plane = createPlaneFromPoints([])
      expect(length(plane.tangentU)).toBeCloseTo(1)
      expect(length(plane.tangentV)).toBeCloseTo(1)
    })
  })

  describe('1 point — horizontal XY plane through that point (Z-up)', () => {
    it('creates an XY plane with normal along Z', () => {
      const plane = createPlaneFromPoints([{ x: 5, y: 3, z: 7 }])
      expect(plane.normal.z).toBeCloseTo(1)
      expect(plane.constraintType).toBe('point')
    })

    it('has anchor at the given point', () => {
      const plane = createPlaneFromPoints([{ x: 5, y: 3, z: 7 }])
      expect(plane.point).toEqual({ x: 5, y: 3, z: 7 })
    })
  })

  describe('2 points — line-constrained plane', () => {
    it('has line constraint type', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
      ])
      expect(plane.constraintType).toBe('line')
    })

    it('normal is perpendicular to the line direction', () => {
      const p0 = { x: 0, y: 0, z: 0 }
      const p1 = { x: 5, y: 0, z: 0 }
      const plane = createPlaneFromPoints([p0, p1])
      // Line is along X, so normal should be perpendicular to X
      const lineDir = { x: 1, y: 0, z: 0 }
      expect(Math.abs(dot(plane.normal, lineDir))).toBeLessThan(0.01)
    })

    it('stores both constraint points', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
      ])
      expect(plane.constraintPoints).toHaveLength(2)
    })

    it('normal is unit length', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
      ])
      expect(length(plane.normal)).toBeCloseTo(1)
    })

    it('tangent vectors are orthogonal', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 5, z: 0 },
      ])
      expect(dot(plane.tangentU, plane.tangentV)).toBeCloseTo(0)
      expect(dot(plane.tangentU, plane.normal)).toBeCloseTo(0)
    })
  })

  describe('3 points — fully constrained plane', () => {
    it('has plane constraint type', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 0, y: 5, z: 0 },
      ])
      expect(plane.constraintType).toBe('plane')
    })

    it('normal is perpendicular to both edge vectors', () => {
      const p0 = { x: 0, y: 0, z: 0 }
      const p1 = { x: 5, y: 0, z: 0 }
      const p2 = { x: 0, y: 5, z: 0 }
      const plane = createPlaneFromPoints([p0, p1, p2])
      const v1 = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z }
      const v2 = { x: p2.x - p0.x, y: p2.y - p0.y, z: p2.z - p0.z }
      expect(Math.abs(dot(plane.normal, v1))).toBeLessThan(0.01)
      expect(Math.abs(dot(plane.normal, v2))).toBeLessThan(0.01)
    })

    it('stores all 3 constraint points', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 0, y: 5, z: 0 },
      ])
      expect(plane.constraintPoints).toHaveLength(3)
    })

    it('XY triangle gives normal along Z', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 0, y: 5, z: 0 },
      ])
      expect(Math.abs(plane.normal.z)).toBeCloseTo(1)
    })

    it('collinear 3 points falls back to line constraint', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 },
      ])
      expect(plane.constraintType).toBe('line')
    })
  })

  it('assigns unique IDs', () => {
    const p1 = createPlaneFromPoints([])
    const p2 = createPlaneFromPoints([])
    expect(p1.id).not.toBe(p2.id)
  })
})

describe('getPlaneColor', () => {
  it('returns red for XY plane (normal along Z)', () => {
    expect(getPlaneColor({ x: 0, y: 0, z: 1 })).toBe('#ff4444')
    expect(getPlaneColor({ x: 0, y: 0, z: -1 })).toBe('#ff4444')
  })

  it('returns blue for YZ plane (normal along X)', () => {
    expect(getPlaneColor({ x: 1, y: 0, z: 0 })).toBe('#4488ff')
    expect(getPlaneColor({ x: -1, y: 0, z: 0 })).toBe('#4488ff')
  })

  it('returns green for XZ plane (normal along Y)', () => {
    expect(getPlaneColor({ x: 0, y: 1, z: 0 })).toBe('#44cc44')
    expect(getPlaneColor({ x: 0, y: -1, z: 0 })).toBe('#44cc44')
  })

  it('returns yellow for non-axis-aligned planes', () => {
    expect(getPlaneColor({ x: 0.577, y: 0.577, z: 0.577 })).toBe('#ffcc00')
  })
})
