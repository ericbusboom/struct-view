import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { createNode } from '../model'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { usePlaneStore } from '../store/usePlaneStore'
import { snapPoint3D } from '../editor3d/snap3d'

export default function GroundPlane() {
  const mode = useEditorStore((s) => s.mode)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const addNode = useModelStore((s) => s.addNode)
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)
  const isFocused = usePlaneStore((s) => s.isFocused)
  const meshRef = useRef<THREE.Mesh>(null)

  // Disable raycasting entirely when in focus mode so the ground plane
  // cannot intercept clicks meant for PlanePlacer
  useEffect(() => {
    if (!meshRef.current) return
    if (isFocused) {
      meshRef.current.raycast = () => {}
    } else {
      // Restore default raycast
      meshRef.current.raycast = THREE.Mesh.prototype.raycast
    }
  }, [isFocused])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    if (mode === 'add-node') {
      const cursor = { x: e.point.x, y: e.point.y, z: 0 }
      const snapped = snapPoint3D(cursor, nodes, members, {
        snapRadius: 0.5,
        gridSize: 1.0,
      })
      const node = createNode({ position: snapped.point })
      addNode(node)
    } else if (mode === 'select') {
      clearSelection()
    }
  }

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} onClick={handleClick}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}
