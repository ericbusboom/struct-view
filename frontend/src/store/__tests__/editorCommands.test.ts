import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../useModelStore'
import { useEditorStore } from '../useEditorStore'
import { createNode, createMember } from '../../model'

function resetStores() {
  useModelStore.setState({
    name: 'Test',
    nodes: [],
    members: [],
    panels: [],
    loads: [],
    load_cases: [],
    combinations: [],
  })
  useEditorStore.setState({
    mode: 'select',
    selectedId: null,
    selectedType: null,
    memberStartNode: null,
  })
}

describe('editor commands', () => {
  beforeEach(resetStores)

  it('addNode places a node in the store', () => {
    const node = createNode({ position: { x: 1, y: 0, z: 2 } })
    useModelStore.getState().addNode(node)
    expect(useModelStore.getState().nodes).toHaveLength(1)
    expect(useModelStore.getState().nodes[0].position).toEqual({ x: 1, y: 0, z: 2 })
  })

  it('moveNode (updateNode) changes position', () => {
    const node = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
    useModelStore.setState({ nodes: [node] })
    useModelStore.getState().updateNode('n1', { position: { x: 5, y: 3, z: 1 } })
    expect(useModelStore.getState().nodes[0].position).toEqual({ x: 5, y: 3, z: 1 })
  })

  it('deleteNode removes node and connected members', () => {
    const n1 = createNode({ id: 'n1' })
    const n2 = createNode({ id: 'n2' })
    const n3 = createNode({ id: 'n3' })
    const m12 = createMember('n1', 'n2', { id: 'm12' })
    const m23 = createMember('n2', 'n3', { id: 'm23' })
    useModelStore.setState({ nodes: [n1, n2, n3], members: [m12, m23] })

    useModelStore.getState().removeNode('n2')

    expect(useModelStore.getState().nodes.map((n) => n.id)).toEqual(['n1', 'n3'])
    expect(useModelStore.getState().members).toHaveLength(0)
  })

  it('addMember creates a member between two nodes', () => {
    const n1 = createNode({ id: 'n1' })
    const n2 = createNode({ id: 'n2' })
    useModelStore.setState({ nodes: [n1, n2] })

    const member = createMember('n1', 'n2')
    useModelStore.getState().addMember(member)

    expect(useModelStore.getState().members).toHaveLength(1)
    expect(useModelStore.getState().members[0].start_node).toBe('n1')
    expect(useModelStore.getState().members[0].end_node).toBe('n2')
  })

  it('deleteMember removes member but keeps nodes', () => {
    const n1 = createNode({ id: 'n1' })
    const n2 = createNode({ id: 'n2' })
    const m = createMember('n1', 'n2', { id: 'm1' })
    useModelStore.setState({ nodes: [n1, n2], members: [m] })

    useModelStore.getState().removeMember('m1')

    expect(useModelStore.getState().members).toHaveLength(0)
    expect(useModelStore.getState().nodes).toHaveLength(2)
  })

  it('editor mode changes clear memberStartNode', () => {
    useEditorStore.getState().setMode('add-member')
    useEditorStore.getState().setMemberStartNode('n1')
    expect(useEditorStore.getState().memberStartNode).toBe('n1')

    useEditorStore.getState().setMode('select')
    expect(useEditorStore.getState().memberStartNode).toBeNull()
  })

  it('select sets selectedId and type', () => {
    useEditorStore.getState().select('m1', 'member')
    expect(useEditorStore.getState().selectedId).toBe('m1')
    expect(useEditorStore.getState().selectedType).toBe('member')
  })

  it('clearSelection resets selection', () => {
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().clearSelection()
    expect(useEditorStore.getState().selectedId).toBeNull()
    expect(useEditorStore.getState().selectedType).toBeNull()
  })
})
