import { describe, it, expect, beforeEach } from 'vitest'
import { usePlacementStore } from '../usePlacementStore'
import { createShape2D } from '../../model'

function makeTestShape() {
  const shape = createShape2D('Test Truss')
  shape.nodes = [
    { id: 'n1', x: 0, y: 0 },
    { id: 'n2', x: 10, y: 0 },
    { id: 'n3', x: 5, y: 5 },
  ]
  shape.members = [
    { id: 'm1', startNode: 'n1', endNode: 'n2', isSnapEdge: true },
    { id: 'm2', startNode: 'n1', endNode: 'n3', isSnapEdge: false },
    { id: 'm3', startNode: 'n2', endNode: 'n3', isSnapEdge: false },
  ]
  return shape
}

beforeEach(() => {
  usePlacementStore.getState().cancel()
})

describe('Placement store', () => {
  it('starts in idle phase', () => {
    expect(usePlacementStore.getState().phase).toBe('idle')
    expect(usePlacementStore.getState().shape).toBeNull()
  })

  it('startPlacement transitions to picking-edge', () => {
    const shape = makeTestShape()
    usePlacementStore.getState().startPlacement(shape)
    const state = usePlacementStore.getState()
    expect(state.phase).toBe('picking-edge')
    expect(state.shapeId).toBe(shape.id)
    expect(state.shape).toEqual(shape)
    expect(state.offset).toBe(0)
    expect(state.count).toBe(1)
  })

  it('setEdgeStart + setEdgeEnd transitions to previewing', () => {
    const shape = makeTestShape()
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setEdgeStart({ x: 0, y: 0, z: 0 })
    usePlacementStore.getState().setEdgeEnd({ x: 10, y: 0, z: 0 })

    const state = usePlacementStore.getState()
    expect(state.phase).toBe('previewing')
    expect(state.targetEdge).toEqual({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })
  })

  it('setTargetEdge directly transitions to previewing', () => {
    const shape = makeTestShape()
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 3, z: 0 },
      end: { x: 5, y: 3, z: 0 },
    })
    expect(usePlacementStore.getState().phase).toBe('previewing')
  })

  it('setEdgeEnd without edgeStart does nothing', () => {
    const shape = makeTestShape()
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setEdgeEnd({ x: 10, y: 0, z: 0 })
    expect(usePlacementStore.getState().phase).toBe('picking-edge')
    expect(usePlacementStore.getState().targetEdge).toBeNull()
  })

  it('setOffset and setCount update values', () => {
    usePlacementStore.getState().setOffset(0.5)
    expect(usePlacementStore.getState().offset).toBe(0.5)

    usePlacementStore.getState().setCount(5)
    expect(usePlacementStore.getState().count).toBe(5)
  })

  it('setCount clamps to minimum 1', () => {
    usePlacementStore.getState().setCount(0)
    expect(usePlacementStore.getState().count).toBe(1)

    usePlacementStore.getState().setCount(-3)
    expect(usePlacementStore.getState().count).toBe(1)
  })

  it('cancel resets to idle', () => {
    const shape = makeTestShape()
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setEdgeStart({ x: 0, y: 0, z: 0 })
    usePlacementStore.getState().setEdgeEnd({ x: 10, y: 0, z: 0 })
    usePlacementStore.getState().setOffset(0.3)
    usePlacementStore.getState().setCount(4)

    usePlacementStore.getState().cancel()
    const state = usePlacementStore.getState()
    expect(state.phase).toBe('idle')
    expect(state.shape).toBeNull()
    expect(state.targetEdge).toBeNull()
    expect(state.offset).toBe(0)
    expect(state.count).toBe(1)
  })

  it('confirmPlacement resets to idle', () => {
    const shape = makeTestShape()
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })
    usePlacementStore.getState().confirmPlacement()
    expect(usePlacementStore.getState().phase).toBe('idle')
  })

  it('beginAdjusting only works from previewing phase', () => {
    const shape = makeTestShape()
    usePlacementStore.getState().startPlacement(shape)
    usePlacementStore.getState().beginAdjusting()
    // Should not transition from picking-edge
    expect(usePlacementStore.getState().phase).toBe('picking-edge')

    usePlacementStore.getState().setTargetEdge({
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })
    expect(usePlacementStore.getState().phase).toBe('previewing')
    usePlacementStore.getState().beginAdjusting()
    expect(usePlacementStore.getState().phase).toBe('adjusting')
  })
})
