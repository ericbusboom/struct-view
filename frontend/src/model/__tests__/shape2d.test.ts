import { describe, it, expect } from 'vitest'
import {
  Shape2DNodeSchema,
  Shape2DMemberSchema,
  Shape2DSchema,
  ProjectSchema,
  createShape2D,
  createProject,
} from '../index'

describe('Shape2DNodeSchema', () => {
  it('validates a well-formed node', () => {
    const result = Shape2DNodeSchema.safeParse({ id: 'n1', x: 1.5, y: -2.3 })
    expect(result.success).toBe(true)
  })

  it('rejects missing id', () => {
    const result = Shape2DNodeSchema.safeParse({ x: 0, y: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects non-finite coordinates', () => {
    const result = Shape2DNodeSchema.safeParse({ id: 'n1', x: Infinity, y: 0 })
    expect(result.success).toBe(false)
  })
})

describe('Shape2DMemberSchema', () => {
  it('validates a well-formed member', () => {
    const result = Shape2DMemberSchema.safeParse({
      id: 'm1',
      startNode: 'n1',
      endNode: 'n2',
      isSnapEdge: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isSnapEdge).toBe(true)
    }
  })

  it('defaults isSnapEdge to false when omitted', () => {
    const result = Shape2DMemberSchema.safeParse({
      id: 'm1',
      startNode: 'n1',
      endNode: 'n2',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isSnapEdge).toBe(false)
    }
  })

  it('rejects missing startNode', () => {
    const result = Shape2DMemberSchema.safeParse({
      id: 'm1',
      endNode: 'n2',
    })
    expect(result.success).toBe(false)
  })
})

describe('Shape2DSchema', () => {
  it('validates a complete shape', () => {
    const shape = {
      id: 's1',
      name: 'Test Truss',
      nodes: [
        { id: 'n1', x: 0, y: 0 },
        { id: 'n2', x: 4, y: 0 },
        { id: 'n3', x: 2, y: 2 },
      ],
      members: [
        { id: 'm1', startNode: 'n1', endNode: 'n2', isSnapEdge: true },
        { id: 'm2', startNode: 'n1', endNode: 'n3' },
        { id: 'm3', startNode: 'n2', endNode: 'n3' },
      ],
    }
    const result = Shape2DSchema.safeParse(shape)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.members[0].isSnapEdge).toBe(true)
      expect(result.data.members[1].isSnapEdge).toBe(false)
    }
  })

  it('rejects shape with missing name', () => {
    const result = Shape2DSchema.safeParse({
      id: 's1',
      nodes: [],
      members: [],
    })
    expect(result.success).toBe(false)
  })
})

describe('ProjectSchema with shapes', () => {
  it('round-trips a project with shapes', () => {
    const project = createProject({
      name: 'Shape Test',
      shapes: [
        {
          id: 's1',
          name: 'Triangle',
          placementPlane: 'XZ',
          nodes: [
            { id: 'n1', x: 0, y: 0 },
            { id: 'n2', x: 3, y: 0 },
            { id: 'n3', x: 1.5, y: 2 },
          ],
          members: [
            { id: 'm1', startNode: 'n1', endNode: 'n2', isSnapEdge: true },
            { id: 'm2', startNode: 'n2', endNode: 'n3', isSnapEdge: false },
            { id: 'm3', startNode: 'n3', endNode: 'n1', isSnapEdge: false },
          ],
        },
      ],
    })

    const json = JSON.stringify(project)
    const parsed = ProjectSchema.safeParse(JSON.parse(json))
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.shapes).toHaveLength(1)
      expect(parsed.data.shapes[0].name).toBe('Triangle')
      expect(parsed.data.shapes[0].members[0].isSnapEdge).toBe(true)
      expect(parsed.data.shapes[0].nodes).toHaveLength(3)
    }
  })

  it('accepts legacy JSON without shapes key and fills default', () => {
    const legacyProject = {
      name: 'Old Project',
      nodes: [],
      members: [],
      panels: [],
      loads: [],
      load_cases: [],
      combinations: [],
    }
    const result = ProjectSchema.safeParse(legacyProject)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.shapes).toEqual([])
    }
  })
})

describe('createShape2D', () => {
  it('returns a valid shape with a unique id', () => {
    const shape = createShape2D('My Truss')
    expect(shape.name).toBe('My Truss')
    expect(shape.id).toBeTruthy()
    expect(shape.nodes).toEqual([])
    expect(shape.members).toEqual([])

    const result = Shape2DSchema.safeParse(shape)
    expect(result.success).toBe(true)
  })

  it('uses default name when none provided', () => {
    const shape = createShape2D()
    expect(shape.name).toBe('Untitled Shape')
  })

  it('generates unique ids across calls', () => {
    const a = createShape2D()
    const b = createShape2D()
    expect(a.id).not.toBe(b.id)
  })
})
