import { describe, it, expect, beforeEach } from 'vitest'
import {
  rodriguesRotate,
  rotatePlane,
  getRotationAxes,
  snapPlaneAngle,
  computeRotationSpeed,
  TAP_ANGLE,
} from '../planeRotation'
import { createPlaneFromPoints, _resetPlaneIdCounter } from '../../model'
import type { Vec3, WorkingPlane } from '../../model'

function approxVec(v: Vec3, expected: Vec3, tolerance = 1e-6) {
  expect(v.x).toBeCloseTo(expected.x, 5)
  expect(v.y).toBeCloseTo(expected.y, 5)
  expect(v.z).toBeCloseTo(expected.z, 5)
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

function vecLength(v: Vec3): number {
  return Math.sqrt(dot(v, v))
}

describe('rodriguesRotate', () => {
  it('rotates X axis 90° around Z → Y', () => {
    const result = rodriguesRotate({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, 90)
    approxVec(result, { x: 0, y: 1, z: 0 })
  })

  it('rotates X axis 180° around Z → -X', () => {
    const result = rodriguesRotate({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, 180)
    approxVec(result, { x: -1, y: 0, z: 0 })
  })

  it('rotates X axis 360° around Z → X (identity)', () => {
    const result = rodriguesRotate({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, 360)
    approxVec(result, { x: 1, y: 0, z: 0 })
  })

  it('rotation around the vector itself is identity', () => {
    const v: Vec3 = { x: 1, y: 0, z: 0 }
    const result = rodriguesRotate(v, v, 45)
    approxVec(result, v)
  })

  it('rotates Z axis 90° around X → -Y', () => {
    const result = rodriguesRotate({ x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 0 }, 90)
    approxVec(result, { x: 0, y: -1, z: 0 })
  })
})

describe('rotatePlane', () => {
  let plane: WorkingPlane

  beforeEach(() => {
    _resetPlaneIdCounter()
    // Default XY plane: normal=+Z, tangentU=+X, tangentV=+Y (for horizontal plane)
    plane = createPlaneFromPoints([])
  })

  it('preserves orthonormality after rotation', () => {
    const rotated = rotatePlane(plane, { x: 1, y: 0, z: 0 }, 37) // arbitrary angle

    // All vectors should be unit length
    expect(vecLength(rotated.normal)).toBeCloseTo(1, 5)
    expect(vecLength(rotated.tangentU)).toBeCloseTo(1, 5)
    expect(vecLength(rotated.tangentV)).toBeCloseTo(1, 5)

    // All pairs should be orthogonal
    expect(dot(rotated.normal, rotated.tangentU)).toBeCloseTo(0, 5)
    expect(dot(rotated.normal, rotated.tangentV)).toBeCloseTo(0, 5)
    expect(dot(rotated.tangentU, rotated.tangentV)).toBeCloseTo(0, 5)
  })

  it('360° rotation returns to original', () => {
    const rotated = rotatePlane(plane, { x: 1, y: 0, z: 0 }, 360)
    approxVec(rotated.normal, plane.normal)
    approxVec(rotated.tangentU, plane.tangentU)
    approxVec(rotated.tangentV, plane.tangentV)
  })

  it('preserves orthonormality after many small incremental rotations', () => {
    let current = plane
    // 360 one-degree rotations around a diagonal axis
    const axis = {
      x: 1 / Math.sqrt(3),
      y: 1 / Math.sqrt(3),
      z: 1 / Math.sqrt(3),
    }
    for (let i = 0; i < 360; i++) {
      current = rotatePlane(current, axis, 1)
    }

    // Should return to approximately the original
    approxVec(current.normal, plane.normal)
    approxVec(current.tangentU, plane.tangentU)
    approxVec(current.tangentV, plane.tangentV)

    // Orthonormality maintained
    expect(vecLength(current.normal)).toBeCloseTo(1, 4)
    expect(dot(current.normal, current.tangentU)).toBeCloseTo(0, 4)
    expect(dot(current.normal, current.tangentV)).toBeCloseTo(0, 4)
    expect(dot(current.tangentU, current.tangentV)).toBeCloseTo(0, 4)
  })

  it('keeps plane identity fields unchanged', () => {
    const rotated = rotatePlane(plane, { x: 1, y: 0, z: 0 }, 45)
    expect(rotated.id).toBe(plane.id)
    expect(rotated.point).toEqual(plane.point)
    expect(rotated.constraintType).toBe(plane.constraintType)
  })
})

describe('getRotationAxes', () => {
  beforeEach(() => {
    _resetPlaneIdCounter()
  })

  it('point-constrained plane has both axes', () => {
    const plane = createPlaneFromPoints([])
    const axes = getRotationAxes(plane)
    expect(axes.horizontal).not.toBeNull()
    expect(axes.vertical).not.toBeNull()
  })

  it('line-constrained plane has only horizontal axis', () => {
    const plane = createPlaneFromPoints([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
    ])
    const axes = getRotationAxes(plane)
    expect(axes.horizontal).not.toBeNull()
    expect(axes.vertical).toBeNull()
  })

  it('fully-constrained plane has no axes', () => {
    const plane = createPlaneFromPoints([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
    ])
    const axes = getRotationAxes(plane)
    expect(axes.horizontal).toBeNull()
    expect(axes.vertical).toBeNull()
  })
})

describe('snapPlaneAngle', () => {
  beforeEach(() => {
    _resetPlaneIdCounter()
  })

  it('snaps when within threshold of a 15° multiple', () => {
    // Start with XY plane (normal = +Z), rotate 14.5° around X
    // This is 0.5° away from the 15° snap point
    const plane = createPlaneFromPoints([])
    const rotated = rotatePlane(plane, { x: 1, y: 0, z: 0 }, 14.5)
    const axis = { x: 1, y: 0, z: 0 }
    const snapped = snapPlaneAngle(rotated, axis)

    // The angle between snapped normal and +Z should be exactly 15°
    const angleDeg = Math.acos(
      Math.min(1, Math.max(-1, snapped.normal.z))
    ) * (180 / Math.PI)
    expect(angleDeg).toBeCloseTo(15, 1)
  })

  it('does not snap when outside threshold', () => {
    const plane = createPlaneFromPoints([])
    const rotated = rotatePlane(plane, { x: 1, y: 0, z: 0 }, 12) // 12° is 3° from 15°
    const axis = { x: 1, y: 0, z: 0 }
    const snapped = snapPlaneAngle(rotated, axis)

    // Should be unchanged (no snap)
    approxVec(snapped.normal, rotated.normal)
  })
})

describe('computeRotationSpeed', () => {
  it('starts at MIN_SPEED', () => {
    expect(computeRotationSpeed(0)).toBe(5)
  })

  it('reaches MAX_SPEED at ramp duration', () => {
    expect(computeRotationSpeed(2)).toBe(180)
  })

  it('is clamped at MAX_SPEED beyond ramp duration', () => {
    expect(computeRotationSpeed(10)).toBe(180)
  })

  it('is monotonically increasing', () => {
    const speeds = [0, 0.25, 0.5, 1, 1.5, 2].map(computeRotationSpeed)
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeGreaterThanOrEqual(speeds[i - 1])
    }
  })
})

describe('TAP_ANGLE', () => {
  it('is a positive number', () => {
    expect(TAP_ANGLE).toBeGreaterThan(0)
  })
})
