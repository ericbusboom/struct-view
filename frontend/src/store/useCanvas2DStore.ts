import { create } from 'zustand'

export interface Camera2D {
  offsetX: number
  offsetY: number
  zoom: number
}

export interface Canvas2DState {
  camera: Camera2D
  isOpen: boolean

  setCamera: (camera: Partial<Camera2D>) => void
  pan: (dx: number, dy: number) => void
  zoomAt: (cursorScreenX: number, cursorScreenY: number, factor: number) => void
  open: () => void
  close: () => void
  toggle: () => void
}

const MIN_ZOOM = 0.05
const MAX_ZOOM = 100

export const useCanvas2DStore = create<Canvas2DState>((set) => ({
  camera: { offsetX: 0, offsetY: 0, zoom: 40 }, // 40 pixels per world unit
  isOpen: false,

  setCamera: (partial) =>
    set((state) => ({ camera: { ...state.camera, ...partial } })),

  pan: (dx, dy) =>
    set((state) => ({
      camera: {
        ...state.camera,
        offsetX: state.camera.offsetX + dx,
        offsetY: state.camera.offsetY + dy,
      },
    })),

  zoomAt: (cursorScreenX, cursorScreenY, factor) =>
    set((state) => {
      const { offsetX, offsetY, zoom } = state.camera
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor))
      // Keep the world point under the cursor stationary
      const worldX = (cursorScreenX - offsetX) / zoom
      const worldY = (cursorScreenY - offsetY) / zoom
      return {
        camera: {
          offsetX: cursorScreenX - worldX * newZoom,
          offsetY: cursorScreenY - worldY * newZoom,
          zoom: newZoom,
        },
      }
    }),

  open: () => {
    // Position origin in the lower-left region of the canvas.
    // The pop-up is 80vw x 85vh; canvas area is modal minus header (40px).
    // We want origin at ~10% from left, ~90% from top (10% from bottom)
    // so +X goes right, +Y goes up (screen Y is inverted).
    const canvasW = window.innerWidth * 0.8
    const canvasH = window.innerHeight * 0.85 - 40
    set({
      isOpen: true,
      camera: {
        offsetX: canvasW * 0.1,
        offsetY: canvasH * 0.9,
        zoom: 40,
      },
    })
  },
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))

/** Convert screen pixel coordinates to world coordinates. */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: Camera2D,
): { x: number; y: number } {
  return {
    x: (screenX - camera.offsetX) / camera.zoom,
    y: (screenY - camera.offsetY) / camera.zoom,
  }
}

/** Convert world coordinates to screen pixel coordinates. */
export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: Camera2D,
): { x: number; y: number } {
  return {
    x: worldX * camera.zoom + camera.offsetX,
    y: worldY * camera.zoom + camera.offsetY,
  }
}
