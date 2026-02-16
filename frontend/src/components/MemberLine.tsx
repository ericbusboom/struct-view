import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { Member, Node } from '../model'
import { isOnPlane, NEAR_PLANE_THRESHOLD } from '../model/WorkingPlane'
import { useEditorStore } from '../store/useEditorStore'
import { usePlaneStore } from '../store/usePlaneStore'

const MEMBER_COLOR = '#cccccc'
const SELECTED_COLOR = '#ffff00'
const TRUSS_HIGHLIGHT_COLOR = '#00e5ff'
const GHOST_COLOR = '#888888'
const GHOST_OPACITY = 0.15
const NEAR_PLANE_OPACITY = 0.4
const TUBE_RADIUS = 0.025
const TUBE_SEGMENTS = 8

interface Props {
  member: Member
  nodes: Map<string, Node>
}

export default function MemberLine({ member, nodes }: Props) {
  const startNode = nodes.get(member.start_node)
  const endNode = nodes.get(member.end_node)
  const isSelected = useEditorStore((s) => s.selectedMemberIds.has(member.id))
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId)
  const mode = useEditorStore((s) => s.mode)
  const select = useEditorStore((s) => s.select)
  const toggleSelect = useEditorStore((s) => s.toggleSelect)
  const selectGroup = useEditorStore((s) => s.selectGroup)

  const isFocused = usePlaneStore((s) => s.isFocused)
  const activePlane = usePlaneStore((s) => s.activePlane)

  const isTrussHighlighted = !!(member.groupId && selectedGroupId && member.groupId === selectedGroupId)

  // Visibility tiers: on-plane (full), near-plane (semi), ghosted
  const { ghosted, nearPlane } = useMemo(() => {
    if (!isFocused || !activePlane || !startNode || !endNode)
      return { ghosted: false, nearPlane: false }
    const startOn = isOnPlane(startNode.position, activePlane)
    const endOn = isOnPlane(endNode.position, activePlane)
    if (startOn && endOn) return { ghosted: false, nearPlane: false }
    // At least one endpoint near the plane → show as near-plane
    const startNear = isOnPlane(startNode.position, activePlane, NEAR_PLANE_THRESHOLD)
    const endNear = isOnPlane(endNode.position, activePlane, NEAR_PLANE_THRESHOLD)
    if ((startOn || startNear) && (endOn || endNear))
      return { ghosted: false, nearPlane: true }
    return { ghosted: true, nearPlane: false }
  }, [isFocused, activePlane, startNode, endNode])

  const geometry = useMemo(() => {
    if (!startNode || !endNode) return null
    const start = new THREE.Vector3(startNode.position.x, startNode.position.y, startNode.position.z)
    const end = new THREE.Vector3(endNode.position.x, endNode.position.y, endNode.position.z)
    const path = new THREE.LineCurve3(start, end)
    return new THREE.TubeGeometry(path, 1, TUBE_RADIUS, TUBE_SEGMENTS, false)
  }, [startNode, endNode])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    if (mode === 'select') {
      if (e.nativeEvent.shiftKey) {
        toggleSelect(member.id, 'member')
      } else if (member.groupId) {
        selectGroup(member.groupId)
      } else {
        select(member.id, 'member')
      }
    }
  }

  if (!geometry) return null

  let color = MEMBER_COLOR
  if (ghosted) {
    color = GHOST_COLOR
  } else if (isSelected) {
    color = SELECTED_COLOR
  } else if (isTrussHighlighted) {
    color = TRUSS_HIGHLIGHT_COLOR
  }

  const opacity = ghosted ? GHOST_OPACITY : nearPlane ? NEAR_PLANE_OPACITY : 1
  const renderOrder = ghosted ? 0 : nearPlane ? 5 : 10

  return (
    <mesh geometry={geometry} onClick={handleClick} renderOrder={renderOrder}>
      <meshStandardMaterial
        color={color}
        transparent={ghosted || nearPlane}
        opacity={opacity}
        depthWrite={!ghosted && !nearPlane}
      />
    </mesh>
  )
}
