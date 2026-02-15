import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { usePlaneStore } from '../store/usePlaneStore'
import type { CameraState } from '../store/usePlaneStore'

const FOCUS_DISTANCE = 15

/**
 * Controls camera position when entering/exiting 2D focus mode.
 * On focus: saves camera state, creates an orthographic camera snapped to
 * the plane normal, updates OrbitControls, and disables rotation.
 * On unfocus: restores saved perspective camera and re-enables rotation.
 */
export default function FocusCameraController() {
  const { camera, controls, set, size } = useThree()
  const isFocused = usePlaneStore((s) => s.isFocused)
  const activePlane = usePlaneStore((s) => s.activePlane)
  const savedCameraState = usePlaneStore((s) => s.savedCameraState)
  const saveCameraState = usePlaneStore((s) => s.saveCameraState)
  const prevFocused = useRef(false)
  const savedTarget = useRef(new THREE.Vector3())
  const savedCamera = useRef<THREE.Camera | null>(null)

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
      savedCamera.current = camera

      // Save OrbitControls target
      if (orbitControls?.target) {
        savedTarget.current.copy(orbitControls.target)
      }

      // Compute orthographic frustum to match perspective view size at the plane
      const aspect = size.width / size.height
      const perspCamera = camera as THREE.PerspectiveCamera
      const fov = perspCamera.fov ?? 50
      const halfHeight = FOCUS_DISTANCE * Math.tan(THREE.MathUtils.degToRad(fov / 2))
      const halfWidth = halfHeight * aspect

      // Create orthographic camera (no vanishing point)
      const orthoCamera = new THREE.OrthographicCamera(
        -halfWidth, halfWidth,
        halfHeight, -halfHeight,
        0.1, 1000,
      )

      // Position camera above the plane looking down the normal
      const n = activePlane.normal
      const pt = activePlane.point
      orthoCamera.position.set(
        pt.x + n.x * FOCUS_DISTANCE,
        pt.y + n.y * FOCUS_DISTANCE,
        pt.z + n.z * FOCUS_DISTANCE,
      )

      // Set up vector to tangentV for correct orientation
      orthoCamera.up.set(activePlane.tangentV.x, activePlane.tangentV.y, activePlane.tangentV.z)
      orthoCamera.lookAt(pt.x, pt.y, pt.z)
      orthoCamera.updateProjectionMatrix()

      // Swap camera in R3F
      set({ camera: orthoCamera })

      // Update OrbitControls to use new camera, disable rotation
      if (orbitControls) {
        orbitControls.object = orthoCamera
        orbitControls.target.set(pt.x, pt.y, pt.z)
        orbitControls.enableRotate = false
        orbitControls.update()
      }

      console.log(`[focus] ON — ortho camera, frustum ±${halfWidth.toFixed(1)}×±${halfHeight.toFixed(1)}`)
    }

    if (!isFocused && prevFocused.current && savedCameraState && savedCamera.current) {
      // Exiting focus: restore saved perspective camera
      const perspCamera = savedCamera.current
      perspCamera.position.set(
        savedCameraState.position.x,
        savedCameraState.position.y,
        savedCameraState.position.z,
      )
      perspCamera.quaternion.set(
        savedCameraState.quaternion.x,
        savedCameraState.quaternion.y,
        savedCameraState.quaternion.z,
        savedCameraState.quaternion.w,
      )
      perspCamera.up.set(0, 0, 1) // Restore default up (Z-up)
      perspCamera.updateProjectionMatrix()

      // Swap camera back in R3F
      set({ camera: perspCamera })

      // Restore OrbitControls and re-enable rotation
      if (orbitControls) {
        orbitControls.object = perspCamera
        orbitControls.target.copy(savedTarget.current)
        orbitControls.enableRotate = true
        orbitControls.update()
      }

      savedCamera.current = null
      console.log(`[focus] OFF — perspective camera restored`)
    }

    prevFocused.current = isFocused
  }, [isFocused, activePlane, savedCameraState, camera, saveCameraState, controls, set, size])

  return null
}
