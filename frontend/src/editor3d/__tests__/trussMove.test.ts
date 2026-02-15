import { describe, it, expect } from 'vitest'
import { computeTrussCentroid, constrainDeltaToPlane, computeNudgeDelta } from '../trussMove'
import { createNode } from '../../model'

describe('computeTrussCentroid', () => {
  it('returns centroid of three nodes', () => {
    const nodes = [
      createNode({ position: { x: 0, y: 0, z: 0 } }),
      createNode({ position: { x: 6, y: 3, z: 0 } }),
      createNode({ position: { x: 3, y: 6, z: 0 } }),
    ]
    const c = computeTrussCentroid(nodes)
    expect(c.x).toBeCloseTo(3)
    expect(c.y).toBeCloseTo(3)
    expect(c.z).toBeCloseTo(0)
  })

  it('returns zero for empty array', () => {
    const c = computeTrussCentroid([])
    expect(c.x).toBe(0)
    expect(c.y).toBe(0)
    expect(c.z).toBe(0)
  })
})

describe('constrainDeltaToPlane', () => {
  it('XZ plane zeroes Y component', () => {
    const d = constrainDeltaToPlane({ x: 1, y: 2, z: 3 }, 'XZ')
    expect(d.x).toBe(1)
    expect(d.y).toBe(0)
    expect(d.z).toBe(3)
  })

  it('XY plane zeroes Z component', () => {
    const d = constrainDeltaToPlane({ x: 1, y: 2, z: 3 }, 'XY')
    expect(d.x).toBe(1)
    expect(d.y).toBe(2)
    expect(d.z).toBe(0)
  })

  it('YZ plane zeroes X component', () => {
    const d = constrainDeltaToPlane({ x: 1, y: 2, z: 3 }, 'YZ')
    expect(d.x).toBe(0)
    expect(d.y).toBe(2)
    expect(d.z).toBe(3)
  })
})

describe('computeNudgeDelta', () => {
  it('right on XZ moves +X', () => {
    const d = computeNudgeDelta('right', 'XZ', 0.5)
    expect(d.x).toBe(0.5)
    expect(d.y).toBe(0)
    expect(d.z).toBe(0)
  })

  it('left on XZ moves -X', () => {
    const d = computeNudgeDelta('left', 'XZ', 0.5)
    expect(d.x).toBe(-0.5)
    expect(d.z).toBe(0)
  })

  it('up on XZ moves +Z', () => {
    const d = computeNudgeDelta('up', 'XZ', 1)
    expect(d.x).toBe(0)
    expect(d.z).toBe(1)
  })

  it('down on XZ moves -Z', () => {
    const d = computeNudgeDelta('down', 'XZ', 1)
    expect(d.z).toBe(-1)
  })

  it('right on XY moves +X', () => {
    const d = computeNudgeDelta('right', 'XY', 1)
    expect(d.x).toBe(1)
    expect(d.y).toBe(0)
    expect(d.z).toBe(0)
  })

  it('up on XY moves +Y', () => {
    const d = computeNudgeDelta('up', 'XY', 1)
    expect(d.x).toBe(0)
    expect(d.y).toBe(1)
    expect(d.z).toBe(0)
  })

  it('right on YZ moves +Y', () => {
    const d = computeNudgeDelta('right', 'YZ', 1)
    expect(d.x).toBe(0)
    expect(d.y).toBe(1)
    expect(d.z).toBe(0)
  })

  it('up on YZ moves +Z', () => {
    const d = computeNudgeDelta('up', 'YZ', 1)
    expect(d.x).toBe(0)
    expect(d.y).toBe(0)
    expect(d.z).toBe(1)
  })
})
