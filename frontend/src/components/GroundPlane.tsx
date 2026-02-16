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

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    // In focus mode, let PlanePlacer handle placement
    if (isFocused) return

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
    <mesh position={[0, 0, 0]} onClick={handleClick}>
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}
