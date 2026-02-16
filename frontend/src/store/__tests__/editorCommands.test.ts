import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../useModelStore'
import { useEditorStore } from '../useEditorStore'
import { createNode, createMember } from '../../model'

function resetStores() {
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
  useEditorStore.setState({
    mode: 'select',
    selectedNodeIds: new Set(),
    selectedMemberIds: new Set(),
    selectedGroupId: null,
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
})

describe('selection system', () => {
  beforeEach(resetStores)

  it('select sets a single node', () => {
    useEditorStore.getState().select('n1', 'node')
    expect(useEditorStore.getState().selectedNodeIds.has('n1')).toBe(true)
    expect(useEditorStore.getState().selectedNodeIds.size).toBe(1)
    expect(useEditorStore.getState().selectedMemberIds.size).toBe(0)
  })

  it('select sets a single member and clears nodes', () => {
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().select('m1', 'member')
    expect(useEditorStore.getState().selectedMemberIds.has('m1')).toBe(true)
    expect(useEditorStore.getState().selectedNodeIds.size).toBe(0)
  })

  it('toggleSelect adds to selection', () => {
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().toggleSelect('n2', 'node')
    expect(useEditorStore.getState().selectedNodeIds.size).toBe(2)
    expect(useEditorStore.getState().selectedNodeIds.has('n1')).toBe(true)
    expect(useEditorStore.getState().selectedNodeIds.has('n2')).toBe(true)
  })

  it('toggleSelect removes if already selected', () => {
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().toggleSelect('n1', 'node')
    expect(useEditorStore.getState().selectedNodeIds.size).toBe(0)
  })

  it('toggleSelect works for members', () => {
    useEditorStore.getState().toggleSelect('m1', 'member')
    useEditorStore.getState().toggleSelect('m2', 'member')
    expect(useEditorStore.getState().selectedMemberIds.size).toBe(2)
    useEditorStore.getState().toggleSelect('m1', 'member')
    expect(useEditorStore.getState().selectedMemberIds.size).toBe(1)
    expect(useEditorStore.getState().selectedMemberIds.has('m2')).toBe(true)
  })

  it('clearSelection resets all selections', () => {
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().toggleSelect('n2', 'node')
    useEditorStore.getState().clearSelection()
    expect(useEditorStore.getState().selectedNodeIds.size).toBe(0)
    expect(useEditorStore.getState().selectedMemberIds.size).toBe(0)
  })

  it('isNodeSelected returns correct state', () => {
    useEditorStore.getState().select('n1', 'node')
    expect(useEditorStore.getState().isNodeSelected('n1')).toBe(true)
    expect(useEditorStore.getState().isNodeSelected('n2')).toBe(false)
  })

  it('isMemberSelected returns correct state', () => {
    useEditorStore.getState().select('m1', 'member')
    expect(useEditorStore.getState().isMemberSelected('m1')).toBe(true)
    expect(useEditorStore.getState().isMemberSelected('m2')).toBe(false)
  })
})

describe('setSelectedNodeIds (drag select)', () => {
  beforeEach(resetStores)

  it('replaces selection when additive is false', () => {
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().setSelectedNodeIds(new Set(['n2', 'n3']), false)
    expect(useEditorStore.getState().selectedNodeIds).toEqual(new Set(['n2', 'n3']))
    expect(useEditorStore.getState().selectedGroupId).toBeNull()
  })

  it('adds to existing selection when additive is true', () => {
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().setSelectedNodeIds(new Set(['n2', 'n3']), true)
    expect(useEditorStore.getState().selectedNodeIds).toEqual(new Set(['n1', 'n2', 'n3']))
  })

  it('clears member selection and group selection', () => {
    useEditorStore.getState().select('m1', 'member')
    useEditorStore.getState().selectGroup('g1')
    useEditorStore.getState().setSelectedNodeIds(new Set(['n1']), false)
    expect(useEditorStore.getState().selectedMemberIds.size).toBe(0)
    expect(useEditorStore.getState().selectedGroupId).toBeNull()
  })

  it('empty set with additive=false clears node selection', () => {
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().setSelectedNodeIds(new Set(), false)
    expect(useEditorStore.getState().selectedNodeIds.size).toBe(0)
  })
})

describe('group selection', () => {
  beforeEach(resetStores)

  it('selectGroup sets selectedGroupId and clears node/member selection', () => {
    useEditorStore.getState().select('n1', 'node')
    useEditorStore.getState().selectGroup('truss-1')
    expect(useEditorStore.getState().selectedGroupId).toBe('truss-1')
    expect(useEditorStore.getState().selectedNodeIds.size).toBe(0)
    expect(useEditorStore.getState().selectedMemberIds.size).toBe(0)
  })

  it('clearSelection clears selectedGroupId', () => {
    useEditorStore.getState().selectGroup('truss-1')
    useEditorStore.getState().clearSelection()
    expect(useEditorStore.getState().selectedGroupId).toBeNull()
  })

  it('selecting a node clears group selection', () => {
    useEditorStore.getState().selectGroup('truss-1')
    useEditorStore.getState().select('n1', 'node')
    expect(useEditorStore.getState().selectedGroupId).toBeNull()
  })

  it('selecting a member clears group selection', () => {
    useEditorStore.getState().selectGroup('truss-1')
    useEditorStore.getState().select('m1', 'member')
    expect(useEditorStore.getState().selectedGroupId).toBeNull()
  })
})

describe('rotate pivot', () => {
  beforeEach(resetStores)

  it('setRotatePivotNodeId sets the pivot', () => {
    useEditorStore.getState().setRotatePivotNodeId('n1')
    expect(useEditorStore.getState().rotatePivotNodeId).toBe('n1')
  })

  it('clearSelection clears pivot', () => {
    useEditorStore.getState().setRotatePivotNodeId('n1')
    useEditorStore.getState().clearSelection()
    expect(useEditorStore.getState().rotatePivotNodeId).toBeNull()
  })

  it('selectGroup clears pivot', () => {
    useEditorStore.getState().setRotatePivotNodeId('n1')
    useEditorStore.getState().selectGroup('truss-2')
    expect(useEditorStore.getState().rotatePivotNodeId).toBeNull()
  })

  it('setting pivot to null resets to centroid mode', () => {
    useEditorStore.getState().setRotatePivotNodeId('n1')
    useEditorStore.getState().setRotatePivotNodeId(null)
    expect(useEditorStore.getState().rotatePivotNodeId).toBeNull()
  })
})
