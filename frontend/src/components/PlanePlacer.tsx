import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { createNode, createMember } from '../model'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { usePlaneStore } from '../store/usePlaneStore'
import { snapToPlaneGrid, findNearestOnPlaneNode } from '../editor3d/planeSnap'

const GRID_SIZE = 1.0
const SNAP_RADIUS = 0.5

/**
 * Handles node/beam placement and hover highlighting in focus mode.
 * Renders an invisible double-sided plane mesh to catch click/pointer
 * events, then snaps the intersection point to the grid.
 *
 * Uses e.point from R3F's raycaster directly (already correct for the
 * current camera) instead of building a second raycaster manually.
 */
export default function PlanePlacer() {
  const mode = useEditorStore((s) => s.mode)
  const isFocused = usePlaneStore((s) => s.isFocused)
  const activePlane = usePlaneStore((s) => s.activePlane)

  const addNode = useModelStore((s) => s.addNode)
  const addMember = useModelStore((s) => s.addMember)
  const nodes = useModelStore((s) => s.nodes)
  const memberStartNode = useEditorStore((s) => s.memberStartNode)
  const setMemberStartNode = useEditorStore((s) => s.setMemberStartNode)
  const setHoverNodeId = useEditorStore((s) => s.setHoverNodeId)
  const lastHoverRef = useRef<string | null>(null)

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!isFocused || !activePlane) return
      if (mode !== 'add-node' && mode !== 'add-member') return

      e.stopPropagation()

      // e.point is the world-space intersection from R3F's raycaster
      const snapped = snapToPlaneGrid(
        { x: e.point.x, y: e.point.y, z: e.point.z },
        activePlane,
        GRID_SIZE,
      )

      const nearNodeId = findNearestOnPlaneNode(
        snapped,
        nodes.map((n) => ({ id: n.id, position: n.position })),
        activePlane,
        SNAP_RADIUS,
      )

      if (mode === 'add-node') {
        if (nearNodeId) {
          console.log(`[place] node snap — reusing existing node ${nearNodeId}`)
          return
        }
        const node = createNode({ position: snapped })
        addNode(node)
        console.log(
          `[place] node at (${snapped.x.toFixed(1)}, ${snapped.y.toFixed(1)}, ${snapped.z.toFixed(1)})`,
        )
      } else if (mode === 'add-member') {
        let nodeId: string
        if (nearNodeId) {
          nodeId = nearNodeId
          console.log(`[place] member endpoint — reusing node ${nearNodeId}`)
        } else {
          const node = createNode({ position: snapped })
          addNode(node)
          nodeId = node.id
          console.log(
            `[place] member endpoint — new node at (${snapped.x.toFixed(1)}, ${snapped.y.toFixed(1)}, ${snapped.z.toFixed(1)})`,
          )
        }

        if (!memberStartNode) {
          setMemberStartNode(nodeId)
          console.log(`[place] member start → ${nodeId}`)
        } else if (memberStartNode !== nodeId) {
          const member = createMember(memberStartNode, nodeId)
          addMember(member)
          console.log(`[place] member from ${memberStartNode} to ${nodeId}`)
          setMemberStartNode(null)
        }
      }
    },
    [isFocused, activePlane, mode, nodes, addNode, addMember, memberStartNode, setMemberStartNode],
  )

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isFocused || !activePlane) return
      if (mode !== 'add-node' && mode !== 'add-member') return

      const snapped = snapToPlaneGrid(
        { x: e.point.x, y: e.point.y, z: e.point.z },
        activePlane,
        GRID_SIZE,
      )
      const nearNodeId = findNearestOnPlaneNode(
        snapped,
        nodes.map((n) => ({ id: n.id, position: n.position })),
        activePlane,
        SNAP_RADIUS,
      )

      // Only update store when the hovered node changes (avoid thrashing)
      if (nearNodeId !== lastHoverRef.current) {
        lastHoverRef.current = nearNodeId
        setHoverNodeId(nearNodeId)
      }
    },
    [isFocused, activePlane, mode, nodes, setHoverNodeId],
  )

  if (!isFocused || !activePlane) return null

  const n = activePlane.normal
  const pt = activePlane.point
  const up = new THREE.Vector3(0, 0, 1)
  const normal = new THREE.Vector3(n.x, n.y, n.z)
  const quat = new THREE.Quaternion().setFromUnitVectors(up, normal)

  return (
    <mesh
      position={[pt.x, pt.y, pt.z]}
      quaternion={quat}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
    </mesh>
  )
}
