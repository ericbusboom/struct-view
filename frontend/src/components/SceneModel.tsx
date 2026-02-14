import { useMemo } from 'react'
import { useModelStore } from '../store/useModelStore'
import type { Node } from '../model'
import NodeMesh from './NodeMesh'
import MemberLine from './MemberLine'

export default function SceneModel() {
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)

  const nodeMap = useMemo(() => {
    const map = new Map<string, Node>()
    for (const n of nodes) map.set(n.id, n)
    return map
  }, [nodes])

  return (
    <group>
      {nodes.map((node) => (
        <NodeMesh key={node.id} node={node} />
      ))}
      {members.map((member) => (
        <MemberLine key={member.id} member={member} nodes={nodeMap} />
      ))}
    </group>
  )
}
