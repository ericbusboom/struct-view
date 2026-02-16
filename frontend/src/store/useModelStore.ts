import { create } from 'zustand'
import type { Node, Member, Group, Panel, Load, LoadCase, LoadCombination, Shape2D } from '../model'
import { createNode, createMember } from '../model'

export interface ModelState {
  name: string
  nodes: Node[]
  members: Member[]
  groups: Group[]
  panels: Panel[]
  loads: Load[]
  load_cases: LoadCase[]
  combinations: LoadCombination[]
  shapes: Shape2D[]

  // Node operations
  addNode: (node: Node) => void
  removeNode: (id: string) => void
  updateNode: (id: string, updates: Partial<Node>) => void

  // Member operations
  addMember: (member: Member) => void
  removeMember: (id: string) => void
  updateMember: (id: string, updates: Partial<Member>) => void

  // Shape operations
  addShape: (shape: Shape2D) => void
  updateShape: (id: string, updates: Partial<Shape2D>) => void
  removeShape: (id: string) => void

  // Group operations
  addGroup: (group: Group) => void
  removeGroup: (id: string) => void
  updateGroup: (id: string, updates: Partial<Group>) => void

  // Group queries
  getGroup: (id: string) => Group | undefined
  getNodesByGroupId: (groupId: string) => Node[]
  getMembersByGroupId: (groupId: string) => Member[]

  // Bulk replace (for import)
  loadProject: (project: {
    name: string
    nodes: Node[]
    members: Member[]
    groups?: Group[]
    panels: Panel[]
    loads: Load[]
    load_cases: LoadCase[]
    combinations: LoadCombination[]
    shapes?: Shape2D[]
  }) => void
}

// Sample 3D shed frame for visual verification and plane testing (Z-up).
// Front frame (y=0), back frame (y=4), ridge, and connecting beams
// give nodes in all three principal planes plus oblique selections.
function createSampleModel() {
  // Front frame (y = 0)
  const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 }, support: { type: 'fixed' } })
  const n2 = createNode({ id: 'n2', position: { x: 0, y: 0, z: 3 } })
  const n3 = createNode({ id: 'n3', position: { x: 2.5, y: 0, z: 4.5 } }) // ridge
  const n4 = createNode({ id: 'n4', position: { x: 5, y: 0, z: 3 } })
  const n5 = createNode({ id: 'n5', position: { x: 5, y: 0, z: 0 }, support: { type: 'fixed' } })

  // Back frame (y = 4)
  const n6 = createNode({ id: 'n6', position: { x: 0, y: 4, z: 0 }, support: { type: 'fixed' } })
  const n7 = createNode({ id: 'n7', position: { x: 0, y: 4, z: 3 } })
  const n8 = createNode({ id: 'n8', position: { x: 2.5, y: 4, z: 4.5 } }) // ridge
  const n9 = createNode({ id: 'n9', position: { x: 5, y: 4, z: 3 } })
  const n10 = createNode({ id: 'n10', position: { x: 5, y: 4, z: 0 }, support: { type: 'fixed' } })

  // Front frame members
  const m1 = createMember('n1', 'n2', { id: 'm1' })
  const m2 = createMember('n2', 'n3', { id: 'm2' })
  const m3 = createMember('n3', 'n4', { id: 'm3' })
  const m4 = createMember('n4', 'n5', { id: 'm4' })

  // Back frame members
  const m5 = createMember('n6', 'n7', { id: 'm5' })
  const m6 = createMember('n7', 'n8', { id: 'm6' })
  const m7 = createMember('n8', 'n9', { id: 'm7' })
  const m8 = createMember('n9', 'n10', { id: 'm8' })

  // Connecting beams (along Y axis)
  const m9 = createMember('n2', 'n7', { id: 'm9' })
  const m10 = createMember('n3', 'n8', { id: 'm10' }) // ridge beam
  const m11 = createMember('n4', 'n9', { id: 'm11' })

  return {
    name: 'Sample Shed Frame',
    nodes: [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10],
    members: [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11],
    groups: [] as Group[],
    panels: [] as Panel[],
    loads: [] as Load[],
    load_cases: [] as LoadCase[],
    combinations: [] as LoadCombination[],
    shapes: [] as Shape2D[],
  }
}

export const useModelStore = create<ModelState>((set) => ({
  ...createSampleModel(),

  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      members: state.members.filter((m) => m.start_node !== id && m.end_node !== id),
    })),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),

  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),

  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    })),

  updateMember: (id, updates) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  addShape: (shape) =>
    set((state) => ({ shapes: [...state.shapes, shape] })),

  updateShape: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  removeShape: (id) =>
    set((state) => ({ shapes: state.shapes.filter((s) => s.id !== id) })),

  addGroup: (group) =>
    set((state) => ({ groups: [...state.groups, group] })),

  removeGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
      nodes: state.nodes.map((n) => n.groupId === id ? { ...n, groupId: undefined } : n),
      members: state.members.map((m) => m.groupId === id ? { ...m, groupId: undefined } : m),
    })),

  updateGroup: (id, updates) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),

  getGroup: (id): Group | undefined => useModelStore.getState().groups.find((g: Group) => g.id === id),
  getNodesByGroupId: (groupId): Node[] => useModelStore.getState().nodes.filter((n: Node) => n.groupId === groupId),
  getMembersByGroupId: (groupId): Member[] => useModelStore.getState().members.filter((m: Member) => m.groupId === groupId),

  loadProject: (project) => set({
    ...project,
    groups: project.groups ?? [],
    shapes: project.shapes ?? [],
  }),
}))
