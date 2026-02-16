import { create } from 'zustand'
import type { Vec3 } from '../model'

/** Absolute camera state (position + target + up). */
export interface CameraAction {
  position: Vec3
  target: Vec3
  up: Vec3
}

/**
 * View-direction action: camera moves to look FROM a direction.
 * `viewFrom` is the direction from the orbit target to the desired camera position.
 * The camera keeps its current distance and orbit target.
 * Up is always Z-up (with fallback for top/bottom views).
 */
export interface ViewFromAction {
  viewFrom: Vec3
}

export type AnyAction = CameraAction | ViewFromAction

interface CameraActionState {
  pendingAction: AnyAction | null
  requestAction: (action: AnyAction) => void
  clearAction: () => void
}

export const useCameraActionStore = create<CameraActionState>((set) => ({
  pendingAction: null,
  requestAction: (action) => set({ pendingAction: action }),
  clearAction: () => set({ pendingAction: null }),
}))
