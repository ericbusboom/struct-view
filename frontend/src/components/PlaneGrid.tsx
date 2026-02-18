import { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { usePlaneStore } from '../store/usePlaneStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { getPlaneColor } from '../model'

const GRID_OPACITY = 0.25

/**
 * Renders a translucent colored grid on the active working plane.
 * Color indicates axis alignment: red=XY, blue=YZ, green=XZ, yellow=general.
 * Grid lines are aligned with the working plane's tangent vectors and pass
 * through the world origin (so grid positions match world-space integers on
 * axis-aligned planes).
 * Raycasting is disabled so the grid never intercepts mouse events.
 */
export default function PlaneGrid() {
  const activePlane = usePlaneStore((s) => s.activePlane)
  const workPlaneSize = useSettingsStore((s) => s.workPlaneSize)
  const snapGridSize = useSettingsStore((s) => s.snapGridSize)
  const meshRef = useRef<THREE.Mesh>(null)
  const gridRef = useRef<THREE.GridHelper>(null)

  // Disable raycasting on the translucent overlay mesh and grid
  useEffect(() => {
    if (meshRef.current) meshRef.current.raycast = () => {}
    if (gridRef.current) gridRef.current.raycast = () => {}
  }, [])

  const { position, quaternion, gridOffset, color } = useMemo(() => {
    if (!activePlane) return {
      position: [0, 0, 0] as const,
      quaternion: new THREE.Quaternion(),
      gridOffset: [0, 0, 0] as const,
      color: '#ffcc00',
    }

    const pos = [activePlane.point.x, activePlane.point.y, activePlane.point.z] as const
    const c = getPlaneColor(activePlane.normal)

    // Build a right-handed basis for the GridHelper.
    // GridHelper lies in local XZ (Y = up). We map:
    //   local X → tangentU,  local Y → normal,  local Z → cross(tangentU, normal)
    // cross(tangentU, normal) ensures det = +1 (proper rotation, not reflection).
    const tU = new THREE.Vector3(activePlane.tangentU.x, activePlane.tangentU.y, activePlane.tangentU.z)
    const n  = new THREE.Vector3(activePlane.normal.x, activePlane.normal.y, activePlane.normal.z)
    const gridZ = new THREE.Vector3().crossVectors(tU, n)

    const mat = new THREE.Matrix4().makeBasis(tU, n, gridZ)
    const q = new THREE.Quaternion().setFromRotationMatrix(mat)

    // Offset the grid so that lines pass through the world origin.
    // Compute the origin's position in the GridHelper's local axes.
    const d = new THREE.Vector3(-activePlane.point.x, -activePlane.point.y, -activePlane.point.z)
    const localU = d.dot(tU)
    const localV = d.dot(gridZ)
    const fracU = localU - Math.round(localU)
    const fracV = localV - Math.round(localV)

    return { position: pos, quaternion: q, gridOffset: [fracU, 0, fracV] as const, color: c }
  }, [activePlane])

  const effectiveSize = Math.max(workPlaneSize, activePlane?.minExtent ?? 0)
  const gridDivisions = Math.round(effectiveSize / snapGridSize)

  if (!activePlane) return null

  return (
    <group position={[position[0], position[1], position[2]]} quaternion={quaternion}>
      <gridHelper
        ref={gridRef}
        args={[effectiveSize, gridDivisions, color, color]}
        position={[gridOffset[0], gridOffset[1], gridOffset[2]]}
      />
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[effectiveSize, effectiveSize]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={GRID_OPACITY}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
