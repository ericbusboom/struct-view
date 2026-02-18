import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { useEditorStore } from '../store/useEditorStore'
import { usePlaneStore } from '../store/usePlaneStore'

export default function GroundPlane() {
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const isFocused = usePlaneStore((s) => s.isFocused)
  const meshRef = useRef<THREE.Mesh>(null)

  // Disable raycasting entirely when in focus mode so the ground plane
  // cannot intercept clicks meant for PlanePlacer
  useEffect(() => {
    if (!meshRef.current) return
    if (isFocused) {
      meshRef.current.raycast = () => {}
    } else {
      meshRef.current.raycast = THREE.Mesh.prototype.raycast
    }
  }, [isFocused])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    clearSelection()
  }

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} onClick={handleClick}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}
