import { describe, it, expect } from 'vitest'
import { placeShape } from '../placeShape'
import type { Shape2D } from '../../model'
import { NodeSchema, MemberSchema } from '../../model'

// Simple 2-node shape: horizontal snap edge from (0,0) to (4,0), one node at (2,2)
function makeTestShape(): Shape2D {
  return {
    id: 'test-shape',
    name: 'Test',
    placementPlane: 'XZ',
    nodes: [
      { id: 'n1', x: 0, y: 0 },
      { id: 'n2', x: 4, y: 0 },
      { id: 'n3', x: 2, y: 2 },
    ],
    members: [
      { id: 'm1', startNode: 'n1', endNode: 'n2', isSnapEdge: true },
      { id: 'm2', startNode: 'n1', endNode: 'n3', isSnapEdge: false },
      { id: 'm3', startNode: 'n2', endNode: 'n3', isSnapEdge: false },
    ],
  }
}

describe('placeShape', () => {
  it('aligns snap edge to target edge and produces correct world coordinates', () => {
    const shape = makeTestShape()
    // Target edge along X axis in 3D: from (0,0,0) to (8,0,0)
    // Shape snap edge is 4 units, target is 8 units → scale = 2
    const result = placeShape(shape, {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 8, y: 0, z: 0 },
    })

    expect(result.nodes).toHaveLength(3)
    expect(result.members).toHaveLength(3)

    // n1 (0,0) maps to (0,0,0)
    const p1 = result.nodes[0].position
    expect(p1.x).toBeCloseTo(0)
    expect(p1.y).toBeCloseTo(0)
    expect(p1.z).toBeCloseTo(0)

    // n2 (4,0) maps to (8,0,0)
    const p2 = result.nodes[1].position
    expect(p2.x).toBeCloseTo(8)
    expect(p2.y).toBeCloseTo(0)
    expect(p2.z).toBeCloseTo(0)

    // n3 (2,2) maps to (4, ?, ?) — x = 2*2 = 4, y perpendicular
    const p3 = result.nodes[2].position
    expect(p3.x).toBeCloseTo(4)
    // y should be 4 (2*scale) in the perpendicular direction
    // The perpendicular to X axis should be in the Y direction
    expect(Math.abs(p3.y) + Math.abs(p3.z)).toBeCloseTo(4)
  })

  it('sliding along target edge with offset translates all nodes uniformly', () => {
    const shape = makeTestShape()
    const target = {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 8, y: 0, z: 0 },
    }

    const r0 = placeShape(shape, target, 0)
    const r1 = placeShape(shape, target, 0.5)

    // All nodes should shift by the same offset
    for (let i = 0; i < r0.nodes.length; i++) {
      const dx = r1.nodes[i].position.x - r0.nodes[i].position.x
      const dy = r1.nodes[i].position.y - r0.nodes[i].position.y
      const dz = r1.nodes[i].position.z - r0.nodes[i].position.z
      // Offset of 0.5 along 8-unit edge = 4 units in X
      expect(dx).toBeCloseTo(4)
      expect(dy).toBeCloseTo(0)
      expect(dz).toBeCloseTo(0)
    }
  })

  it('generated nodes and members have unique ids and valid references', () => {
    const shape = makeTestShape()
    const result = placeShape(shape, {
      start: { x: 0, y: 5, z: 0 },
      end: { x: 10, y: 5, z: 0 },
    })

    // All node ids should be unique
    const nodeIds = result.nodes.map((n) => n.id)
    expect(new Set(nodeIds).size).toBe(nodeIds.length)

    // All member ids should be unique
    const memberIds = result.members.map((m) => m.id)
    expect(new Set(memberIds).size).toBe(memberIds.length)

    // Each member should reference existing node ids
    const nodeIdSet = new Set(nodeIds)
    for (const m of result.members) {
      expect(nodeIdSet.has(m.start_node)).toBe(true)
      expect(nodeIdSet.has(m.end_node)).toBe(true)
    }

    // All nodes and members pass schema validation
    for (const n of result.nodes) {
      expect(NodeSchema.safeParse(n).success).toBe(true)
    }
    for (const m of result.members) {
      expect(MemberSchema.safeParse(m).success).toBe(true)
    }
  })

  it('works with a vertical target edge (along Y axis)', () => {
    const shape: Shape2D = {
      id: 's',
      name: 'Simple',
      placementPlane: 'XZ',
      nodes: [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 3, y: 0 },
      ],
      members: [
        { id: 'm', startNode: 'a', endNode: 'b', isSnapEdge: true },
      ],
    }

    const result = placeShape(shape, {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 0, y: 6, z: 0 },
    })

    expect(result.nodes).toHaveLength(2)
    // Node a at origin
    expect(result.nodes[0].position.x).toBeCloseTo(0)
    expect(result.nodes[0].position.y).toBeCloseTo(0)
    expect(result.nodes[0].position.z).toBeCloseTo(0)
    // Node b at (0,6,0)
    expect(result.nodes[1].position.x).toBeCloseTo(0)
    expect(result.nodes[1].position.y).toBeCloseTo(6)
    expect(result.nodes[1].position.z).toBeCloseTo(0)
  })

  it('returns empty result for empty shape', () => {
    const shape: Shape2D = { id: 's', name: 'Empty', placementPlane: 'XZ', nodes: [], members: [] }
    const result = placeShape(shape, {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 5, y: 0, z: 0 },
    })
    expect(result.nodes).toHaveLength(0)
    expect(result.members).toHaveLength(0)
  })
})
