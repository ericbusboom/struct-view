import type { ThreeEvent } from '@react-three/fiber'
import type { Node } from '../model'
import { createMember } from '../model'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'

const NODE_RADIUS = 0.08
const NODE_RADIUS_SELECTED = 0.1
const NODE_COLOR = '#4a9eff'
const SELECTED_COLOR = '#ffff00'
const SUPPORT_FIXED_COLOR = '#ff6b4a'
const SUPPORT_PINNED_COLOR = '#ffb84a'

function nodeColor(node: Node, isHighlighted: boolean): string {
  if (isHighlighted) return SELECTED_COLOR
  if (node.support.type === 'fixed') return SUPPORT_FIXED_COLOR
  if (node.support.type !== 'free') return SUPPORT_PINNED_COLOR
  return NODE_COLOR
}

interface Props {
  node: Node
}

export default function NodeMesh({ node }: Props) {
  const { x, y, z } = node.position

  const mode = useEditorStore((s) => s.mode)
  const isSelected = useEditorStore((s) => s.selectedNodeIds.has(node.id))
  const select = useEditorStore((s) => s.select)
  const toggleSelect = useEditorStore((s) => s.toggleSelect)
  const memberStartNode = useEditorStore((s) => s.memberStartNode)
  const setMemberStartNode = useEditorStore((s) => s.setMemberStartNode)
  const setDragNodeId = useEditorStore((s) => s.setDragNodeId)
  const addMember = useModelStore((s) => s.addMember)

  const isMemberStart = memberStartNode === node.id
  const highlighted = isSelected || isMemberStart

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    if (mode === 'select') {
      if (e.nativeEvent.shiftKey) {
        toggleSelect(node.id, 'node')
      } else {
        select(node.id, 'node')
      }
    } else if (mode === 'add-member') {
      if (!memberStartNode) {
        setMemberStartNode(node.id)
      } else if (memberStartNode !== node.id) {
        const member = createMember(memberStartNode, node.id)
        addMember(member)
        setMemberStartNode(null)
      }
    }
  }

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (mode === 'move') {
      e.stopPropagation()
      select(node.id, 'node')
      setDragNodeId(node.id)
    }
  }

  return (
    <mesh position={[x, y, z]} onClick={handleClick} onPointerDown={handlePointerDown}>
      <sphereGeometry args={[highlighted ? NODE_RADIUS_SELECTED : NODE_RADIUS, 16, 16]} />
      <meshStandardMaterial color={nodeColor(node, highlighted)} />
    </mesh>
  )
}
