import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Shape2D, Shape2DNode, Shape2DMember, PlacementPlane } from '../model'
import { createShape2D } from '../model'

export type Tool2D = 'draw-node' | 'draw-segment' | 'select' | 'delete' | 'snap-edge'

export interface Editor2DState {
  currentTool: Tool2D
  shape: Shape2D
  selectedIds: Set<string>
  pendingSegmentStart: string | null
  editingShapeId: string | null
  isDirty: boolean

  setTool: (tool: Tool2D) => void
  addNode: (x: number, y: number) => string
  addMember: (startNode: string, endNode: string) => void
  deleteEntity: (id: string) => void
  moveNode: (id: string, x: number, y: number) => void
  selectEntity: (id: string | null) => void
  setPendingSegmentStart: (nodeId: string | null) => void
  toggleSnapEdge: (memberId: string) => void
  setPlacementPlane: (plane: PlacementPlane) => void
  loadShape: (shape: Shape2D, shapeId?: string) => void
  resetShape: (name?: string) => void
  markClean: () => void
}

export const useEditor2DStore = create<Editor2DState>((set) => ({
  currentTool: 'draw-node',
  shape: createShape2D('New Shape'),
  selectedIds: new Set(),
  pendingSegmentStart: null,
  editingShapeId: null,
  isDirty: false,

  setTool: (tool) =>
    set({ currentTool: tool, pendingSegmentStart: null, selectedIds: new Set() }),

  addNode: (x, y) => {
    const id = nanoid()
    set((state) => ({
      shape: {
        ...state.shape,
        nodes: [...state.shape.nodes, { id, x, y }],
      },
      isDirty: true,
    }))
    return id
  },

  addMember: (startNode, endNode) =>
    set((state) => {
      if (startNode === endNode) return state
      // Don't create duplicate members
      const exists = state.shape.members.some(
        (m) =>
          (m.startNode === startNode && m.endNode === endNode) ||
          (m.startNode === endNode && m.endNode === startNode),
      )
      if (exists) return state
      return {
        shape: {
          ...state.shape,
          members: [
            ...state.shape.members,
            { id: nanoid(), startNode, endNode, isSnapEdge: false },
          ],
        },
        isDirty: true,
      }
    }),

  deleteEntity: (id) =>
    set((state) => {
      // Check if it's a node
      const isNode = state.shape.nodes.some((n) => n.id === id)
      if (isNode) {
        return {
          shape: {
            ...state.shape,
            nodes: state.shape.nodes.filter((n) => n.id !== id),
            members: state.shape.members.filter(
              (m) => m.startNode !== id && m.endNode !== id,
            ),
          },
          selectedIds: new Set(),
          isDirty: true,
        }
      }
      // Otherwise treat as a member
      return {
        shape: {
          ...state.shape,
          members: state.shape.members.filter((m) => m.id !== id),
        },
        selectedIds: new Set(),
        isDirty: true,
      }
    }),

  moveNode: (id, x, y) =>
    set((state) => ({
      shape: {
        ...state.shape,
        nodes: state.shape.nodes.map((n) =>
          n.id === id ? { ...n, x, y } : n,
        ),
      },
      isDirty: true,
    })),

  selectEntity: (id) =>
    set({ selectedIds: id ? new Set([id]) : new Set() }),

  setPendingSegmentStart: (nodeId) =>
    set({ pendingSegmentStart: nodeId }),

  toggleSnapEdge: (memberId) =>
    set((state) => ({
      shape: {
        ...state.shape,
        members: state.shape.members.map((m) =>
          m.id === memberId ? { ...m, isSnapEdge: !m.isSnapEdge } : m,
        ),
      },
      isDirty: true,
    })),

  setPlacementPlane: (plane) =>
    set((state) => ({
      shape: { ...state.shape, placementPlane: plane },
      isDirty: true,
    })),

  loadShape: (shape, shapeId) =>
    set({ shape, editingShapeId: shapeId ?? null, isDirty: false, selectedIds: new Set(), pendingSegmentStart: null }),

  resetShape: (name) =>
    set({
      shape: createShape2D(name ?? 'New Shape'),
      editingShapeId: null,
      isDirty: false,
      selectedIds: new Set(),
      pendingSegmentStart: null,
    }),

  markClean: () => set({ isDirty: false }),
}))

/** Find node at a given world position within a tolerance. */
export function hitTestNode(
  nodes: Shape2DNode[],
  x: number,
  y: number,
  radius: number,
): Shape2DNode | null {
  let closest: Shape2DNode | null = null
  let closestDist = Infinity
  for (const n of nodes) {
    const d = Math.hypot(n.x - x, n.y - y)
    if (d < radius && d < closestDist) {
      closestDist = d
      closest = n
    }
  }
  return closest
}

/** Find member near a given world position by distance to its line segment. */
export function hitTestMember(
  members: Shape2DMember[],
  nodes: Shape2DNode[],
  x: number,
  y: number,
  radius: number,
): Shape2DMember | null {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  let closest: Shape2DMember | null = null
  let closestDist = Infinity

  for (const m of members) {
    const a = nodeMap.get(m.startNode)
    const b = nodeMap.get(m.endNode)
    if (!a || !b) continue
    const d = pointToSegmentDist(x, y, a.x, a.y, b.x, b.y)
    if (d < radius && d < closestDist) {
      closestDist = d
      closest = m
    }
  }
  return closest
}

function pointToSegmentDist(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}
