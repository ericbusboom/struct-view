import { describe, it, expect, beforeEach } from 'vitest'
import { useCanvas2DStore, screenToWorld, worldToScreen } from '../useCanvas2DStore'
import type { Camera2D } from '../useCanvas2DStore'

beforeEach(() => {
  useCanvas2DStore.setState({
    camera: { offsetX: 0, offsetY: 0, zoom: 40 },
    isOpen: false,
  })
})

describe('screenToWorld / worldToScreen', () => {
  it('produces correct coordinates at default camera', () => {
    const camera: Camera2D = { offsetX: 0, offsetY: 0, zoom: 40 }
    const world = screenToWorld(80, 120, camera)
    expect(world.x).toBeCloseTo(2)
    expect(world.y).toBeCloseTo(3)

    const screen = worldToScreen(2, 3, camera)
    expect(screen.x).toBeCloseTo(80)
    expect(screen.y).toBeCloseTo(120)
  })

  it('accounts for pan offset', () => {
    const camera: Camera2D = { offsetX: 100, offsetY: 200, zoom: 40 }
    const world = screenToWorld(100, 200, camera)
    expect(world.x).toBeCloseTo(0)
    expect(world.y).toBeCloseTo(0)

    const world2 = screenToWorld(140, 240, camera)
    expect(world2.x).toBeCloseTo(1)
    expect(world2.y).toBeCloseTo(1)
  })

  it('round-trips correctly', () => {
    const camera: Camera2D = { offsetX: 50, offsetY: -30, zoom: 25 }
    const screen = worldToScreen(3.5, -1.2, camera)
    const world = screenToWorld(screen.x, screen.y, camera)
    expect(world.x).toBeCloseTo(3.5)
    expect(world.y).toBeCloseTo(-1.2)
  })
})

describe('useCanvas2DStore', () => {
  it('pans the camera', () => {
    useCanvas2DStore.getState().pan(10, -5)
    const { camera } = useCanvas2DStore.getState()
    expect(camera.offsetX).toBe(10)
    expect(camera.offsetY).toBe(-5)
  })

  it('zoom maintains world point under cursor', () => {
    // Place cursor at screen (80, 80) with default camera
    const store = useCanvas2DStore.getState()
    const beforeWorld = screenToWorld(80, 80, store.camera)

    // Zoom in 2x
    store.zoomAt(80, 80, 2)

    const after = useCanvas2DStore.getState().camera
    const afterWorld = screenToWorld(80, 80, after)
    expect(afterWorld.x).toBeCloseTo(beforeWorld.x, 5)
    expect(afterWorld.y).toBeCloseTo(beforeWorld.y, 5)
    expect(after.zoom).toBeCloseTo(80)
  })

  it('clamps zoom to min/max', () => {
    // Try to zoom out far beyond min
    useCanvas2DStore.getState().zoomAt(0, 0, 0.0001)
    expect(useCanvas2DStore.getState().camera.zoom).toBeGreaterThanOrEqual(0.05)

    // Reset and try to zoom in far beyond max
    useCanvas2DStore.setState({ camera: { offsetX: 0, offsetY: 0, zoom: 40 } })
    useCanvas2DStore.getState().zoomAt(0, 0, 10000)
    expect(useCanvas2DStore.getState().camera.zoom).toBeLessThanOrEqual(100)
  })

  it('toggles open state', () => {
    expect(useCanvas2DStore.getState().isOpen).toBe(false)
    useCanvas2DStore.getState().toggle()
    expect(useCanvas2DStore.getState().isOpen).toBe(true)
    useCanvas2DStore.getState().toggle()
    expect(useCanvas2DStore.getState().isOpen).toBe(false)
  })
})
