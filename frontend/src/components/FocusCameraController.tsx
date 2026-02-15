import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { usePlaneStore } from '../store/usePlaneStore'
import type { CameraState } from '../store/usePlaneStore'

const FOCUS_DISTANCE = 15

/**
 * Controls camera position when entering/exiting 2D focus mode.
 * On focus: saves camera state, snaps to orthogonal view looking down the plane normal.
 * On unfocus: restores saved camera state.
 */
export default function FocusCameraController() {
  const { camera } = useThree()
  const isFocused = usePlaneStore((s) => s.isFocused)
  const activePlane = usePlaneStore((s) => s.activePlane)
  const savedCameraState = usePlaneStore((s) => s.savedCameraState)
  const saveCameraState = usePlaneStore((s) => s.saveCameraState)
  const prevFocused = useRef(false)

  useEffect(() => {
    if (isFocused && activePlane && !prevFocused.current) {
      // Entering focus: save current camera state
      const state: CameraState = {
        position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        quaternion: { x: camera.quaternion.x, y: camera.quaternion.y, z: camera.quaternion.z, w: camera.quaternion.w },
        isOrthographic: camera instanceof THREE.OrthographicCamera,
        zoom: camera.zoom,
      }
      saveCameraState(state)

      // Position camera above the plane looking down the negative normal
      const n = activePlane.normal
      camera.position.set(
        activePlane.point.x + n.x * FOCUS_DISTANCE,
        activePlane.point.y + n.y * FOCUS_DISTANCE,
        activePlane.point.z + n.z * FOCUS_DISTANCE,
      )

      // Look at the plane anchor point
      camera.lookAt(activePlane.point.x, activePlane.point.y, activePlane.point.z)

      // Set up vector to tangentV for correct orientation
      camera.up.set(activePlane.tangentV.x, activePlane.tangentV.y, activePlane.tangentV.z)
      camera.lookAt(activePlane.point.x, activePlane.point.y, activePlane.point.z)
      camera.updateProjectionMatrix()
    }

    if (!isFocused && prevFocused.current && savedCameraState) {
      // Exiting focus: restore saved camera state
      camera.position.set(
        savedCameraState.position.x,
        savedCameraState.position.y,
        savedCameraState.position.z,
      )
      camera.quaternion.set(
        savedCameraState.quaternion.x,
        savedCameraState.quaternion.y,
        savedCameraState.quaternion.z,
        savedCameraState.quaternion.w,
      )
      camera.up.set(0, 1, 0) // Restore default up
      camera.updateProjectionMatrix()
    }

    prevFocused.current = isFocused
  }, [isFocused, activePlane, savedCameraState, camera, saveCameraState])

  return null
}
