import { describe, it, expect } from 'vitest'
import { projectToPlane } from '../planeMove'

describe('projectToPlane', () => {
  it('projects ray onto XZ plane (y = planePoint.y)', () => {
    const result = projectToPlane(
      { x: 5, y: 10, z: 5 },   // ray origin (above)
      { x: 0, y: -1, z: 0 },   // ray direction (straight down)
      { x: 0, y: 3, z: 0 },    // plane through y=3
      'XZ',
    )
    expect(result).not.toBeNull()
    expect(result!.x).toBeCloseTo(5)
    expect(result!.y).toBeCloseTo(3)
    expect(result!.z).toBeCloseTo(5)
  })

  it('projects ray onto XY plane (z = planePoint.z)', () => {
    const result = projectToPlane(
      { x: 0, y: 0, z: 10 },
      { x: 0, y: 0, z: -1 },
      { x: 0, y: 0, z: 2 },
      'XY',
    )
    expect(result).not.toBeNull()
    expect(result!.x).toBeCloseTo(0)
    expect(result!.y).toBeCloseTo(0)
    expect(result!.z).toBeCloseTo(2)
  })

  it('projects ray onto YZ plane (x = planePoint.x)', () => {
    const result = projectToPlane(
      { x: 10, y: 3, z: 4 },
      { x: -1, y: 0, z: 0 },
      { x: 5, y: 0, z: 0 },
      'YZ',
    )
    expect(result).not.toBeNull()
    expect(result!.x).toBeCloseTo(5)
    expect(result!.y).toBeCloseTo(3)
    expect(result!.z).toBeCloseTo(4)
  })

  it('returns null for ray parallel to XZ plane', () => {
    const result = projectToPlane(
      { x: 0, y: 5, z: 0 },
      { x: 1, y: 0, z: 0 },   // horizontal ray, parallel to XZ
      { x: 0, y: 0, z: 0 },
      'XZ',
    )
    expect(result).toBeNull()
  })

  it('returns null for ray parallel to XY plane', () => {
    const result = projectToPlane(
      { x: 0, y: 0, z: 5 },
      { x: 1, y: 1, z: 0 },   // ray in XY, parallel to XY plane
      { x: 0, y: 0, z: 0 },
      'XY',
    )
    expect(result).toBeNull()
  })

  it('returns null for ray parallel to YZ plane', () => {
    const result = projectToPlane(
      { x: 5, y: 0, z: 0 },
      { x: 0, y: 1, z: 1 },   // ray in YZ, parallel to YZ plane
      { x: 0, y: 0, z: 0 },
      'YZ',
    )
    expect(result).toBeNull()
  })

  it('handles angled ray onto XZ plane', () => {
    // Ray from (0,10,0) in direction (1,-1,0) should hit y=0 at (10,0,0)
    const result = projectToPlane(
      { x: 0, y: 10, z: 0 },
      { x: 1, y: -1, z: 0 },
      { x: 0, y: 0, z: 0 },
      'XZ',
    )
    expect(result).not.toBeNull()
    expect(result!.x).toBeCloseTo(10)
    expect(result!.y).toBeCloseTo(0)
    expect(result!.z).toBeCloseTo(0)
  })

  it('works with non-origin plane point', () => {
    // XZ plane at y=5, ray from (0,15,3) going straight down
    const result = projectToPlane(
      { x: 0, y: 15, z: 3 },
      { x: 0, y: -1, z: 0 },
      { x: 7, y: 5, z: 9 },   // plane at y=5
      'XZ',
    )
    expect(result).not.toBeNull()
    expect(result!.x).toBeCloseTo(0)
    expect(result!.y).toBeCloseTo(5)
    expect(result!.z).toBeCloseTo(3)
  })
})
