import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { snapPoint3D } from '../editor3d/snap3d'
import { useSettingsStore } from '../store/useSettingsStore'

/**
 * Invisible full-scene plane that captures pointer events during node drag.
 * Only active when dragNodeId is set (move mode, pointer down on a node).
 */
export default function NodeDragger() {
  const dragNodeId = useEditorStore((s) => s.dragNodeId)
  const setDragNodeId = useEditorStore((s) => s.setDragNodeId)
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)
  const updateNode = useModelStore((s) => s.updateNode)
  const { camera, gl } = useThree()
  const snapGridSize = useSettingsStore((s) => s.snapGridSize)

  const dragPlane = useRef(new THREE.Plane())
  const raycasterRef = useRef(new THREE.Raycaster())
  const intersectPoint = useRef(new THREE.Vector3())

  // When drag starts, set up the drag plane facing the camera through the node
  useEffect(() => {
    if (!dragNodeId) return
    const node = nodes.find((n) => n.id === dragNodeId)
    if (!node) return

    const nodePos = new THREE.Vector3(node.position.x, node.position.y, node.position.z)
    const cameraDir = new THREE.Vector3()
    camera.getWorldDirection(cameraDir)
    dragPlane.current.setFromNormalAndCoplanarPoint(cameraDir.negate(), nodePos)
  }, [dragNodeId, camera, nodes])

  if (!dragNodeId) return null

  const handlePointerMove = (e: { point: THREE.Vector3; nativeEvent: PointerEvent }) => {
    if (!dragNodeId) return

    // Compute NDC relative to the canvas element (not the window)
    const rect = gl.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycasterRef.current.setFromCamera(ndc, camera)

    if (raycasterRef.current.ray.intersectPlane(dragPlane.current, intersectPoint.current)) {
      const cursor = {
        x: intersectPoint.current.x,
        y: intersectPoint.current.y,
        z: intersectPoint.current.z,
      }

      const otherNodes = nodes.filter((n) => n.id !== dragNodeId)
      const snapped = snapPoint3D(cursor, otherNodes, members, {
        snapRadius: snapGridSize / 2,
        gridSize: snapGridSize,
      })

      updateNode(dragNodeId, { position: snapped.point })
    }
  }

  const handlePointerUp = () => {
    setDragNodeId(null)
  }

  return (
    <mesh
      visible={false}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      renderOrder={-1}
    >
      <sphereGeometry args={[500]} />
      <meshBasicMaterial visible={false} side={THREE.BackSide} />
    </mesh>
  )
}
