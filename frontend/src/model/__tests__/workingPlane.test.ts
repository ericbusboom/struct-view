import { describe, it, expect, beforeEach } from 'vitest'
import { createPlaneFromPoints, getPlaneColor, isOnPlane, workingPlaneFromPlacementPlane, _resetPlaneIdCounter } from '../WorkingPlane'
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

    it('tangentU aligns with constraint line direction', () => {
      // Line along X axis
      const planeX = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
      ])
      expect(Math.abs(planeX.tangentU.x)).toBeCloseTo(1)
      expect(planeX.tangentU.y).toBeCloseTo(0)
      expect(planeX.tangentU.z).toBeCloseTo(0)

      // Line along diagonal
      const planeDiag = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 0 },
      ])
      const s = 1 / Math.sqrt(2)
      expect(planeDiag.tangentU.x).toBeCloseTo(s)
      expect(planeDiag.tangentU.y).toBeCloseTo(s)
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

    it('tangentU aligns with first edge direction', () => {
      const plane = createPlaneFromPoints([
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 0, y: 5, z: 0 },
      ])
      // First edge is along X
      expect(Math.abs(plane.tangentU.x)).toBeCloseTo(1)
      expect(plane.tangentU.y).toBeCloseTo(0)
      expect(plane.tangentU.z).toBeCloseTo(0)
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

describe('isOnPlane', () => {
  beforeEach(() => _resetPlaneIdCounter())

  it('returns true for a point exactly on the plane', () => {
    const plane = createPlaneFromPoints([])
    expect(isOnPlane({ x: 5, y: 3, z: 0 }, plane)).toBe(true)
  })

  it('returns true for a point within threshold', () => {
    const plane = createPlaneFromPoints([])
    expect(isOnPlane({ x: 5, y: 3, z: 0.005 }, plane)).toBe(true)
  })

  it('returns false for a point beyond threshold', () => {
    const plane = createPlaneFromPoints([])
    expect(isOnPlane({ x: 5, y: 3, z: 1 }, plane)).toBe(false)
  })

  it('works with tilted planes', () => {
    const plane = createPlaneFromPoints([
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 0, z: 0 },
      { x: 0, y: 0, z: 5 },
    ])
    // Normal is along Y for this XZ plane — point at y=0 is on it
    expect(isOnPlane({ x: 2, y: 0, z: 3 }, plane)).toBe(true)
    expect(isOnPlane({ x: 2, y: 5, z: 3 }, plane)).toBe(false)
  })

  it('respects custom threshold', () => {
    const plane = createPlaneFromPoints([])
    expect(isOnPlane({ x: 0, y: 0, z: 0.5 }, plane, 1.0)).toBe(true)
    expect(isOnPlane({ x: 0, y: 0, z: 0.5 }, plane, 0.1)).toBe(false)
  })
})

describe('workingPlaneFromPlacementPlane', () => {
  it('XY has normal along Z', () => {
    const plane = workingPlaneFromPlacementPlane('XY')
    expect(plane.normal).toEqual({ x: 0, y: 0, z: 1 })
  })

  it('XZ has normal along Y', () => {
    const plane = workingPlaneFromPlacementPlane('XZ')
    expect(plane.normal).toEqual({ x: 0, y: 1, z: 0 })
  })

  it('YZ has normal along X', () => {
    const plane = workingPlaneFromPlacementPlane('YZ')
    expect(plane.normal).toEqual({ x: 1, y: 0, z: 0 })
  })

  it('all planes have orthogonal tangent vectors', () => {
    for (const pp of ['XY', 'XZ', 'YZ'] as const) {
      const plane = workingPlaneFromPlacementPlane(pp)
      expect(dot(plane.tangentU, plane.tangentV)).toBeCloseTo(0)
      expect(dot(plane.tangentU, plane.normal)).toBeCloseTo(0)
      expect(dot(plane.tangentV, plane.normal)).toBeCloseTo(0)
      expect(length(plane.tangentU)).toBeCloseTo(1)
      expect(length(plane.tangentV)).toBeCloseTo(1)
    }
  })
})
