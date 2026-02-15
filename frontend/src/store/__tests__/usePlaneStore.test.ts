import { describe, it, expect, beforeEach } from 'vitest'
import { usePlaneStore } from '../usePlaneStore'
import { createPlaneFromPoints, _resetPlaneIdCounter } from '../../model'

function resetStore() {
  usePlaneStore.setState({
    activePlane: null,
    isFocused: false,
    savedCameraState: null,
  })
}

describe('usePlaneStore', () => {
  beforeEach(() => {
    resetStore()
    _resetPlaneIdCounter()
  })

  it('starts with no active plane', () => {
    expect(usePlaneStore.getState().activePlane).toBeNull()
    expect(usePlaneStore.getState().isFocused).toBe(false)
  })

  it('setActivePlane sets the active plane', () => {
    const plane = createPlaneFromPoints([])
    usePlaneStore.getState().setActivePlane(plane)
    expect(usePlaneStore.getState().activePlane).toBe(plane)
    expect(usePlaneStore.getState().isFocused).toBe(false)
  })

  it('setActivePlane resets focus and saved camera', () => {
    const plane1 = createPlaneFromPoints([])
    const plane2 = createPlaneFromPoints([{ x: 1, y: 0, z: 0 }])
    usePlaneStore.getState().setActivePlane(plane1)
    usePlaneStore.getState().toggleFocus()
    usePlaneStore.getState().saveCameraState({
      position: { x: 0, y: 0, z: 10 },
      quaternion: { x: 0, y: 0, z: 0, w: 1 },
      isOrthographic: false,
      zoom: 1,
    })

    usePlaneStore.getState().setActivePlane(plane2)
    expect(usePlaneStore.getState().isFocused).toBe(false)
    expect(usePlaneStore.getState().savedCameraState).toBeNull()
  })

  it('clearActivePlane clears plane and focus', () => {
    const plane = createPlaneFromPoints([])
    usePlaneStore.getState().setActivePlane(plane)
    usePlaneStore.getState().toggleFocus()
    usePlaneStore.getState().clearActivePlane()

    expect(usePlaneStore.getState().activePlane).toBeNull()
    expect(usePlaneStore.getState().isFocused).toBe(false)
  })

  it('toggleFocus toggles isFocused when plane is active', () => {
    const plane = createPlaneFromPoints([])
    usePlaneStore.getState().setActivePlane(plane)

    usePlaneStore.getState().toggleFocus()
    expect(usePlaneStore.getState().isFocused).toBe(true)

    usePlaneStore.getState().toggleFocus()
    expect(usePlaneStore.getState().isFocused).toBe(false)
  })

  it('toggleFocus does nothing when no active plane', () => {
    usePlaneStore.getState().toggleFocus()
    expect(usePlaneStore.getState().isFocused).toBe(false)
  })

  it('saveCameraState stores camera state', () => {
    const cam = {
      position: { x: 0, y: 5, z: 10 },
      quaternion: { x: 0, y: 0, z: 0, w: 1 },
      isOrthographic: false,
      zoom: 1,
    }
    usePlaneStore.getState().saveCameraState(cam)
    expect(usePlaneStore.getState().savedCameraState).toEqual(cam)
  })

  it('updatePlane replaces the active plane', () => {
    const plane1 = createPlaneFromPoints([])
    const plane2 = createPlaneFromPoints([{ x: 3, y: 0, z: 0 }])
    usePlaneStore.getState().setActivePlane(plane1)
    usePlaneStore.getState().updatePlane(plane2)
    expect(usePlaneStore.getState().activePlane?.id).toBe(plane2.id)
  })
})
