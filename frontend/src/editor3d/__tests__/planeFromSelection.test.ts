import { describe, it, expect, beforeEach } from 'vitest'
import { getPlaneFromSelection } from '../planeFromSelection'
import { useEditorStore } from '../../store/useEditorStore'
import { useModelStore } from '../../store/useModelStore'
import { createNode, createMember } from '../../model'

describe('getPlaneFromSelection', () => {
  beforeEach(() => {
    useEditorStore.setState({
      selectedNodeIds: new Set(),
      selectedMemberIds: new Set(),
      selectedGroupId: null,
    })
    useModelStore.setState({
      nodes: [],
      members: [],
      groups: [],
    })
  })

  it('returns null with no selection', () => {
    expect(getPlaneFromSelection()).toBeNull()
  })

  it('returns a plane from one selected node', () => {
    const node = createNode({ position: { x: 3, y: 4, z: 5 } })
    useModelStore.getState().addNode(node)
    useEditorStore.setState({ selectedNodeIds: new Set([node.id]) })

    const plane = getPlaneFromSelection()
    expect(plane).not.toBeNull()
    expect(plane!.point).toEqual({ x: 3, y: 4, z: 5 })
    // 1 point → default XY plane, normal along Z
    expect(Math.abs(plane!.normal.z)).toBeCloseTo(1)
  })

  it('returns a plane from two selected nodes', () => {
    const n1 = createNode({ position: { x: 0, y: 0, z: 0 } })
    const n2 = createNode({ position: { x: 5, y: 0, z: 0 } })
    useModelStore.getState().addNode(n1)
    useModelStore.getState().addNode(n2)
    useEditorStore.setState({ selectedNodeIds: new Set([n1.id, n2.id]) })

    const plane = getPlaneFromSelection()
    expect(plane).not.toBeNull()
    expect(plane!.constraintType).toBe('line')
  })

  it('returns a plane from three selected nodes', () => {
    const n1 = createNode({ position: { x: 0, y: 0, z: 0 } })
    const n2 = createNode({ position: { x: 5, y: 0, z: 0 } })
    const n3 = createNode({ position: { x: 0, y: 5, z: 0 } })
    useModelStore.getState().addNode(n1)
    useModelStore.getState().addNode(n2)
    useModelStore.getState().addNode(n3)
    useEditorStore.setState({ selectedNodeIds: new Set([n1.id, n2.id, n3.id]) })

    const plane = getPlaneFromSelection()
    expect(plane).not.toBeNull()
    expect(plane!.constraintType).toBe('plane')
  })

  it('returns a plane from a selected member', () => {
    const n1 = createNode({ position: { x: 0, y: 0, z: 0 } })
    const n2 = createNode({ position: { x: 5, y: 0, z: 0 } })
    useModelStore.getState().addNode(n1)
    useModelStore.getState().addNode(n2)
    const member = createMember(n1.id, n2.id)
    useModelStore.getState().addMember(member)
    useEditorStore.setState({ selectedMemberIds: new Set([member.id]) })

    const plane = getPlaneFromSelection()
    expect(plane).not.toBeNull()
    // Member gives 2 points → line constraint
    expect(plane!.constraintType).toBe('line')
  })

  it('combines nodes and member endpoints', () => {
    const n1 = createNode({ position: { x: 0, y: 0, z: 0 } })
    const n2 = createNode({ position: { x: 5, y: 0, z: 0 } })
    const n3 = createNode({ position: { x: 0, y: 5, z: 0 } })
    useModelStore.getState().addNode(n1)
    useModelStore.getState().addNode(n2)
    useModelStore.getState().addNode(n3)
    const member = createMember(n1.id, n2.id)
    useModelStore.getState().addMember(member)

    // Select n3 (node) + member (gives n1, n2 endpoints) → 3 points total
    useEditorStore.setState({
      selectedNodeIds: new Set([n3.id]),
      selectedMemberIds: new Set([member.id]),
    })

    const plane = getPlaneFromSelection()
    expect(plane).not.toBeNull()
    expect(plane!.constraintType).toBe('plane')
  })
})
