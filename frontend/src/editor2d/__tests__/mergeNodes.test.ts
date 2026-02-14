import { describe, it, expect } from 'vitest'
import { mergeCoincidentNodes, applyNodeRemap, MERGE_TOLERANCE } from '../mergeNodes'
import { createNode, createMember } from '../../model'

function nodeAt(id: string, x: number, y: number, z: number) {
  return createNode({ id, position: { x, y, z } })
}

describe('mergeCoincidentNodes', () => {
  it('merges nodes within 0.0005m (well within tolerance)', () => {
    const existing = [nodeAt('e1', 0, 0, 0)]
    const newNodes = [nodeAt('n1', 0.0005, 0, 0)]
    const { mergedNodes, remapTable } = mergeCoincidentNodes(existing, newNodes)
    expect(mergedNodes).toHaveLength(0)
    expect(remapTable.get('n1')).toBe('e1')
  })

  it('does NOT merge nodes at 0.002m (beyond tolerance)', () => {
    const existing = [nodeAt('e1', 0, 0, 0)]
    const newNodes = [nodeAt('n1', 0.002, 0, 0)]
    const { mergedNodes, remapTable } = mergeCoincidentNodes(existing, newNodes)
    expect(mergedNodes).toHaveLength(1)
    expect(remapTable.size).toBe(0)
  })

  it('merges at exactly tolerance distance (inclusive)', () => {
    const existing = [nodeAt('e1', 0, 0, 0)]
    const newNodes = [nodeAt('n1', MERGE_TOLERANCE, 0, 0)]
    const { mergedNodes, remapTable } = mergeCoincidentNodes(existing, newNodes)
    expect(mergedNodes).toHaveLength(0)
    expect(remapTable.get('n1')).toBe('e1')
  })

  it('multiple new nodes merging to the same existing node', () => {
    const existing = [nodeAt('e1', 0, 0, 0)]
    const newNodes = [
      nodeAt('n1', 0.0003, 0, 0),
      nodeAt('n2', 0, 0.0004, 0),
    ]
    const { mergedNodes, remapTable } = mergeCoincidentNodes(existing, newNodes)
    expect(mergedNodes).toHaveLength(0)
    expect(remapTable.get('n1')).toBe('e1')
    expect(remapTable.get('n2')).toBe('e1')
  })

  it('with zero existing nodes, returns all new nodes unchanged', () => {
    const newNodes = [nodeAt('n1', 1, 2, 3), nodeAt('n2', 4, 5, 6)]
    const { mergedNodes, remapTable } = mergeCoincidentNodes([], newNodes)
    expect(mergedNodes).toHaveLength(2)
    expect(remapTable.size).toBe(0)
  })
})

describe('applyNodeRemap', () => {
  it('correctly updates member start/end references', () => {
    const members = [createMember('n1', 'n2')]
    const remap = new Map([['n1', 'e1']])
    const result = applyNodeRemap(members, remap)
    expect(result).toHaveLength(1)
    expect(result[0].start_node).toBe('e1')
    expect(result[0].end_node).toBe('n2')
  })

  it('removes degenerate member where start === end after remap', () => {
    const members = [createMember('n1', 'n2')]
    const remap = new Map([['n1', 'e1'], ['n2', 'e1']])
    const result = applyNodeRemap(members, remap)
    expect(result).toHaveLength(0)
  })

  it('preserves members when remap table is empty', () => {
    const members = [createMember('n1', 'n2'), createMember('n2', 'n3')]
    const result = applyNodeRemap(members, new Map())
    expect(result).toHaveLength(2)
  })
})
