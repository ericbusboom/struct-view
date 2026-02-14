import { describe, it, expect } from 'vitest'
import { snapPoint3D } from '../snap3d'
import { createNode, createMember } from '../../model'

describe('snapPoint3D', () => {
  const nodeA = createNode({ id: 'a', position: { x: 0, y: 0, z: 0 } })
  const nodeB = createNode({ id: 'b', position: { x: 10, y: 0, z: 0 } })
  const nodeC = createNode({ id: 'c', position: { x: 5, y: 5, z: 0 } })
  const nodes = [nodeA, nodeB, nodeC]
  const memberAB = createMember('a', 'b', { id: 'mab' })
  const members = [memberAB]
  const opts = { snapRadius: 1.0, gridSize: 1.0 }

  it('snaps to nearest node within radius', () => {
    const result = snapPoint3D({ x: 0.3, y: 0.2, z: 0 }, nodes, members, opts)
    expect(result.type).toBe('node')
    expect(result.sourceId).toBe('a')
    expect(result.point).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('picks the closest node when multiple are in range', () => {
    // Cursor at (4.8, 4.8, 0) — closer to nodeC(5,5,0) than nodeA or nodeB
    const result = snapPoint3D({ x: 4.8, y: 4.8, z: 0 }, nodes, members, opts)
    expect(result.type).toBe('node')
    expect(result.sourceId).toBe('c')
  })

  it('snaps to member midpoint when no node is in range', () => {
    // midpoint of AB is (5,0,0). Cursor at (5.3, 0, 0) — no node within 1m, but midpoint is
    const result = snapPoint3D({ x: 5.3, y: 0, z: 0 }, nodes, members, opts)
    expect(result.type).toBe('midpoint')
    expect(result.sourceId).toBe('mab')
    expect(result.point.x).toBeCloseTo(5)
    expect(result.point.y).toBeCloseTo(0)
  })

  it('falls back to grid when nothing else is in range', () => {
    const result = snapPoint3D({ x: 3.3, y: 2.7, z: 0 }, nodes, members, opts)
    expect(result.type).toBe('grid')
    expect(result.point.x).toBeCloseTo(3)
    expect(result.point.y).toBeCloseTo(3)
    expect(result.point.z).toBeCloseTo(0)
  })

  it('returns none when grid is disabled and nothing in range', () => {
    const result = snapPoint3D(
      { x: 3.3, y: 2.7, z: 0 },
      nodes,
      members,
      { snapRadius: 1.0, gridSize: 0 },
    )
    expect(result.type).toBe('none')
  })

  it('node takes priority over midpoint', () => {
    // nodeC is at (5,5,0), midpoint of AB is at (5,0,0)
    // cursor at (5.1, 4.5, 0) — within 1m of nodeC AND midpoint, but nodeC is closer
    const result = snapPoint3D({ x: 5.1, y: 4.5, z: 0 }, nodes, members, opts)
    expect(result.type).toBe('node')
    expect(result.sourceId).toBe('c')
  })

  it('works with empty model', () => {
    const result = snapPoint3D({ x: 1.7, y: 0, z: 2.3 }, [], [], opts)
    expect(result.type).toBe('grid')
    expect(result.point.x).toBeCloseTo(2)
    expect(result.point.z).toBeCloseTo(2)
  })

  it('snaps in all three dimensions', () => {
    const node3d = createNode({ id: 'd', position: { x: 1, y: 3, z: 7 } })
    const result = snapPoint3D(
      { x: 1.2, y: 3.1, z: 6.8 },
      [node3d],
      [],
      opts,
    )
    expect(result.type).toBe('node')
    expect(result.point).toEqual({ x: 1, y: 3, z: 7 })
  })

  it('grid snap rounds correctly in 3D', () => {
    const result = snapPoint3D(
      { x: 2.6, y: 1.4, z: -0.7 },
      [],
      [],
      { snapRadius: 0.1, gridSize: 0.5 },
    )
    expect(result.type).toBe('grid')
    expect(result.point.x).toBeCloseTo(2.5)
    expect(result.point.y).toBeCloseTo(1.5)
    expect(result.point.z).toBeCloseTo(-0.5)
  })
})
