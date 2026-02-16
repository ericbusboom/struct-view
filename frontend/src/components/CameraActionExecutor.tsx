import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useCameraActionStore } from '../store/useCameraActionStore'
import { usePlaneStore } from '../store/usePlaneStore'

const ANIM_SPEED = 5 // completes in ~0.2s

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/**
 * Headless Canvas component that consumes camera actions from the store
 * and smoothly animates the camera to the target position/orientation.
 */
export default function CameraActionExecutor() {
  const { camera, controls } = useThree()
  const pendingAction = useCameraActionStore((s) => s.pendingAction)
  const clearAction = useCameraActionStore((s) => s.clearAction)

  const animating = useRef(false)
  const progress = useRef(0)
  const startPos = useRef(new THREE.Vector3())
  const endPos = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())
  const endTarget = useRef(new THREE.Vector3())
  const startUp = useRef(new THREE.Vector3())
  const endUp = useRef(new THREE.Vector3())

  useEffect(() => {
    if (!pendingAction) return

    // Don't animate while in 2D focus mode
    if (usePlaneStore.getState().isFocused) {
      clearAction()
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orbitControls = controls as any

    // Capture start state
    startPos.current.copy(camera.position)
    startUp.current.set(0, 0, 1) // Always start from Z-up
    if (orbitControls?.target) {
      startTarget.current.copy(orbitControls.target)
    } else {
      startTarget.current.set(0, 0, 0)
    }

    if ('viewFrom' in pendingAction) {
      // View-direction action: compute camera state from current orbit state
      const dir = pendingAction.viewFrom
      const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z)
      if (len < 1e-10) { clearAction(); return }
      const nx = dir.x / len, ny = dir.y / len, nz = dir.z / len

      const distance = camera.position.distanceTo(startTarget.current)
      endPos.current.set(
        startTarget.current.x + nx * distance,
        startTarget.current.y + ny * distance,
        startTarget.current.z + nz * distance,
      )
      endTarget.current.copy(startTarget.current) // keep same orbit target

      // Z-up for side views; for top/bottom (looking along Z), use Y
      if (Math.abs(nz) > 0.99) {
        endUp.current.set(0, nz > 0 ? -1 : 1, 0) // top: -Y, bottom: +Y
      } else {
        endUp.current.set(0, 0, 1)
      }
    } else {
      // Absolute camera state
      const { position, target, up } = pendingAction
      endPos.current.set(position.x, position.y, position.z)
      endTarget.current.set(target.x, target.y, target.z)
      endUp.current.set(up.x, up.y, up.z)
    }

    // Disable orbit controls during animation
    if (orbitControls) {
      orbitControls.enabled = false
    }

    progress.current = 0
    animating.current = true
    clearAction()
  }, [pendingAction, camera, controls, clearAction])

  useFrame((_, delta) => {
    if (!animating.current) return

    progress.current = Math.min(1, progress.current + delta * ANIM_SPEED)
    const t = smoothstep(progress.current)

    // Interpolate position, target, and up
    camera.position.lerpVectors(startPos.current, endPos.current, t)
    camera.up.lerpVectors(startUp.current, endUp.current, t).normalize()

    // Update orbit controls target
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orbitControls = controls as any
    if (orbitControls?.target) {
      orbitControls.target.lerpVectors(startTarget.current, endTarget.current, t)
    }

    // Make camera look at interpolated target
    const currentTarget = new THREE.Vector3().lerpVectors(startTarget.current, endTarget.current, t)
    camera.lookAt(currentTarget)

    if (orbitControls) {
      orbitControls.update()
    }

    if (progress.current >= 1) {
      animating.current = false
      // Ensure exact final state
      camera.position.copy(endPos.current)
      camera.up.copy(endUp.current)
      camera.lookAt(endTarget.current)
      if (orbitControls) {
        orbitControls.target.copy(endTarget.current)
        orbitControls.enabled = true
        orbitControls.update()
      }
    }
  })

  return null
}
