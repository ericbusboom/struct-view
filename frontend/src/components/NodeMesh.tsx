import type { Node } from '../model'

const NODE_RADIUS = 0.08
const NODE_COLOR = '#4a9eff'
const SUPPORT_FIXED_COLOR = '#ff6b4a'
const SUPPORT_PINNED_COLOR = '#ffb84a'

function nodeColor(node: Node): string {
  if (node.support.type === 'fixed') return SUPPORT_FIXED_COLOR
  if (node.support.type !== 'free') return SUPPORT_PINNED_COLOR
  return NODE_COLOR
}

interface Props {
  node: Node
}

export default function NodeMesh({ node }: Props) {
  const { x, y, z } = node.position
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[NODE_RADIUS, 16, 16]} />
      <meshStandardMaterial color={nodeColor(node)} />
    </mesh>
  )
}
