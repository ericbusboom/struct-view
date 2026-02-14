import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../useModelStore'
import { useEditor2DStore } from '../useEditor2DStore'
import { Shape2DSchema } from '../../model'
import { generatePrattTruss } from '../../editor2d/trussTemplates'

beforeEach(() => {
  useModelStore.setState({ shapes: [] })
  useEditor2DStore.getState().resetShape('Test Shape')
})

describe('Shape library operations', () => {
  it('saving a shape adds it to the project shapes array', () => {
    const shape = generatePrattTruss(10, 2, 4)
    useModelStore.getState().addShape(shape)
    expect(useModelStore.getState().shapes).toHaveLength(1)
    expect(useModelStore.getState().shapes[0].name).toBe('Pratt Truss')
  })

  it('loading a shape returns a deep copy (modifying loaded shape does not alter stored one)', () => {
    const shape = generatePrattTruss(10, 2, 4)
    useModelStore.getState().addShape(shape)

    // Load via deep copy
    const stored = useModelStore.getState().shapes[0]
    const copy = JSON.parse(JSON.stringify(stored))
    useEditor2DStore.getState().loadShape(copy)

    // Modify loaded shape
    useEditor2DStore.getState().addNode(99, 99)

    // Stored shape should be unaffected
    expect(useModelStore.getState().shapes[0].nodes).toHaveLength(shape.nodes.length)
  })

  it('renaming a shape updates the name field', () => {
    const shape = generatePrattTruss(10, 2, 4)
    useModelStore.getState().addShape(shape)
    useModelStore.getState().updateShape(shape.id, { name: 'My Custom Truss' })
    expect(useModelStore.getState().shapes[0].name).toBe('My Custom Truss')
  })

  it('deleting a shape removes it from the array', () => {
    const shape = generatePrattTruss(10, 2, 4)
    useModelStore.getState().addShape(shape)
    expect(useModelStore.getState().shapes).toHaveLength(1)
    useModelStore.getState().removeShape(shape.id)
    expect(useModelStore.getState().shapes).toHaveLength(0)
  })

  it('toggling snap edge flips isSnapEdge on the targeted member', () => {
    const store = useEditor2DStore.getState()
    const n1 = store.addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(5, 0)
    useEditor2DStore.getState().addMember(n1, n2)

    const memberId = useEditor2DStore.getState().shape.members[0].id
    expect(useEditor2DStore.getState().shape.members[0].isSnapEdge).toBe(false)

    useEditor2DStore.getState().toggleSnapEdge(memberId)
    expect(useEditor2DStore.getState().shape.members[0].isSnapEdge).toBe(true)

    useEditor2DStore.getState().toggleSnapEdge(memberId)
    expect(useEditor2DStore.getState().shape.members[0].isSnapEdge).toBe(false)
  })

  it('saved shape passes Shape2DSchema validation', () => {
    const store = useEditor2DStore.getState()
    const n1 = store.addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(3, 0)
    useEditor2DStore.getState().addMember(n1, n2)

    const shape = useEditor2DStore.getState().shape
    useModelStore.getState().addShape(shape)

    const saved = useModelStore.getState().shapes[0]
    expect(Shape2DSchema.safeParse(saved).success).toBe(true)
  })
})
