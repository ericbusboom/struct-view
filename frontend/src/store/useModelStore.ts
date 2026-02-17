import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Node, Member, Group, Panel, Load, LoadCase, LoadCombination, Shape2D } from '../model'

const EMPTY_PROJECT = {
  name: 'Untitled Project',
  nodes: [] as Node[],
  members: [] as Member[],
  groups: [] as Group[],
  panels: [] as Panel[],
  loads: [] as Load[],
  load_cases: [] as LoadCase[],
  combinations: [] as LoadCombination[],
  shapes: [] as Shape2D[],
}

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

  // Project operations
  clearProject: () => void
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

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      ...EMPTY_PROJECT,

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

      clearProject: () => set({ ...EMPTY_PROJECT }),

      loadProject: (project) => set({
        ...project,
        groups: project.groups ?? [],
        shapes: project.shapes ?? [],
      }),
    }),
    {
      name: 'structview-model',
      partialize: (state) => ({
        name: state.name,
        nodes: state.nodes,
        members: state.members,
        groups: state.groups,
        panels: state.panels,
        loads: state.loads,
        load_cases: state.load_cases,
        combinations: state.combinations,
        shapes: state.shapes,
      }),
    },
  ),
)
