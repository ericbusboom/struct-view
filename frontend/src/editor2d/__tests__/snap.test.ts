import { describe, it, expect } from 'vitest'
import { snapPoint } from '../snap'
import type { Shape2DNode, Shape2DMember } from '../../model'

const makeNode = (id: string, x: number, y: number): Shape2DNode => ({ id, x, y })
const makeMember = (id: string, startNode: string, endNode: string, isSnapEdge = false): Shape2DMember => ({
  id,
  startNode,
  endNode,
  isSnapEdge,
})

describe('snapPoint', () => {
  const defaultOptions = { snapRadius: 0.5, gridSize: 1 }

  it('snaps to nearest node when within radius', () => {
    const nodes = [makeNode('n1', 3, 4)]
    const result = snapPoint({ x: 3.1, y: 4.1 }, nodes, [], defaultOptions)
    expect(result.type).toBe('node')
    expect(result.point).toEqual({ x: 3, y: 4 })
    expect(result.sourceId).toBe('n1')
  })

  it('snaps to segment midpoint when near midpoint but not near a node', () => {
    const nodes = [makeNode('n1', 0, 0), makeNode('n2', 4, 0)]
    const members = [makeMember('m1', 'n1', 'n2')]
    const result = snapPoint({ x: 2.1, y: 0.1 }, nodes, members, defaultOptions)
    expect(result.type).toBe('midpoint')
    expect(result.point.x).toBeCloseTo(2)
    expect(result.point.y).toBeCloseTo(0)
    expect(result.sourceId).toBe('m1')
  })

  it('snaps to grid when not near any node or midpoint', () => {
    const nodes = [makeNode('n1', 10, 10)]
    const result = snapPoint({ x: 2.3, y: 3.7 }, nodes, [], defaultOptions)
    expect(result.type).toBe('grid')
    expect(result.point).toEqual({ x: 2, y: 4 })
  })

  it('node wins over midpoint when equidistant (priority)', () => {
    // Node at (2, 0) and midpoint of member from (0,0)-(4,0) is also (2,0)
    // We place cursor right next to both — node should win
    const nodes = [makeNode('n1', 0, 0), makeNode('n2', 4, 0), makeNode('n3', 2, 0)]
    const members = [makeMember('m1', 'n1', 'n2')]
    const result = snapPoint({ x: 2.1, y: 0.05 }, nodes, members, defaultOptions)
    expect(result.type).toBe('node')
    expect(result.sourceId).toBe('n3')
  })

  it('returns none when gridSize is 0 and no targets', () => {
    const result = snapPoint({ x: 1.7, y: 2.3 }, [], [], { snapRadius: 0.5, gridSize: 0 })
    expect(result.type).toBe('none')
    expect(result.point).toEqual({ x: 1.7, y: 2.3 })
  })

  it('snaps to grid when no nodes or members exist', () => {
    const result = snapPoint({ x: 1.7, y: 2.3 }, [], [], defaultOptions)
    expect(result.type).toBe('grid')
    expect(result.point).toEqual({ x: 2, y: 2 })
  })

  it('picks closest node when multiple are within radius', () => {
    const nodes = [
      makeNode('n1', 1.0, 1.0),
      makeNode('n2', 1.2, 1.2),
    ]
    const result = snapPoint({ x: 1.15, y: 1.15 }, nodes, [], { snapRadius: 0.5, gridSize: 1 })
    expect(result.type).toBe('node')
    expect(result.sourceId).toBe('n2')
  })

  describe('guide detection', () => {
    it('detects perpendicular guide', () => {
      // Horizontal segment from (0,0)-(4,0). Last node at (2,0).
      // Cursor directly above at (2, 3) — perpendicular to the segment.
      const nodes = [makeNode('n1', 0, 0), makeNode('n2', 4, 0)]
      const members = [makeMember('m1', 'n1', 'n2')]
      const result = snapPoint(
        { x: 2, y: 3 },
        nodes,
        members,
        { ...defaultOptions, lastNode: { x: 2, y: 0 }, snapRadius: 0.1 },
      )
      expect(result.guides.some((g) => g.type === 'perpendicular')).toBe(true)
    })

    it('detects parallel guide', () => {
      // Horizontal segment from (0,0)-(4,0). Last node at (0,2).
      // Cursor at (3, 2) — horizontal line, parallel to the segment.
      const nodes = [makeNode('n1', 0, 0), makeNode('n2', 4, 0)]
      const members = [makeMember('m1', 'n1', 'n2')]
      const result = snapPoint(
        { x: 3, y: 2 },
        nodes,
        members,
        { ...defaultOptions, lastNode: { x: 0, y: 2 }, snapRadius: 0.1 },
      )
      expect(result.guides.some((g) => g.type === 'parallel')).toBe(true)
    })

    it('returns no guides when lastNode is not provided', () => {
      const nodes = [makeNode('n1', 0, 0), makeNode('n2', 4, 0)]
      const members = [makeMember('m1', 'n1', 'n2')]
      const result = snapPoint({ x: 2, y: 3 }, nodes, members, defaultOptions)
      expect(result.guides).toHaveLength(0)
    })
  })
})
