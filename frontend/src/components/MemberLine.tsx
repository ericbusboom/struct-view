import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { Member, Node } from '../model'
import { useEditorStore } from '../store/useEditorStore'
import { usePlacementStore } from '../store/usePlacementStore'

const MEMBER_COLOR = '#cccccc'
const SELECTED_COLOR = '#ffff00'
const TRUSS_HIGHLIGHT_COLOR = '#00e5ff'
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
  const selectedTrussId = useEditorStore((s) => s.selectedTrussId)
  const mode = useEditorStore((s) => s.mode)
  const select = useEditorStore((s) => s.select)
  const toggleSelect = useEditorStore((s) => s.toggleSelect)
  const selectTruss = useEditorStore((s) => s.selectTruss)

  const isTrussHighlighted = !!(member.trussId && selectedTrussId && member.trussId === selectedTrussId)

  const geometry = useMemo(() => {
    if (!startNode || !endNode) return null
    const start = new THREE.Vector3(startNode.position.x, startNode.position.y, startNode.position.z)
    const end = new THREE.Vector3(endNode.position.x, endNode.position.y, endNode.position.z)
    const path = new THREE.LineCurve3(start, end)
    return new THREE.TubeGeometry(path, 1, TUBE_RADIUS, TUBE_SEGMENTS, false)
  }, [startNode, endNode])

  const placementPhase = usePlacementStore((s) => s.phase)
  const setTargetEdge = usePlacementStore((s) => s.setTargetEdge)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    // During placement edge picking, clicking a member uses its endpoints
    if (placementPhase === 'picking-edge' && startNode && endNode) {
      setTargetEdge({
        start: { ...startNode.position },
        end: { ...endNode.position },
      })
      return
    }

    if (mode === 'select') {
      if (e.nativeEvent.shiftKey) {
        toggleSelect(member.id, 'member')
      } else if (member.trussId) {
        selectTruss(member.trussId)
      } else {
        select(member.id, 'member')
      }
    }
  }

  if (!geometry) return null

  return (
    <mesh geometry={geometry} onClick={handleClick}>
      <meshStandardMaterial color={isSelected ? SELECTED_COLOR : isTrussHighlighted ? TRUSS_HIGHLIGHT_COLOR : MEMBER_COLOR} />
    </mesh>
  )
}
