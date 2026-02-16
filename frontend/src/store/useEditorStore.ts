import { create } from 'zustand'
import type { PlacementPlane } from '../model'

export type EditorMode = 'select' | 'add-node' | 'add-member' | 'move' | 'rotate'

export interface EditorState {
  mode: EditorMode
  selectedNodeIds: Set<string>
  selectedMemberIds: Set<string>
  /** Currently selected group (by groupId) */
  selectedGroupId: string | null
  /** First node picked in add-member mode */
  memberStartNode: string | null
  /** Node currently being dragged in move mode */
  dragNodeId: string | null
  /** Active constraint plane for 3D movement/rotation */
  activePlane: PlacementPlane
  /** Node used as rotation pivot (null = use centroid) */
  rotatePivotNodeId: string | null
  /** Node the cursor is hovering near (for snap highlight) */
  hoverNodeId: string | null

  setMode: (mode: EditorMode) => void
  /** Select a single entity (replaces current selection). */
  select: (id: string, type: 'node' | 'member') => void
  /** Toggle entity in multi-select (shift+click). */
  toggleSelect: (id: string, type: 'node' | 'member') => void
  /** Replace selection with a set of node IDs (for drag-select). */
  setSelectedNodeIds: (ids: Set<string>, additive?: boolean) => void
  clearSelection: () => void
  /** Select an entire group by its groupId. */
  selectGroup: (trussId: string) => void
  isNodeSelected: (id: string) => boolean
  isMemberSelected: (id: string) => boolean
  setMemberStartNode: (id: string | null) => void
  setDragNodeId: (id: string | null) => void
  setActivePlane: (plane: PlacementPlane) => void
  setRotatePivotNodeId: (id: string | null) => void
  setHoverNodeId: (id: string | null) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  mode: 'select',
  selectedNodeIds: new Set(),
  selectedMemberIds: new Set(),
  selectedGroupId: null,
  memberStartNode: null,
  dragNodeId: null,
  activePlane: 'XZ' as PlacementPlane,
  rotatePivotNodeId: null,
  hoverNodeId: null,

  setMode: (mode) =>
    set({ mode, memberStartNode: null, dragNodeId: null, hoverNodeId: null }),

  select: (id, type) =>
    set({
      selectedNodeIds: type === 'node' ? new Set([id]) : new Set(),
      selectedMemberIds: type === 'member' ? new Set([id]) : new Set(),
      selectedGroupId: null,
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

  setSelectedNodeIds: (ids, additive) =>
    set((state) => ({
      selectedNodeIds: additive ? new Set([...state.selectedNodeIds, ...ids]) : ids,
      selectedMemberIds: new Set(),
      selectedGroupId: null,
    })),

  clearSelection: () =>
    set({ selectedNodeIds: new Set(), selectedMemberIds: new Set(), selectedGroupId: null, rotatePivotNodeId: null }),

  selectGroup: (trussId) =>
    set({ selectedNodeIds: new Set(), selectedMemberIds: new Set(), selectedGroupId: trussId, rotatePivotNodeId: null }),

  isNodeSelected: (id) => get().selectedNodeIds.has(id),
  isMemberSelected: (id) => get().selectedMemberIds.has(id),

  setMemberStartNode: (id) =>
    set({ memberStartNode: id }),

  setDragNodeId: (id) =>
    set({ dragNodeId: id }),

  setActivePlane: (plane) =>
    set({ activePlane: plane }),

  setRotatePivotNodeId: (id) =>
    set({ rotatePivotNodeId: id }),

  setHoverNodeId: (id) =>
    set({ hoverNodeId: id }),
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
