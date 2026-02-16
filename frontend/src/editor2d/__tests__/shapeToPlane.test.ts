import { describe, it, expect } from 'vitest'
import { worldToPlane2D, plane2DToWorld, saveToShape2D, placeShapeOnPlane } from '../shapeToPlane'
import { createPlaneFromPoints, _resetPlaneIdCounter } from '../../model'
import { createNode, createMember } from '../../model'
import type { WorkingPlane } from '../../model'

function makePlane(points: { x: number; y: number; z: number }[]): WorkingPlane {
  _resetPlaneIdCounter()
  return createPlaneFromPoints(points)
}

describe('worldToPlane2D / plane2DToWorld', () => {
  it('round-trips on the XY ground plane (normal = Z)', () => {
    const plane = makePlane([])
    const pos = { x: 3, y: 4, z: 0 }
    const { u, v } = worldToPlane2D(pos, plane)
    const back = plane2DToWorld(u, v, plane)
    expect(back.x).toBeCloseTo(pos.x)
    expect(back.y).toBeCloseTo(pos.y)
    expect(back.z).toBeCloseTo(pos.z)
  })

  it('round-trips on a vertical XZ plane (normal = Y)', () => {
    // 3 points on XZ plane at y=0
    const plane = makePlane([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
    ])
    const pos = { x: 5, y: 0, z: 3 }
    const { u, v } = worldToPlane2D(pos, plane)
    const back = plane2DToWorld(u, v, plane)
    expect(back.x).toBeCloseTo(pos.x)
    expect(back.y).toBeCloseTo(pos.y)
    expect(back.z).toBeCloseTo(pos.z)
  })

  it('round-trips on an offset plane', () => {
    const plane = makePlane([
      { x: 2, y: 3, z: 0 },
      { x: 3, y: 3, z: 0 },
      { x: 2, y: 4, z: 0 },
    ])
    const pos = { x: 5, y: 7, z: 0 }
    const { u, v } = worldToPlane2D(pos, plane)
    const back = plane2DToWorld(u, v, plane)
    expect(back.x).toBeCloseTo(pos.x)
    expect(back.y).toBeCloseTo(pos.y)
    expect(back.z).toBeCloseTo(pos.z)
  })
})

describe('saveToShape2D', () => {
  it('projects nodes to 2D and normalizes to origin', () => {
    const plane = makePlane([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
    ])
    const n1 = createNode({ id: 'n1', position: { x: 2, y: 0, z: 1 } })
    const n2 = createNode({ id: 'n2', position: { x: 4, y: 0, z: 3 } })
    const m1 = createMember('n1', 'n2', { id: 'm1' })

    const shape = saveToShape2D([n1, n2], [m1], plane, 'Test')
    expect(shape.name).toBe('Test')
    expect(shape.nodes).toHaveLength(2)
    expect(shape.members).toHaveLength(1)

    // min should be at (0, 0)
    const xs = shape.nodes.map((n) => n.x)
    const ys = shape.nodes.map((n) => n.y)
    expect(Math.min(...xs)).toBeCloseTo(0)
    expect(Math.min(...ys)).toBeCloseTo(0)
  })

  it('excludes members that span outside the node set', () => {
    const plane = makePlane([])
    const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
    const n2 = createNode({ id: 'n2', position: { x: 1, y: 0, z: 0 } })
    const m1 = createMember('n1', 'n2', { id: 'm1' })
    const m2 = createMember('n1', 'n3', { id: 'm2' }) // n3 not in set

    const shape = saveToShape2D([n1, n2], [m1, m2], plane, 'Partial')
    expect(shape.members).toHaveLength(1)
    expect(shape.members[0].startNode).toBe('n1')
  })
})

describe('placeShapeOnPlane', () => {
  it('creates 3D nodes at correct positions', () => {
    const plane = makePlane([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
    ])
    const shape = {
      id: 's1',
      name: 'Test',
      nodes: [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 2, y: 1 },
      ],
      members: [{ id: 'mb', startNode: 'a', endNode: 'b', isSnapEdge: false }],
      placementPlane: 'XZ' as const,
    }

    const result = placeShapeOnPlane(shape, plane, { u: 1, v: 0 })
    expect(result.nodes).toHaveLength(2)
    expect(result.members).toHaveLength(1)

    // Node 'a' placed at offset (1, 0) on the plane
    const nodeA = result.nodes[0]
    const posA = plane2DToWorld(1, 0, plane)
    expect(nodeA.position.x).toBeCloseTo(posA.x)
    expect(nodeA.position.y).toBeCloseTo(posA.y)
    expect(nodeA.position.z).toBeCloseTo(posA.z)

    // Member references the new node IDs, not the shape IDs
    expect(result.members[0].start_node).toBe(result.nodes[0].id)
    expect(result.members[0].end_node).toBe(result.nodes[1].id)
  })

  it('generates unique IDs for placed nodes', () => {
    const plane = makePlane([])
    const shape = {
      id: 's1',
      name: 'Test',
      nodes: [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 1, y: 0 },
      ],
      members: [],
      placementPlane: 'XZ' as const,
    }

    const r1 = placeShapeOnPlane(shape, plane, { u: 0, v: 0 })
    const r2 = placeShapeOnPlane(shape, plane, { u: 5, v: 0 })

    // IDs should be different between placements
    expect(r1.nodes[0].id).not.toBe(r2.nodes[0].id)
  })
})
