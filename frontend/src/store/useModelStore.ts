import { create } from 'zustand'
import type { Node, Member, Panel, Load, LoadCase, LoadCombination } from '../model'
import { createNode, createMember } from '../model'

export interface ModelState {
  name: string
  nodes: Node[]
  members: Member[]
  panels: Panel[]
  loads: Load[]
  load_cases: LoadCase[]
  combinations: LoadCombination[]

  // Node operations
  addNode: (node: Node) => void
  removeNode: (id: string) => void
  updateNode: (id: string, updates: Partial<Node>) => void

  // Member operations
  addMember: (member: Member) => void
  removeMember: (id: string) => void
  updateMember: (id: string, updates: Partial<Member>) => void

  // Bulk replace (for import)
  loadProject: (project: {
    name: string
    nodes: Node[]
    members: Member[]
    panels: Panel[]
    loads: Load[]
    load_cases: LoadCase[]
    combinations: LoadCombination[]
  }) => void
}

// Sample portal frame for visual verification
function createSampleModel() {
  const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 }, support: { type: 'fixed' } })
  const n2 = createNode({ id: 'n2', position: { x: 0, y: 3, z: 0 } })
  const n3 = createNode({ id: 'n3', position: { x: 5, y: 3, z: 0 } })
  const n4 = createNode({ id: 'n4', position: { x: 5, y: 0, z: 0 }, support: { type: 'fixed' } })

  const m1 = createMember('n1', 'n2', { id: 'm1' })
  const m2 = createMember('n2', 'n3', { id: 'm2' })
  const m3 = createMember('n3', 'n4', { id: 'm3' })

  return {
    name: 'Sample Portal Frame',
    nodes: [n1, n2, n3, n4],
    members: [m1, m2, m3],
    panels: [] as Panel[],
    loads: [] as Load[],
    load_cases: [] as LoadCase[],
    combinations: [] as LoadCombination[],
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

  loadProject: (project) => set(project),
}))
