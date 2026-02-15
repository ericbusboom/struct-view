import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { Member, Node } from '../model'
import { isOnPlane } from '../model/WorkingPlane'
import { useEditorStore } from '../store/useEditorStore'
import { usePlaneStore } from '../store/usePlaneStore'

const MEMBER_COLOR = '#cccccc'
const SELECTED_COLOR = '#ffff00'
const TRUSS_HIGHLIGHT_COLOR = '#00e5ff'
const GHOST_COLOR = '#888888'
const GHOST_OPACITY = 0.15
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

  // Ghost rendering: members with either endpoint off-plane are ghosted
  const ghosted = useMemo(() => {
    if (!isFocused || !activePlane || !startNode || !endNode) return false
    const startOnPlane = isOnPlane(startNode.position, activePlane)
    const endOnPlane = isOnPlane(endNode.position, activePlane)
    return !(startOnPlane && endOnPlane)
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

  return (
    <mesh geometry={geometry} onClick={handleClick} renderOrder={ghosted ? 0 : 10}>
      <meshStandardMaterial
        color={color}
        transparent={ghosted}
        opacity={ghosted ? GHOST_OPACITY : 1}
        depthWrite={!ghosted}
      />
    </mesh>
  )
}
