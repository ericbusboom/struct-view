import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { createPlaneFromPoints } from '../model'
import type { WorkingPlane } from '../model/WorkingPlane'
import type { Vec3 } from '../model'

/**
 * Build a WorkingPlane from the currently selected nodes/members.
 * Gathers positions from selected nodes and the endpoints of selected members,
 * then creates a plane from up to 3 points.
 * Returns null if nothing is selected.
 */
export function getPlaneFromSelection(): WorkingPlane | null {
  const { selectedNodeIds, selectedMemberIds } = useEditorStore.getState()
  const { nodes, members } = useModelStore.getState()

  const points: Vec3[] = []
  for (const id of selectedNodeIds) {
    const node = nodes.find((n) => n.id === id)
    if (node) points.push({ ...node.position })
  }
  for (const id of selectedMemberIds) {
    const member = members.find((m) => m.id === id)
    if (member) {
      const startNode = nodes.find((n) => n.id === member.start_node)
      const endNode = nodes.find((n) => n.id === member.end_node)
      if (startNode) points.push({ ...startNode.position })
      if (endNode) points.push({ ...endNode.position })
    }
  }

  if (points.length === 0) return null
  return createPlaneFromPoints(points.slice(0, 3))
}
