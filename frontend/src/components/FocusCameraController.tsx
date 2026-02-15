import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { usePlaneStore } from '../store/usePlaneStore'
import type { CameraState } from '../store/usePlaneStore'

const FOCUS_DISTANCE = 15

/**
 * Controls camera position when entering/exiting 2D focus mode.
 * On focus: saves camera state, snaps to orthogonal view looking down the plane normal,
 * updates OrbitControls target, and disables rotation (pan/zoom only).
 * On unfocus: restores saved camera state and re-enables rotation.
 */
export default function FocusCameraController() {
  const { camera, controls } = useThree()
  const isFocused = usePlaneStore((s) => s.isFocused)
  const activePlane = usePlaneStore((s) => s.activePlane)
  const savedCameraState = usePlaneStore((s) => s.savedCameraState)
  const saveCameraState = usePlaneStore((s) => s.saveCameraState)
  const prevFocused = useRef(false)
  const savedTarget = useRef(new THREE.Vector3())

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orbitControls = controls as any

    if (isFocused && activePlane && !prevFocused.current) {
      // Entering focus: save current camera state
      const state: CameraState = {
        position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        quaternion: { x: camera.quaternion.x, y: camera.quaternion.y, z: camera.quaternion.z, w: camera.quaternion.w },
        isOrthographic: camera instanceof THREE.OrthographicCamera,
        zoom: camera.zoom,
      }
      saveCameraState(state)

      // Save OrbitControls target
      if (orbitControls?.target) {
        savedTarget.current.copy(orbitControls.target)
      }

      // Position camera above the plane looking down the normal
      const n = activePlane.normal
      const pt = activePlane.point
      camera.position.set(
        pt.x + n.x * FOCUS_DISTANCE,
        pt.y + n.y * FOCUS_DISTANCE,
        pt.z + n.z * FOCUS_DISTANCE,
      )

      // Set up vector to tangentV for correct orientation
      camera.up.set(activePlane.tangentV.x, activePlane.tangentV.y, activePlane.tangentV.z)
      camera.lookAt(pt.x, pt.y, pt.z)
      camera.updateProjectionMatrix()

      // Update OrbitControls target and disable rotation
      if (orbitControls) {
        orbitControls.target.set(pt.x, pt.y, pt.z)
        orbitControls.enableRotate = false
        orbitControls.update()
      }

      console.log(`[focus] ON — camera at (${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)}), looking at (${pt.x}, ${pt.y}, ${pt.z})`)
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
      camera.up.set(0, 0, 1) // Restore default up (Z-up)
      camera.updateProjectionMatrix()

      // Restore OrbitControls target and re-enable rotation
      if (orbitControls) {
        orbitControls.target.copy(savedTarget.current)
        orbitControls.enableRotate = true
        orbitControls.update()
      }

      console.log(`[focus] OFF — camera restored`)
    }

    prevFocused.current = isFocused
  }, [isFocused, activePlane, savedCameraState, camera, saveCameraState, controls])

  return null
}
