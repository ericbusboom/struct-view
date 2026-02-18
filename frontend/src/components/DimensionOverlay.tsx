import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import type { Node } from '../model'

function distance(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontFamily: 'monospace',
  color: '#ccc',
  background: 'rgba(0, 0, 0, 0.6)',
  padding: '1px 4px',
  borderRadius: '3px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  userSelect: 'none',
}

const lengthStyle: React.CSSProperties = {
  ...labelStyle,
  color: '#ffcc44',
}

/**
 * Renders dimension annotations in the 3D viewport:
 * - Node coordinates as (x, y, z) near each node
 * - Beam lengths near the center of each beam
 */
export default function DimensionOverlay() {
  const show = useEditorStore((s) => s.showDimensions)
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)

  const nodeMap = useMemo(() => {
    const map = new Map<string, Node>()
    for (const n of nodes) map.set(n.id, n)
    return map
  }, [nodes])

  if (!show) return null

  return (
    <group>
      {/* Node coordinate labels */}
      {nodes.map((node) => (
        <Html
          key={`n-${node.id}`}
          position={[node.position.x, node.position.y, node.position.z]}
          center
          style={{ transform: 'translate(0, -18px)' }}
        >
          <div style={labelStyle}>
            ({node.position.x.toFixed(1)}, {node.position.y.toFixed(1)}, {node.position.z.toFixed(1)})
          </div>
        </Html>
      ))}

      {/* Beam length labels */}
      {members.map((member) => {
        const a = nodeMap.get(member.start_node)
        const b = nodeMap.get(member.end_node)
        if (!a || !b) return null
        const mid: [number, number, number] = [
          (a.position.x + b.position.x) / 2,
          (a.position.y + b.position.y) / 2,
          (a.position.z + b.position.z) / 2,
        ]
        const len = distance(a.position, b.position)
        return (
          <Html key={`m-${member.id}`} position={mid} center>
            <div style={lengthStyle}>{len.toFixed(2)}</div>
          </Html>
        )
      })}
    </group>
  )
}
