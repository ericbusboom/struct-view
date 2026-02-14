import { create } from 'zustand'

export type EditorMode = 'select' | 'add-node' | 'add-member' | 'move'

export interface EditorState {
  mode: EditorMode
  selectedId: string | null
  selectedType: 'node' | 'member' | null
  /** First node picked in add-member mode */
  memberStartNode: string | null

  setMode: (mode: EditorMode) => void
  select: (id: string, type: 'node' | 'member') => void
  clearSelection: () => void
  setMemberStartNode: (id: string | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'select',
  selectedId: null,
  selectedType: null,
  memberStartNode: null,

  setMode: (mode) =>
    set({ mode, memberStartNode: null }),

  select: (id, type) =>
    set({ selectedId: id, selectedType: type }),

  clearSelection: () =>
    set({ selectedId: null, selectedType: null }),

  setMemberStartNode: (id) =>
    set({ memberStartNode: id }),
}))
