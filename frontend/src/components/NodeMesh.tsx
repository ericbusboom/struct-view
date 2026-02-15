import type { ThreeEvent } from '@react-three/fiber'
import type { Node } from '../model'
import { isOnPlane } from '../model/WorkingPlane'
import { createMember } from '../model'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { usePlaneStore } from '../store/usePlaneStore'

const NODE_RADIUS = 0.08
const NODE_RADIUS_SELECTED = 0.1
const NODE_COLOR = '#4a9eff'
const SELECTED_COLOR = '#ffff00'
const TRUSS_HIGHLIGHT_COLOR = '#00e5ff'
const PIVOT_COLOR = '#ff00ff'
const SUPPORT_FIXED_COLOR = '#ff6b4a'
const SUPPORT_PINNED_COLOR = '#ffb84a'
const HOVER_COLOR = '#00e5ff'
const GHOST_COLOR = '#888888'
const GHOST_OPACITY = 0.15

function nodeColor(node: Node, isHighlighted: boolean, isTrussHighlighted: boolean, isPivot: boolean): string {
  if (isPivot) return PIVOT_COLOR
  if (isHighlighted) return SELECTED_COLOR
  if (isTrussHighlighted) return TRUSS_HIGHLIGHT_COLOR
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
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId)
  const select = useEditorStore((s) => s.select)
  const toggleSelect = useEditorStore((s) => s.toggleSelect)
  const selectGroup = useEditorStore((s) => s.selectGroup)
  const memberStartNode = useEditorStore((s) => s.memberStartNode)
  const setMemberStartNode = useEditorStore((s) => s.setMemberStartNode)
  const setDragNodeId = useEditorStore((s) => s.setDragNodeId)
  const rotatePivotNodeId = useEditorStore((s) => s.rotatePivotNodeId)
  const setRotatePivotNodeId = useEditorStore((s) => s.setRotatePivotNodeId)
  const addMember = useModelStore((s) => s.addMember)

  const isFocused = usePlaneStore((s) => s.isFocused)
  const activePlane = usePlaneStore((s) => s.activePlane)
  const isHovered = useEditorStore((s) => s.hoverNodeId === node.id)

  const isMemberStart = memberStartNode === node.id
  const isTrussHighlighted = !!(node.groupId && selectedGroupId && node.groupId === selectedGroupId)
  const isPivot = rotatePivotNodeId === node.id
  const highlighted = isSelected || isMemberStart

  // Ghost rendering: off-plane nodes are transparent gray when focused
  const onPlane = isFocused && activePlane ? isOnPlane(node.position, activePlane) : true
  const ghosted = isFocused && !onPlane

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    if (mode === 'rotate' && selectedGroupId && node.groupId === selectedGroupId) {
      setRotatePivotNodeId(node.id)
      return
    }

    if (mode === 'select') {
      if (e.nativeEvent.shiftKey) {
        toggleSelect(node.id, 'node')
      } else if (node.groupId) {
        selectGroup(node.groupId)
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
    <mesh
      position={[x, y, z]}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      renderOrder={ghosted ? 0 : 10}
    >
      <sphereGeometry args={[(highlighted || isTrussHighlighted || isPivot || isHovered) ? NODE_RADIUS_SELECTED : NODE_RADIUS, 16, 16]} />
      <meshStandardMaterial
        color={ghosted ? GHOST_COLOR : isHovered ? HOVER_COLOR : nodeColor(node, highlighted, isTrussHighlighted, isPivot)}
        transparent={ghosted}
        opacity={ghosted ? GHOST_OPACITY : 1}
        depthWrite={!ghosted}
      />
    </mesh>
  )
}
