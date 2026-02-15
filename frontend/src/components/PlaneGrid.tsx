import { useMemo } from 'react'
import * as THREE from 'three'
import { usePlaneStore } from '../store/usePlaneStore'
import { getPlaneColor } from '../model'

const GRID_SIZE = 20
const GRID_DIVISIONS = 40
const GRID_OPACITY = 0.25

/**
 * Renders a translucent colored grid on the active working plane.
 * Color indicates axis alignment: red=XY, blue=YZ, green=XZ, yellow=general.
 */
export default function PlaneGrid() {
  const activePlane = usePlaneStore((s) => s.activePlane)

  const { position, quaternion, color } = useMemo(() => {
    if (!activePlane) return { position: [0, 0, 0] as const, quaternion: new THREE.Quaternion(), color: '#ffcc00' }

    const pos = [activePlane.point.x, activePlane.point.y, activePlane.point.z] as const
    const c = getPlaneColor(activePlane.normal)

    // Build rotation quaternion to align grid with plane normal
    // GridHelper lies in XZ plane (normal = Y). We need to rotate from Y to our normal.
    const fromDir = new THREE.Vector3(0, 1, 0)
    const toDir = new THREE.Vector3(activePlane.normal.x, activePlane.normal.y, activePlane.normal.z)
    const q = new THREE.Quaternion().setFromUnitVectors(fromDir, toDir)

    return { position: pos, quaternion: q, color: c }
  }, [activePlane])

  if (!activePlane) return null

  return (
    <group position={[position[0], position[1], position[2]]} quaternion={quaternion}>
      <gridHelper
        args={[GRID_SIZE, GRID_DIVISIONS, color, color]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
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
