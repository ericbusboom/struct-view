import { describe, it, expect } from 'vitest'
import { computeEqualSpacingPositions, placeEqualSpacing } from '../equalSpacing'
import type { Shape2D } from '../../model'
import { createNode } from '../../model'

describe('computeEqualSpacingPositions', () => {
  it('count=3 on a 10m edge returns positions at 0m, 5m, and 10m', () => {
    const positions = computeEqualSpacingPositions(
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      3,
    )
    expect(positions).toHaveLength(3)
    expect(positions[0].x).toBeCloseTo(0)
    expect(positions[1].x).toBeCloseTo(5)
    expect(positions[2].x).toBeCloseTo(10)
  })

  it('count=1 returns the midpoint', () => {
    const positions = computeEqualSpacingPositions(
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      1,
    )
    expect(positions).toHaveLength(1)
    expect(positions[0].x).toBeCloseTo(5)
    expect(positions[0].y).toBeCloseTo(0)
    expect(positions[0].z).toBeCloseTo(0)
  })

  it('count=2 returns start and end', () => {
    const positions = computeEqualSpacingPositions(
      { x: 2, y: 3, z: 0 },
      { x: 8, y: 3, z: 0 },
      2,
    )
    expect(positions).toHaveLength(2)
    expect(positions[0].x).toBeCloseTo(2)
    expect(positions[1].x).toBeCloseTo(8)
  })

  it('count=0 returns empty', () => {
    expect(computeEqualSpacingPositions(
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      0,
    )).toHaveLength(0)
  })
})

describe('placeEqualSpacing', () => {
  // Simple 2-node horizontal shape: snap edge from (0,0) to (2,0)
  const simpleShape: Shape2D = {
    id: 'simple',
    name: 'Simple',
    nodes: [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 2, y: 0 },
    ],
    members: [
      { id: 'm1', startNode: 'a', endNode: 'b', isSnapEdge: true },
    ],
  }

  it('places 3 copies without merging nodes', () => {
    const result = placeEqualSpacing(
      simpleShape,
      { start: { x: 0, y: 0, z: 0 }, end: { x: 10, y: 0, z: 0 } },
      3,
      [],
    )
    // 3 copies × 2 nodes = 6 nodes, no merging
    expect(result.nodes).toHaveLength(6)
    expect(result.members).toHaveLength(3)
  })

  it('places 2 copies without merging against existing nodes', () => {
    const existing = [createNode({ id: 'e1', position: { x: 0, y: 0, z: 0 } })]
    const result = placeEqualSpacing(
      simpleShape,
      { start: { x: 0, y: 0, z: 0 }, end: { x: 10, y: 0, z: 0 } },
      2,
      existing,
    )
    // 2 copies × 2 nodes = 4 new nodes, no merging with existing
    expect(result.nodes).toHaveLength(4)
    expect(result.members).toHaveLength(2)
  })
})
