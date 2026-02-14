import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../useModelStore'
import { createNode, createMember, createProject } from '../../model'

function resetStore() {
  useModelStore.setState({
    name: 'Test',
    nodes: [],
    members: [],
    panels: [],
    loads: [],
    load_cases: [],
    combinations: [],
  })
}

describe('useModelStore', () => {
  beforeEach(resetStore)

  // --- Nodes ---

  it('starts with empty arrays after reset', () => {
    const state = useModelStore.getState()
    expect(state.nodes).toHaveLength(0)
    expect(state.members).toHaveLength(0)
  })

  it('addNode appends a node', () => {
    const n = createNode({ id: 'n1', position: { x: 1, y: 2, z: 3 } })
    useModelStore.getState().addNode(n)
    expect(useModelStore.getState().nodes).toHaveLength(1)
    expect(useModelStore.getState().nodes[0].id).toBe('n1')
  })

  it('removeNode removes the node and orphaned members', () => {
    const n1 = createNode({ id: 'n1' })
    const n2 = createNode({ id: 'n2' })
    const n3 = createNode({ id: 'n3' })
    const m1 = createMember('n1', 'n2', { id: 'm1' })
    const m2 = createMember('n2', 'n3', { id: 'm2' })

    useModelStore.setState({ nodes: [n1, n2, n3], members: [m1, m2] })
    useModelStore.getState().removeNode('n1')

    expect(useModelStore.getState().nodes).toHaveLength(2)
    expect(useModelStore.getState().members).toHaveLength(1)
    expect(useModelStore.getState().members[0].id).toBe('m2')
  })

  it('updateNode merges partial updates', () => {
    const n = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
    useModelStore.setState({ nodes: [n] })
    useModelStore.getState().updateNode('n1', { position: { x: 5, y: 0, z: 0 } })

    expect(useModelStore.getState().nodes[0].position.x).toBe(5)
  })

  // --- Members ---

  it('addMember appends a member', () => {
    const m = createMember('n1', 'n2', { id: 'm1' })
    useModelStore.getState().addMember(m)
    expect(useModelStore.getState().members).toHaveLength(1)
  })

  it('removeMember removes only that member', () => {
    const m1 = createMember('n1', 'n2', { id: 'm1' })
    const m2 = createMember('n2', 'n3', { id: 'm2' })
    useModelStore.setState({ members: [m1, m2] })
    useModelStore.getState().removeMember('m1')

    expect(useModelStore.getState().members).toHaveLength(1)
    expect(useModelStore.getState().members[0].id).toBe('m2')
  })

  it('updateMember merges partial updates', () => {
    const m = createMember('n1', 'n2', { id: 'm1' })
    useModelStore.setState({ members: [m] })
    useModelStore.getState().updateMember('m1', { tags: ['beam'] })

    expect(useModelStore.getState().members[0].tags).toEqual(['beam'])
  })

  // --- loadProject ---

  it('loadProject replaces entire state', () => {
    const n1 = createNode({ id: 'x1' })
    const project = createProject({ name: 'Imported', nodes: [n1] })
    useModelStore.getState().loadProject(project)

    expect(useModelStore.getState().name).toBe('Imported')
    expect(useModelStore.getState().nodes).toHaveLength(1)
    expect(useModelStore.getState().nodes[0].id).toBe('x1')
  })
})
