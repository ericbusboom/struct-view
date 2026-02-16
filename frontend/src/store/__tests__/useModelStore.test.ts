import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../useModelStore'
import { createNode, createMember, createGroup, createProject } from '../../model'

function resetStore() {
  useModelStore.setState({
    name: 'Test',
    nodes: [],
    members: [],
    groups: [],
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

  // --- Groups ---

  it('addGroup appends a group', () => {
    const g = createGroup('Frame A', { id: 'g1', nodeIds: ['n1'], memberIds: ['m1'] })
    useModelStore.getState().addGroup(g)
    expect(useModelStore.getState().groups).toHaveLength(1)
    expect(useModelStore.getState().groups[0].name).toBe('Frame A')
  })

  it('removeGroup removes the group and clears groupId on nodes and members', () => {
    const g = createGroup('Frame A', { id: 'g1' })
    const n1 = createNode({ id: 'n1', groupId: 'g1' })
    const n2 = createNode({ id: 'n2', groupId: 'g1' })
    const n3 = createNode({ id: 'n3' }) // not in group
    const m1 = createMember('n1', 'n2', { id: 'm1', groupId: 'g1' })
    const m2 = createMember('n2', 'n3', { id: 'm2' }) // not in group

    useModelStore.setState({ groups: [g], nodes: [n1, n2, n3], members: [m1, m2] })
    useModelStore.getState().removeGroup('g1')

    expect(useModelStore.getState().groups).toHaveLength(0)
    // groupId cleared on formerly-grouped nodes
    expect(useModelStore.getState().nodes.find(n => n.id === 'n1')!.groupId).toBeUndefined()
    expect(useModelStore.getState().nodes.find(n => n.id === 'n2')!.groupId).toBeUndefined()
    // ungrouped node unaffected
    expect(useModelStore.getState().nodes.find(n => n.id === 'n3')!.groupId).toBeUndefined()
    // groupId cleared on formerly-grouped member
    expect(useModelStore.getState().members.find(m => m.id === 'm1')!.groupId).toBeUndefined()
    // ungrouped member unaffected
    expect(useModelStore.getState().members.find(m => m.id === 'm2')!.groupId).toBeUndefined()
  })

  it('updateGroup merges partial updates', () => {
    const g = createGroup('Old Name', { id: 'g1', nodeIds: ['n1'] })
    useModelStore.setState({ groups: [g] })
    useModelStore.getState().updateGroup('g1', { name: 'New Name' })

    const updated = useModelStore.getState().groups[0]
    expect(updated.name).toBe('New Name')
    expect(updated.nodeIds).toEqual(['n1']) // unchanged
  })

  it('getGroup returns the group by ID', () => {
    const g1 = createGroup('A', { id: 'g1' })
    const g2 = createGroup('B', { id: 'g2' })
    useModelStore.setState({ groups: [g1, g2] })

    expect(useModelStore.getState().getGroup('g1')?.name).toBe('A')
    expect(useModelStore.getState().getGroup('g2')?.name).toBe('B')
    expect(useModelStore.getState().getGroup('missing')).toBeUndefined()
  })

  it('getNodesByGroupId returns only nodes with matching groupId', () => {
    const n1 = createNode({ id: 'n1', groupId: 'g1' })
    const n2 = createNode({ id: 'n2', groupId: 'g1' })
    const n3 = createNode({ id: 'n3', groupId: 'g2' })
    useModelStore.setState({ nodes: [n1, n2, n3] })

    const result = useModelStore.getState().getNodesByGroupId('g1')
    expect(result).toHaveLength(2)
    expect(result.map(n => n.id)).toEqual(['n1', 'n2'])
  })

  it('getMembersByGroupId returns only members with matching groupId', () => {
    const m1 = createMember('n1', 'n2', { id: 'm1', groupId: 'g1' })
    const m2 = createMember('n2', 'n3', { id: 'm2' })
    useModelStore.setState({ members: [m1, m2] })

    const result = useModelStore.getState().getMembersByGroupId('g1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('m1')
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
