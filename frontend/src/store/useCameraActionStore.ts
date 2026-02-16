import { create } from 'zustand'
import type { Vec3 } from '../model'

export interface CameraAction {
  position: Vec3
  target: Vec3
  up: Vec3
}

interface CameraActionState {
  pendingAction: CameraAction | null
  requestAction: (action: CameraAction) => void
  clearAction: () => void
}

export const useCameraActionStore = create<CameraActionState>((set) => ({
  pendingAction: null,
  requestAction: (action) => set({ pendingAction: action }),
  clearAction: () => set({ pendingAction: null }),
}))
