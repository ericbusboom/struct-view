import { create } from 'zustand'

export type EditorMode = 'select' | 'add-node' | 'add-member' | 'move'

export interface EditorState {
  mode: EditorMode
  selectedNodeIds: Set<string>
  selectedMemberIds: Set<string>
  /** First node picked in add-member mode */
  memberStartNode: string | null

  setMode: (mode: EditorMode) => void
  /** Select a single entity (replaces current selection). */
  select: (id: string, type: 'node' | 'member') => void
  /** Toggle entity in multi-select (shift+click). */
  toggleSelect: (id: string, type: 'node' | 'member') => void
  clearSelection: () => void
  isNodeSelected: (id: string) => boolean
  isMemberSelected: (id: string) => boolean
  setMemberStartNode: (id: string | null) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  mode: 'select',
  selectedNodeIds: new Set(),
  selectedMemberIds: new Set(),
  memberStartNode: null,

  setMode: (mode) =>
    set({ mode, memberStartNode: null }),

  select: (id, type) =>
    set({
      selectedNodeIds: type === 'node' ? new Set([id]) : new Set(),
      selectedMemberIds: type === 'member' ? new Set([id]) : new Set(),
    }),

  toggleSelect: (id, type) =>
    set((state) => {
      if (type === 'node') {
        const next = new Set(state.selectedNodeIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return { selectedNodeIds: next }
      } else {
        const next = new Set(state.selectedMemberIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return { selectedMemberIds: next }
      }
    }),

  clearSelection: () =>
    set({ selectedNodeIds: new Set(), selectedMemberIds: new Set() }),

  isNodeSelected: (id) => get().selectedNodeIds.has(id),
  isMemberSelected: (id) => get().selectedMemberIds.has(id),

  setMemberStartNode: (id) =>
    set({ memberStartNode: id }),
}))

// Convenience helpers for components
export function getSelectedId(state: EditorState): string | null {
  if (state.selectedNodeIds.size === 1) return [...state.selectedNodeIds][0]
  if (state.selectedMemberIds.size === 1) return [...state.selectedMemberIds][0]
  return null
}

export function getSelectedType(state: EditorState): 'node' | 'member' | null {
  if (state.selectedNodeIds.size > 0) return 'node'
  if (state.selectedMemberIds.size > 0) return 'member'
  return null
}
