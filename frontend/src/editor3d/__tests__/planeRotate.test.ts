import { describe, it, expect } from 'vitest'
import { snapAngle, rotatePositionsAroundPivot } from '../planeRotate'

describe('snapAngle', () => {
  it('snaps 7 degrees to 0 with 15-degree snap', () => {
    expect(snapAngle(7, 15)).toBe(0)
  })

  it('snaps 8 degrees to 15 with 15-degree snap', () => {
    expect(snapAngle(8, 15)).toBe(15)
  })

  it('snaps 37 degrees to 30 with 15-degree snap', () => {
    expect(snapAngle(37, 15)).toBe(30)
  })

  it('snaps 45 degrees exactly', () => {
    expect(snapAngle(45, 15)).toBe(45)
  })

  it('snaps negative angles', () => {
    expect(snapAngle(-8, 15)).toBe(-15)
    expect(snapAngle(-7, 15)).toBeCloseTo(0)
  })
})

describe('rotatePositionsAroundPivot', () => {
  const origin: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }

  it('rotates 90 degrees in XZ plane (around Y axis)', () => {
    const positions = [{ x: 1, y: 0, z: 0 }]
    const result = rotatePositionsAroundPivot(positions, origin, 90, 'XZ')
    expect(result[0].x).toBeCloseTo(0)
    expect(result[0].y).toBeCloseTo(0)
    expect(result[0].z).toBeCloseTo(-1)
  })

  it('rotates 90 degrees in XY plane (around Z axis)', () => {
    const positions = [{ x: 1, y: 0, z: 0 }]
    const result = rotatePositionsAroundPivot(positions, origin, 90, 'XY')
    expect(result[0].x).toBeCloseTo(0)
    expect(result[0].y).toBeCloseTo(1)
    expect(result[0].z).toBeCloseTo(0)
  })

  it('rotates 90 degrees in YZ plane (around X axis)', () => {
    const positions = [{ x: 0, y: 1, z: 0 }]
    const result = rotatePositionsAroundPivot(positions, origin, 90, 'YZ')
    expect(result[0].x).toBeCloseTo(0)
    expect(result[0].y).toBeCloseTo(0)
    expect(result[0].z).toBeCloseTo(1)
  })

  it('rotates around a non-origin pivot', () => {
    const pivot = { x: 5, y: 0, z: 0 }
    const positions = [{ x: 6, y: 0, z: 0 }]
    const result = rotatePositionsAroundPivot(positions, pivot, 90, 'XZ')
    expect(result[0].x).toBeCloseTo(5)
    expect(result[0].y).toBeCloseTo(0)
    expect(result[0].z).toBeCloseTo(-1)
  })

  it('rotates 180 degrees flips position', () => {
    const positions = [{ x: 1, y: 0, z: 0 }]
    const result = rotatePositionsAroundPivot(positions, origin, 180, 'XZ')
    expect(result[0].x).toBeCloseTo(-1)
    expect(result[0].y).toBeCloseTo(0)
    expect(result[0].z).toBeCloseTo(0)
  })

  it('rotates 360 degrees returns to original position', () => {
    const positions = [{ x: 3, y: 2, z: 1 }]
    const result = rotatePositionsAroundPivot(positions, origin, 360, 'XZ')
    expect(result[0].x).toBeCloseTo(3)
    expect(result[0].y).toBeCloseTo(2)
    expect(result[0].z).toBeCloseTo(1)
  })

  it('rotates multiple positions together', () => {
    const positions = [
      { x: 1, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 },
    ]
    const result = rotatePositionsAroundPivot(positions, origin, 90, 'XZ')
    expect(result[0].x).toBeCloseTo(0)
    expect(result[0].z).toBeCloseTo(-1)
    expect(result[1].x).toBeCloseTo(0)
    expect(result[1].z).toBeCloseTo(-2)
  })

  it('0 degrees returns same positions', () => {
    const positions = [{ x: 3, y: 4, z: 5 }]
    const result = rotatePositionsAroundPivot(positions, origin, 0, 'XZ')
    expect(result[0].x).toBeCloseTo(3)
    expect(result[0].y).toBeCloseTo(4)
    expect(result[0].z).toBeCloseTo(5)
  })
})
