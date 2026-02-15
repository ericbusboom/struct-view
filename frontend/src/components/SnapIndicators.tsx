import { useMemo } from 'react'
import * as THREE from 'three'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { findGroupSnap } from '../editor3d/snapGroup'

const SNAP_THRESHOLD = 0.5
const INDICATOR_COLOR = '#00ff88'
const INDICATOR_RADIUS = 0.12
const LINE_COLOR = '#00ff88'

/**
 * Renders visual snap indicators when a truss node is near a model node
 * during move or rotate operations.
 */
export default function SnapIndicators() {
  const selectedTrussId = useEditorStore((s) => s.selectedTrussId)
  const mode = useEditorStore((s) => s.mode)
  const nodes = useModelStore((s) => s.nodes)
  const getNodesByTrussId = useModelStore((s) => s.getNodesByTrussId)

  const isActive = (mode === 'move' || mode === 'rotate') && !!selectedTrussId

  const snap = useMemo(() => {
    if (!isActive || !selectedTrussId) return null
    const trussNodes = getNodesByTrussId(selectedTrussId)
    return findGroupSnap(trussNodes, nodes, selectedTrussId, SNAP_THRESHOLD)
    // Re-evaluate whenever node positions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, selectedTrussId, nodes])

  if (!snap) return null

  const trussNode = nodes.find((n) => n.id === snap.trussNodeId)
  if (!trussNode) return null

  // Line from truss node to target node
  const lineGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(trussNode.position.x, trussNode.position.y, trussNode.position.z),
      new THREE.Vector3(snap.targetPosition.x, snap.targetPosition.y, snap.targetPosition.z),
    ]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [trussNode.position, snap.targetPosition])

  return (
    <group>
      {/* Highlight sphere at target position */}
      <mesh position={[snap.targetPosition.x, snap.targetPosition.y, snap.targetPosition.z]}>
        <sphereGeometry args={[INDICATOR_RADIUS, 16, 16]} />
        <meshBasicMaterial color={INDICATOR_COLOR} transparent opacity={0.7} />
      </mesh>
      {/* Dashed line connecting the two */}
      <lineSegments geometry={lineGeometry}>
        <lineDashedMaterial color={LINE_COLOR} dashSize={0.1} gapSize={0.05} />
      </lineSegments>
    </group>
  )
}
