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
  const plane = createPlaneFromPoints(points.slice(0, 3))

  // Compute the minimum extent needed to encompass all selection points.
  // Project every point onto the plane's tangent axes relative to the origin point.
  let maxU = 0
  let maxV = 0
  for (const p of points) {
    const dx = p.x - plane.point.x
    const dy = p.y - plane.point.y
    const dz = p.z - plane.point.z
    const u = Math.abs(dx * plane.tangentU.x + dy * plane.tangentU.y + dz * plane.tangentU.z)
    const v = Math.abs(dx * plane.tangentV.x + dy * plane.tangentV.y + dz * plane.tangentV.z)
    maxU = Math.max(maxU, u)
    maxV = Math.max(maxV, v)
  }
  // Diameter (both sides of origin) + padding so elements aren't at the very edge
  const extent = Math.max(maxU, maxV) * 2 + 2
  plane.minExtent = extent

  return plane
}
