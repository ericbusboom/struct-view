import { describe, it, expect, beforeEach } from 'vitest'
import { useEditor2DStore } from '../useEditor2DStore'
import { Shape2DSchema } from '../../model'

beforeEach(() => {
  useEditor2DStore.getState().resetShape('Test Shape')
})

describe('useEditor2DStore', () => {
  it('draw-node adds a node to the shape', () => {
    const id = useEditor2DStore.getState().addNode(3, 4)
    const { shape } = useEditor2DStore.getState()
    expect(shape.nodes).toHaveLength(1)
    expect(shape.nodes[0]).toEqual({ id, x: 3, y: 4 })
  })

  it('draw-segment creates a member between two nodes', () => {
    const store = useEditor2DStore.getState()
    const n1 = store.addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(5, 0)
    useEditor2DStore.getState().addMember(n1, n2)
    const { shape } = useEditor2DStore.getState()
    expect(shape.members).toHaveLength(1)
    expect(shape.members[0].startNode).toBe(n1)
    expect(shape.members[0].endNode).toBe(n2)
  })

  it('draw-segment does not create duplicate members', () => {
    const store = useEditor2DStore.getState()
    const n1 = store.addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(5, 0)
    useEditor2DStore.getState().addMember(n1, n2)
    useEditor2DStore.getState().addMember(n1, n2)
    useEditor2DStore.getState().addMember(n2, n1) // reverse direction
    expect(useEditor2DStore.getState().shape.members).toHaveLength(1)
  })

  it('draw-segment does not create self-referencing member', () => {
    const n1 = useEditor2DStore.getState().addNode(0, 0)
    useEditor2DStore.getState().addMember(n1, n1)
    expect(useEditor2DStore.getState().shape.members).toHaveLength(0)
  })

  it('delete node removes it and its connected members', () => {
    const store = useEditor2DStore.getState()
    const n1 = store.addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(5, 0)
    const n3 = useEditor2DStore.getState().addNode(2.5, 3)
    useEditor2DStore.getState().addMember(n1, n2)
    useEditor2DStore.getState().addMember(n1, n3)
    useEditor2DStore.getState().addMember(n2, n3)
    expect(useEditor2DStore.getState().shape.members).toHaveLength(3)

    // Delete n1 — should remove 2 members connected to it
    useEditor2DStore.getState().deleteEntity(n1)
    const { shape } = useEditor2DStore.getState()
    expect(shape.nodes).toHaveLength(2)
    expect(shape.members).toHaveLength(1)
    expect(shape.members[0].startNode).toBe(n2)
    expect(shape.members[0].endNode).toBe(n3)
  })

  it('delete member removes only the member, not the nodes', () => {
    const store = useEditor2DStore.getState()
    const n1 = store.addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(5, 0)
    useEditor2DStore.getState().addMember(n1, n2)
    const memberId = useEditor2DStore.getState().shape.members[0].id

    useEditor2DStore.getState().deleteEntity(memberId)
    const { shape } = useEditor2DStore.getState()
    expect(shape.nodes).toHaveLength(2)
    expect(shape.members).toHaveLength(0)
  })

  it('select followed by move updates node coordinates', () => {
    const n1 = useEditor2DStore.getState().addNode(1, 2)
    useEditor2DStore.getState().selectEntity(n1)
    expect(useEditor2DStore.getState().selectedIds.has(n1)).toBe(true)

    useEditor2DStore.getState().moveNode(n1, 10, 20)
    const node = useEditor2DStore.getState().shape.nodes[0]
    expect(node.x).toBe(10)
    expect(node.y).toBe(20)
  })

  it('switching tool mode resets pending segment start', () => {
    const n1 = useEditor2DStore.getState().addNode(0, 0)
    useEditor2DStore.getState().setPendingSegmentStart(n1)
    expect(useEditor2DStore.getState().pendingSegmentStart).toBe(n1)

    useEditor2DStore.getState().setTool('select')
    expect(useEditor2DStore.getState().pendingSegmentStart).toBeNull()
    expect(useEditor2DStore.getState().selectedIds.size).toBe(0)
  })

  it('generated shape validates against Shape2DSchema', () => {
    const store = useEditor2DStore.getState()
    const n1 = store.addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(3, 0)
    const n3 = useEditor2DStore.getState().addNode(1.5, 2)
    useEditor2DStore.getState().addMember(n1, n2)
    useEditor2DStore.getState().addMember(n2, n3)
    useEditor2DStore.getState().addMember(n3, n1)

    const { shape } = useEditor2DStore.getState()
    const result = Shape2DSchema.safeParse(shape)
    expect(result.success).toBe(true)
  })
})
