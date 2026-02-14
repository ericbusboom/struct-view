import { create } from 'zustand'
import type { Vec3, Shape2D } from '../model'

export type PlacementPhase = 'idle' | 'picking-edge' | 'previewing' | 'adjusting'

export interface TargetEdge {
  start: Vec3
  end: Vec3
}

export interface PlacementState {
  phase: PlacementPhase
  shapeId: string | null
  shape: Shape2D | null
  targetEdge: TargetEdge | null
  /** First point picked during edge selection */
  edgeStart: Vec3 | null
  offset: number
  count: number

  // Actions
  startPlacement: (shape: Shape2D) => void
  setEdgeStart: (point: Vec3) => void
  setEdgeEnd: (point: Vec3) => void
  setTargetEdge: (edge: TargetEdge) => void
  setOffset: (offset: number) => void
  setCount: (count: number) => void
  cancel: () => void
  /** Advance to adjusting phase (from previewing) */
  beginAdjusting: () => void
  /** Mark ready for commit (caller handles actual model store integration) */
  confirmPlacement: () => void
}

const initialState = {
  phase: 'idle' as PlacementPhase,
  shapeId: null as string | null,
  shape: null as Shape2D | null,
  targetEdge: null as TargetEdge | null,
  edgeStart: null as Vec3 | null,
  offset: 0,
  count: 1,
}

export const usePlacementStore = create<PlacementState>((set) => ({
  ...initialState,

  startPlacement: (shape) =>
    set({
      phase: 'picking-edge',
      shapeId: shape.id,
      shape,
      targetEdge: null,
      edgeStart: null,
      offset: 0,
      count: 1,
    }),

  setEdgeStart: (point) =>
    set({ edgeStart: point }),

  setEdgeEnd: (point) =>
    set((state) => {
      if (!state.edgeStart) return state
      return {
        targetEdge: { start: state.edgeStart, end: point },
        phase: 'previewing',
      }
    }),

  setTargetEdge: (edge) =>
    set({
      targetEdge: edge,
      phase: 'previewing',
    }),

  setOffset: (offset) => set({ offset }),

  setCount: (count) => set({ count: Math.max(1, Math.round(count)) }),

  cancel: () => set(initialState),

  beginAdjusting: () =>
    set((state) => {
      if (state.phase !== 'previewing') return state
      return { phase: 'adjusting' }
    }),

  confirmPlacement: () => set(initialState),
}))
