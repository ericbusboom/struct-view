import { useRef, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { computeGroupCentroid } from '../editor3d/groupMove'
import { projectToPlane } from '../editor3d/planeMove'
import { rotatePositionsAroundPivot, snapAngle } from '../editor3d/planeRotate'

const ARC_RADIUS = 2
const ARC_COLOR = '#00e5ff'
const ARC_COLOR_ACTIVE = '#ffff00'
const SNAP_DEG = 15

/** Rotation of the torus so it lies flat in the correct plane. */
const PLANE_ROTATION: Record<string, [number, number, number]> = {
  XZ: [Math.PI / 2, 0, 0],
  XY: [0, 0, 0],
  YZ: [0, 0, Math.PI / 2],
}

/**
 * Visual rotation arc widget. Renders around the truss centroid when
 * rotate mode is active with a truss selected.
 */
export default function RotateArc() {
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId)
  const mode = useEditorStore((s) => s.mode)
  const activePlane = useEditorStore((s) => s.activePlane)
  const rotatePivotNodeId = useEditorStore((s) => s.rotatePivotNodeId)
  const getNodesByGroupId = useModelStore((s) => s.getNodesByGroupId)
  const nodes = useModelStore((s) => s.nodes)
  const updateNode = useModelStore((s) => s.updateNode)
  const { camera } = useThree()

  const isDragging = useRef(false)
  const startAngle = useRef(0)
  const accumulatedAngle = useRef(0)
  const startPositions = useRef<{ id: string; position: { x: number; y: number; z: number } }[]>([])
  const pivotRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 })

  const isActive = mode === 'rotate' && !!selectedGroupId

  const trussNodes = isActive ? getNodesByGroupId(selectedGroupId!) : []

  // Use pivot node position if set, otherwise centroid
  const pivotNode = rotatePivotNodeId ? nodes.find((n) => n.id === rotatePivotNodeId) : null
  const arcCenter = useMemo(() => {
    if (pivotNode) return { ...pivotNode.position }
    return trussNodes.length > 0 ? computeGroupCentroid(trussNodes) : { x: 0, y: 0, z: 0 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pivotNode?.position.x, pivotNode?.position.y, pivotNode?.position.z, trussNodes.length, isActive, ...trussNodes.map((n) => `${n.position.x},${n.position.y},${n.position.z}`)])

  const geometry = useMemo(
    () => new THREE.TorusGeometry(ARC_RADIUS, 0.03, 8, 64),
    [],
  )

  const computeAngleFromEvent = useCallback(
    (clientX: number, clientY: number, pivot: { x: number; y: number; z: number }): number | null => {
      const ndc = new THREE.Vector2(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1,
      )
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(ndc, camera)

      const rayOrigin = { x: raycaster.ray.origin.x, y: raycaster.ray.origin.y, z: raycaster.ray.origin.z }
      const rayDir = { x: raycaster.ray.direction.x, y: raycaster.ray.direction.y, z: raycaster.ray.direction.z }
      const hit = projectToPlane(rayOrigin, rayDir, pivot, activePlane)
      if (!hit) return null

      // Compute angle in the plane
      const dx = hit.x - pivot.x
      const dy = hit.y - pivot.y
      const dz = hit.z - pivot.z

      if (activePlane === 'XZ') return Math.atan2(-dz, dx) * (180 / Math.PI)
      if (activePlane === 'XY') return Math.atan2(dy, dx) * (180 / Math.PI)
      // YZ
      return Math.atan2(dz, dy) * (180 / Math.PI)
    },
    [camera, activePlane],
  )

  const handlePointerDown = useCallback(
    (e: { nativeEvent: PointerEvent; stopPropagation: () => void }) => {
      if (!isActive || !selectedGroupId) return
      e.stopPropagation()

      const tNodes = getNodesByGroupId(selectedGroupId)
      const pNode = rotatePivotNodeId ? nodes.find((n) => n.id === rotatePivotNodeId) : null
      const pivot = pNode ? { ...pNode.position } : computeGroupCentroid(tNodes)
      pivotRef.current = pivot

      const angle = computeAngleFromEvent(e.nativeEvent.clientX, e.nativeEvent.clientY, pivot)
      if (angle === null) return

      isDragging.current = true
      startAngle.current = angle
      accumulatedAngle.current = 0
      startPositions.current = tNodes.map((n) => ({ id: n.id, position: { ...n.position } }))
    },
    [isActive, selectedGroupId, getNodesByGroupId, computeAngleFromEvent, rotatePivotNodeId, nodes],
  )

  const handlePointerMove = useCallback(
    (e: { nativeEvent: PointerEvent }) => {
      if (!isDragging.current || !selectedGroupId) return

      const angle = computeAngleFromEvent(e.nativeEvent.clientX, e.nativeEvent.clientY, pivotRef.current)
      if (angle === null) return

      const rawDelta = angle - startAngle.current
      const snappedDelta = snapAngle(rawDelta, SNAP_DEG)

      if (snappedDelta !== accumulatedAngle.current) {
        accumulatedAngle.current = snappedDelta
        const positions = startPositions.current.map((s) => s.position)
        const rotated = rotatePositionsAroundPivot(positions, pivotRef.current, snappedDelta, activePlane)
        for (let i = 0; i < startPositions.current.length; i++) {
          updateNode(startPositions.current[i].id, { position: rotated[i] })
        }
      }
    },
    [selectedGroupId, activePlane, computeAngleFromEvent, updateNode],
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    startPositions.current = []
  }, [])

  if (!isActive) return null

  const rotation = PLANE_ROTATION[activePlane]

  return (
    <group position={[arcCenter.x, arcCenter.y, arcCenter.z]}>
      <mesh
        geometry={geometry}
        rotation={rotation}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <meshBasicMaterial
          color={isDragging.current ? ARC_COLOR_ACTIVE : ARC_COLOR}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}
