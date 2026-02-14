import { useMemo } from 'react'
import * as THREE from 'three'
import { usePlacementStore } from '../store/usePlacementStore'
import { useModelStore } from '../store/useModelStore'
import { placeShape } from '../editor2d/placeShape'
import { placeEqualSpacing } from '../editor2d/equalSpacing'
import type { Node, Member } from '../model'

const PREVIEW_NODE_COLOR = '#44aaff'
const PREVIEW_MEMBER_COLOR = '#44aaff'
const PREVIEW_OPACITY = 0.5
const NODE_RADIUS = 0.06
const TUBE_RADIUS = 0.02

/**
 * Renders a translucent ghost preview of the shape(s) being placed.
 * Active during previewing and adjusting phases.
 */
export default function PlacementPreview() {
  const phase = usePlacementStore((s) => s.phase)
  const shape = usePlacementStore((s) => s.shape)
  const targetEdge = usePlacementStore((s) => s.targetEdge)
  const offset = usePlacementStore((s) => s.offset)
  const count = usePlacementStore((s) => s.count)
  const existingNodes = useModelStore((s) => s.nodes)

  const preview = useMemo(() => {
    if (!shape || !targetEdge) return { nodes: [] as Node[], members: [] as Member[] }

    if (count <= 1) {
      return placeShape(shape, targetEdge, offset)
    } else {
      return placeEqualSpacing(shape, targetEdge, count, existingNodes)
    }
  }, [shape, targetEdge, offset, count, existingNodes])

  if (phase !== 'previewing' && phase !== 'adjusting') return null
  if (preview.nodes.length === 0) return null

  const nodeMap = new Map<string, Node>()
  for (const n of preview.nodes) nodeMap.set(n.id, n)

  return (
    <group>
      {preview.nodes.map((node) => (
        <mesh key={node.id} position={[node.position.x, node.position.y, node.position.z]}>
          <sphereGeometry args={[NODE_RADIUS, 12, 12]} />
          <meshBasicMaterial color={PREVIEW_NODE_COLOR} transparent opacity={PREVIEW_OPACITY} />
        </mesh>
      ))}
      {preview.members.map((member) => {
        const startNode = nodeMap.get(member.start_node)
        const endNode = nodeMap.get(member.end_node)
        if (!startNode || !endNode) return null

        const start = new THREE.Vector3(startNode.position.x, startNode.position.y, startNode.position.z)
        const end = new THREE.Vector3(endNode.position.x, endNode.position.y, endNode.position.z)
        const path = new THREE.LineCurve3(start, end)
        const tubeGeometry = new THREE.TubeGeometry(path, 1, TUBE_RADIUS, 8, false)

        return (
          <mesh key={member.id} geometry={tubeGeometry}>
            <meshBasicMaterial
              color={PREVIEW_MEMBER_COLOR}
              transparent
              opacity={PREVIEW_OPACITY}
              wireframe
            />
          </mesh>
        )
      })}
    </group>
  )
}
