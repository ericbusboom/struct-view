import type { ThreeEvent } from '@react-three/fiber'
import { createNode } from '../model'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'

export default function GroundPlane() {
  const mode = useEditorStore((s) => s.mode)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const addNode = useModelStore((s) => s.addNode)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    if (mode === 'add-node') {
      const { x, z } = e.point
      const node = createNode({ position: { x, y: 0, z } })
      addNode(node)
    } else if (mode === 'select') {
      clearSelection()
    }
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={handleClick}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}
