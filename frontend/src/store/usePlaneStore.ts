import { create } from 'zustand'
import type { WorkingPlane } from '../model'

export interface CameraState {
  position: { x: number; y: number; z: number }
  quaternion: { x: number; y: number; z: number; w: number }
  isOrthographic: boolean
  zoom: number
}

export interface PlaneState {
  activePlane: WorkingPlane | null
  isFocused: boolean
  savedCameraState: CameraState | null

  setActivePlane: (plane: WorkingPlane) => void
  clearActivePlane: () => void
  toggleFocus: () => void
  saveCameraState: (state: CameraState) => void
  updatePlane: (plane: WorkingPlane) => void
}

export const usePlaneStore = create<PlaneState>((set, get) => ({
  activePlane: null,
  isFocused: false,
  savedCameraState: null,

  setActivePlane: (plane) =>
    set({ activePlane: plane, isFocused: false, savedCameraState: null }),

  clearActivePlane: () =>
    set({ activePlane: null, isFocused: false, savedCameraState: null }),

  toggleFocus: () => {
    const { activePlane, isFocused } = get()
    if (!activePlane) return
    set({ isFocused: !isFocused })
  },

  saveCameraState: (state) =>
    set({ savedCameraState: state }),

  updatePlane: (plane) =>
    set({ activePlane: plane }),
}))
