import { useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { projectToPlane } from '../editor3d/planeMove'
import { computeGroupCentroid, constrainDeltaToPlane } from '../editor3d/groupMove'
import { findGroupSnap } from '../editor3d/groupSnap'

/**
 * Invisible overlay that captures pointer events for truss dragging.
 * Active when a truss is selected and the move tool is active.
 */
export default function TrussDragger() {
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId)
  const mode = useEditorStore((s) => s.mode)
  const activePlane = useEditorStore((s) => s.activePlane)
  const getNodesByGroupId = useModelStore((s) => s.getNodesByGroupId)
  const allNodes = useModelStore((s) => s.nodes)
  const updateNode = useModelStore((s) => s.updateNode)
  const { camera } = useThree()

  const isDragging = useRef(false)
  const lastHit = useRef<{ x: number; y: number; z: number } | null>(null)

  const isActive = mode === 'move' && !!selectedGroupId

  const getIntersection = useCallback(
    (clientX: number, clientY: number) => {
      if (!selectedGroupId) return null
      const trussNodes = getNodesByGroupId(selectedGroupId)
      if (trussNodes.length === 0) return null

      const centroid = computeGroupCentroid(trussNodes)
      const ndc = new THREE.Vector2(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1,
      )
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(ndc, camera)

      const rayOrigin = {
        x: raycaster.ray.origin.x,
        y: raycaster.ray.origin.y,
        z: raycaster.ray.origin.z,
      }
      const rayDir = {
        x: raycaster.ray.direction.x,
        y: raycaster.ray.direction.y,
        z: raycaster.ray.direction.z,
      }

      return projectToPlane(rayOrigin, rayDir, centroid, activePlane)
    },
    [selectedGroupId, getNodesByGroupId, camera, activePlane],
  )

  const handlePointerDown = useCallback(
    (e: { nativeEvent: PointerEvent }) => {
      if (!isActive) return
      const hit = getIntersection(e.nativeEvent.clientX, e.nativeEvent.clientY)
      if (hit) {
        isDragging.current = true
        lastHit.current = hit
      }
    },
    [isActive, getIntersection],
  )

  const handlePointerMove = useCallback(
    (e: { nativeEvent: PointerEvent }) => {
      if (!isDragging.current || !lastHit.current || !selectedGroupId) return

      const hit = getIntersection(e.nativeEvent.clientX, e.nativeEvent.clientY)
      if (!hit) return

      const rawDelta = {
        x: hit.x - lastHit.current.x,
        y: hit.y - lastHit.current.y,
        z: hit.z - lastHit.current.z,
      }
      const delta = constrainDeltaToPlane(rawDelta, activePlane)

      const trussNodes = getNodesByGroupId(selectedGroupId)
      for (const node of trussNodes) {
        updateNode(node.id, {
          position: {
            x: node.position.x + delta.x,
            y: node.position.y + delta.y,
            z: node.position.z + delta.z,
          },
        })
      }

      lastHit.current = hit
    },
    [selectedGroupId, getNodesByGroupId, updateNode, activePlane, getIntersection],
  )

  const handlePointerUp = useCallback(() => {
    if (isDragging.current && selectedGroupId) {
      // Apply snap on release
      const trussNodes = getNodesByGroupId(selectedGroupId)
      const snap = findGroupSnap(trussNodes, allNodes, selectedGroupId, 0.5)
      if (snap) {
        // Re-read truss nodes after potential updates
        const currentNodes = getNodesByGroupId(selectedGroupId)
        for (const node of currentNodes) {
          updateNode(node.id, {
            position: {
              x: node.position.x + snap.delta.x,
              y: node.position.y + snap.delta.y,
              z: node.position.z + snap.delta.z,
            },
          })
        }
      }
    }
    isDragging.current = false
    lastHit.current = null
  }, [selectedGroupId, getNodesByGroupId, allNodes, updateNode])

  if (!isActive) return null

  return (
    <mesh
      visible={false}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      renderOrder={-1}
    >
      <sphereGeometry args={[500]} />
      <meshBasicMaterial visible={false} side={THREE.BackSide} />
    </mesh>
  )
}
