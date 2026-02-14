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

describe('Multi-shape management', () => {
  it('isDirty starts false and becomes true on addNode', () => {
    expect(useEditor2DStore.getState().isDirty).toBe(false)
    useEditor2DStore.getState().addNode(1, 1)
    expect(useEditor2DStore.getState().isDirty).toBe(true)
  })

  it('isDirty becomes true on addMember', () => {
    const a = useEditor2DStore.getState().addNode(0, 0)
    const b = useEditor2DStore.getState().addNode(5, 0)
    useEditor2DStore.setState({ isDirty: false })
    useEditor2DStore.getState().addMember(a, b)
    expect(useEditor2DStore.getState().isDirty).toBe(true)
  })

  it('isDirty becomes true on deleteEntity', () => {
    const n1 = useEditor2DStore.getState().addNode(0, 0)
    useEditor2DStore.setState({ isDirty: false })
    useEditor2DStore.getState().deleteEntity(n1)
    expect(useEditor2DStore.getState().isDirty).toBe(true)
  })

  it('isDirty becomes true on moveNode', () => {
    const n1 = useEditor2DStore.getState().addNode(0, 0)
    useEditor2DStore.setState({ isDirty: false })
    useEditor2DStore.getState().moveNode(n1, 5, 5)
    expect(useEditor2DStore.getState().isDirty).toBe(true)
  })

  it('isDirty becomes true on toggleSnapEdge', () => {
    const n1 = useEditor2DStore.getState().addNode(0, 0)
    const n2 = useEditor2DStore.getState().addNode(5, 0)
    useEditor2DStore.getState().addMember(n1, n2)
    useEditor2DStore.setState({ isDirty: false })
    const memberId = useEditor2DStore.getState().shape.members[0].id
    useEditor2DStore.getState().toggleSnapEdge(memberId)
    expect(useEditor2DStore.getState().isDirty).toBe(true)
  })

  it('loadShape sets editingShapeId and clears isDirty', () => {
    useEditor2DStore.getState().addNode(0, 0)
    expect(useEditor2DStore.getState().isDirty).toBe(true)

    const shape = generatePrattTruss(10, 2, 4)
    useModelStore.getState().addShape(shape)
    const stored = useModelStore.getState().shapes[0]

    useEditor2DStore.getState().loadShape(JSON.parse(JSON.stringify(stored)), stored.id)
    expect(useEditor2DStore.getState().editingShapeId).toBe(stored.id)
    expect(useEditor2DStore.getState().isDirty).toBe(false)
  })

  it('resetShape clears editingShapeId and isDirty', () => {
    const shape = generatePrattTruss(10, 2, 4)
    useModelStore.getState().addShape(shape)
    useEditor2DStore.getState().loadShape(JSON.parse(JSON.stringify(shape)), shape.id)
    useEditor2DStore.getState().addNode(99, 99)

    expect(useEditor2DStore.getState().editingShapeId).toBe(shape.id)
    expect(useEditor2DStore.getState().isDirty).toBe(true)

    useEditor2DStore.getState().resetShape()
    expect(useEditor2DStore.getState().editingShapeId).toBeNull()
    expect(useEditor2DStore.getState().isDirty).toBe(false)
  })

  it('markClean clears isDirty without changing editingShapeId', () => {
    const shape = generatePrattTruss(10, 2, 4)
    useModelStore.getState().addShape(shape)
    useEditor2DStore.getState().loadShape(JSON.parse(JSON.stringify(shape)), shape.id)
    useEditor2DStore.getState().addNode(99, 99)

    expect(useEditor2DStore.getState().isDirty).toBe(true)
    useEditor2DStore.getState().markClean()
    expect(useEditor2DStore.getState().isDirty).toBe(false)
    expect(useEditor2DStore.getState().editingShapeId).toBe(shape.id)
  })

  it('loadShape without shapeId sets editingShapeId to null (template load)', () => {
    const shape = generatePrattTruss(10, 2, 4)
    useEditor2DStore.getState().loadShape(JSON.parse(JSON.stringify(shape)))
    expect(useEditor2DStore.getState().editingShapeId).toBeNull()
    expect(useEditor2DStore.getState().isDirty).toBe(false)
  })
})
