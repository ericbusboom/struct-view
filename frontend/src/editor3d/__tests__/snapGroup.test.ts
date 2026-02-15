import { describe, it, expect } from 'vitest'
import { findGroupSnap } from '../groupSnap'
import { createNode } from '../../model'

describe('findGroupSnap', () => {
  it('returns null when no targets are within threshold', () => {
    const trussNodes = [
      createNode({ id: 't1', position: { x: 0, y: 0, z: 0 }, groupId: 'truss-1' }),
    ]
    const allNodes = [
      ...trussNodes,
      createNode({ id: 'n1', position: { x: 10, y: 0, z: 0 } }),
    ]
    const result = findGroupSnap(trussNodes, allNodes, 'truss-1', 0.5)
    expect(result).toBeNull()
  })

  it('finds the closest snap candidate', () => {
    const trussNodes = [
      createNode({ id: 't1', position: { x: 0, y: 0, z: 0 }, groupId: 'truss-1' }),
      createNode({ id: 't2', position: { x: 5, y: 0, z: 0 }, groupId: 'truss-1' }),
    ]
    const allNodes = [
      ...trussNodes,
      createNode({ id: 'n1', position: { x: 5.2, y: 0, z: 0 } }),
      createNode({ id: 'n2', position: { x: 0.4, y: 0, z: 0 } }),
    ]
    const result = findGroupSnap(trussNodes, allNodes, 'truss-1', 0.5)
    expect(result).not.toBeNull()
    expect(result!.groupNodeId).toBe('t2')
    expect(result!.targetNodeId).toBe('n1')
    expect(result!.distance).toBeCloseTo(0.2)
  })

  it('ignores nodes from the same truss', () => {
    const trussNodes = [
      createNode({ id: 't1', position: { x: 0, y: 0, z: 0 }, groupId: 'truss-1' }),
    ]
    const allNodes = [
      ...trussNodes,
      createNode({ id: 't2', position: { x: 0.1, y: 0, z: 0 }, groupId: 'truss-1' }),
    ]
    const result = findGroupSnap(trussNodes, allNodes, 'truss-1', 0.5)
    expect(result).toBeNull()
  })

  it('computes correct delta for co-location', () => {
    const trussNodes = [
      createNode({ id: 't1', position: { x: 1, y: 2, z: 3 }, groupId: 'truss-1' }),
    ]
    const allNodes = [
      ...trussNodes,
      createNode({ id: 'n1', position: { x: 1.1, y: 2.2, z: 3.3 } }),
    ]
    const result = findGroupSnap(trussNodes, allNodes, 'truss-1', 1.0)
    expect(result).not.toBeNull()
    expect(result!.delta.x).toBeCloseTo(0.1)
    expect(result!.delta.y).toBeCloseTo(0.2)
    expect(result!.delta.z).toBeCloseTo(0.3)
  })

  it('returns null for empty truss nodes', () => {
    const result = findGroupSnap([], [], 'truss-1', 0.5)
    expect(result).toBeNull()
  })

  it('works with nodes from a different truss as targets', () => {
    const trussNodes = [
      createNode({ id: 't1', position: { x: 0, y: 0, z: 0 }, groupId: 'truss-1' }),
    ]
    const allNodes = [
      ...trussNodes,
      createNode({ id: 'o1', position: { x: 0.3, y: 0, z: 0 }, groupId: 'truss-2' }),
    ]
    const result = findGroupSnap(trussNodes, allNodes, 'truss-1', 0.5)
    expect(result).not.toBeNull()
    expect(result!.targetNodeId).toBe('o1')
  })

  it('respects threshold exactly', () => {
    const trussNodes = [
      createNode({ id: 't1', position: { x: 0, y: 0, z: 0 }, groupId: 'truss-1' }),
    ]
    const allNodes = [
      ...trussNodes,
      createNode({ id: 'n1', position: { x: 0.5, y: 0, z: 0 } }),
    ]
    // Exactly at threshold should snap
    const result = findGroupSnap(trussNodes, allNodes, 'truss-1', 0.5)
    expect(result).not.toBeNull()

    // Just over threshold should not snap
    const allNodes2 = [
      ...trussNodes,
      createNode({ id: 'n2', position: { x: 0.51, y: 0, z: 0 } }),
    ]
    const result2 = findGroupSnap(trussNodes, allNodes2, 'truss-1', 0.5)
    expect(result2).toBeNull()
  })
})
