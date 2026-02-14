import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { Member, Node } from '../model'
import { useEditorStore } from '../store/useEditorStore'

const MEMBER_COLOR = '#cccccc'
const SELECTED_COLOR = '#ffff00'
const TUBE_RADIUS = 0.025
const TUBE_SEGMENTS = 8

interface Props {
  member: Member
  nodes: Map<string, Node>
}

export default function MemberLine({ member, nodes }: Props) {
  const startNode = nodes.get(member.start_node)
  const endNode = nodes.get(member.end_node)
  const selectedId = useEditorStore((s) => s.selectedId)
  const mode = useEditorStore((s) => s.mode)
  const select = useEditorStore((s) => s.select)

  const isSelected = selectedId === member.id

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
      select(member.id, 'member')
    }
  }

  if (!geometry) return null

  return (
    <mesh geometry={geometry} onClick={handleClick}>
      <meshStandardMaterial color={isSelected ? SELECTED_COLOR : MEMBER_COLOR} />
    </mesh>
  )
}
