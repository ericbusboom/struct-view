import { describe, it, expect, beforeEach } from 'vitest'
import { usePlacementStore } from '../../store/usePlacementStore'
import { useModelStore } from '../../store/useModelStore'
import { commitPlacement } from '../commitPlacement'
import { createShape2D, createNode } from '../../model'

function makeTriangleShape() {
  const shape = createShape2D('Triangle')
  shape.nodes = [
    { id: 'a', x: 0, y: 0 },
    { id: 'b', x: 10, y: 0 },
    { id: 'c', x: 5, y: 5 },
  ]
  shape.members = [
    { id: 'm1', startNode: 'a', endNode: 'b', isSnapEdge: true },
    { id: 'm2', startNode: 'b', endNode: 'c', isSnapEdge: false },
    { id: 'm3', startNode: 'a', endNode: 'c', isSnapEdge: false },
  ]
  return shape
}

beforeEach(() => {
  usePlacementStore.getState().cancel()
  useModelStore.setState({ nodes: [], members: [], shapes: [] })
})

describe('commitPlacement', () => {
  it('commits a single placement to the model store', () => {
    const shape = makeTriangleShape()
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })

    commitPlacement()

    const { nodes, members } = useModelStore.getState()
    expect(nodes).toHaveLength(3)
    expect(members).toHaveLength(3)
    // Placement store should be reset
    expect(usePlacementStore.getState().phase).toBe('idle')
  })

  it('merges coincident nodes with existing model', () => {
    const existingNode = createNode({ id: 'existing', position: { x: 0, y: 0, z: 0 } })
    useModelStore.setState({ nodes: [existingNode], members: [] })

    const shape = makeTriangleShape()
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })

    commitPlacement()

    const { nodes, members } = useModelStore.getState()
    // One node should merge with existing, so 1 existing + 2 new = 3
    expect(nodes).toHaveLength(3)
    expect(members).toHaveLength(3)
  })

  it('does nothing when shape or targetEdge is missing', () => {
    commitPlacement()
    const { nodes, members } = useModelStore.getState()
    expect(nodes).toHaveLength(0)
    expect(members).toHaveLength(0)
  })

  it('commits equal spacing placement with count > 1', () => {
    const shape = makeTriangleShape()
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 30, y: 0, z: 0 },
    })
    usePlacementStore.getState().setCount(2)

    commitPlacement()

    const { nodes, members } = useModelStore.getState()
    // 2 copies of 3 nodes with some merging at shared positions
    expect(nodes.length).toBeGreaterThan(3)
    expect(members.length).toBeGreaterThan(3)
    expect(usePlacementStore.getState().phase).toBe('idle')
  })
})
