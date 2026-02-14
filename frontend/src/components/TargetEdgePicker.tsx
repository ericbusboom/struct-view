import { useCallback } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { usePlacementStore } from '../store/usePlacementStore'
import { useModelStore } from '../store/useModelStore'
import { snapPoint3D } from '../editor3d/snap3d'

const SNAP_RADIUS = 0.5
const GRID_SIZE = 1.0
const EDGE_LINE_COLOR = '#00ffff'

/**
 * 3D overlay active during the picking-edge phase of placement.
 * First click picks edgeStart, second click picks edgeEnd.
 * Clicking an existing member sets both at once.
 */
export default function TargetEdgePicker() {
  const phase = usePlacementStore((s) => s.phase)
  const edgeStart = usePlacementStore((s) => s.edgeStart)
  const targetEdge = usePlacementStore((s) => s.targetEdge)
  const setEdgeStart = usePlacementStore((s) => s.setEdgeStart)
  const setEdgeEnd = usePlacementStore((s) => s.setEdgeEnd)
  const setTargetEdge = usePlacementStore((s) => s.setTargetEdge)
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()

      const cursor = { x: e.point.x, y: e.point.y, z: e.point.z }
      const snapped = snapPoint3D(cursor, nodes, members, {
        snapRadius: SNAP_RADIUS,
        gridSize: GRID_SIZE,
      })

      // Check if user clicked near a member — use its endpoints directly
      if (snapped.type === 'midpoint' && snapped.sourceId) {
        const member = members.find((m) => m.id === snapped.sourceId)
        if (member) {
          const startNode = nodes.find((n) => n.id === member.start_node)
          const endNode = nodes.find((n) => n.id === member.end_node)
          if (startNode && endNode) {
            setTargetEdge({
              start: { ...startNode.position },
              end: { ...endNode.position },
            })
            return
          }
        }
      }

      if (!edgeStart) {
        setEdgeStart(snapped.point)
      } else {
        setEdgeEnd(snapped.point)
      }
    },
    [nodes, members, edgeStart, setEdgeStart, setEdgeEnd, setTargetEdge],
  )

  // Show edge indicator during previewing/adjusting
  const showEdge = (phase === 'previewing' || phase === 'adjusting') && targetEdge

  if (phase !== 'picking-edge' && !showEdge) return null

  return (
    <>
      {/* Invisible click catcher plane (ground) — only during picking */}
      {phase === 'picking-edge' && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          onClick={handleClick}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      {/* First point indicator during picking */}
      {phase === 'picking-edge' && edgeStart && (
        <mesh position={[edgeStart.x, edgeStart.y, edgeStart.z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color={EDGE_LINE_COLOR} />
        </mesh>
      )}

      {/* Target edge line visible during previewing/adjusting */}
      {showEdge && (
        <Line
          points={[
            [targetEdge.start.x, targetEdge.start.y, targetEdge.start.z],
            [targetEdge.end.x, targetEdge.end.y, targetEdge.end.z],
          ]}
          color={EDGE_LINE_COLOR}
          lineWidth={2}
        />
      )}
    </>
  )
}
