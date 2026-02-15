import type { Vec3, Node } from '../model'

export interface GroupSnapResult {
  /** The group node that is near a model node */
  groupNodeId: string
  /** The model node it is near */
  targetNodeId: string
  /** Position of the target node */
  targetPosition: Vec3
  /** Distance between the two */
  distance: number
  /** Delta to apply to the entire group to co-locate these nodes */
  delta: Vec3
}

/**
 * Find the closest snap candidate between group nodes and non-group model nodes.
 * Returns null if no candidate is within the threshold.
 *
 * @param groupNodes - Nodes belonging to the selected group
 * @param allNodes - All model nodes
 * @param groupId - The groupId of the selected group (to exclude from targets)
 * @param threshold - Snap distance threshold
 */
export function findGroupSnap(
  groupNodes: Node[],
  allNodes: Node[],
  groupId: string,
  threshold: number,
): GroupSnapResult | null {
  // Target nodes: all nodes NOT in the selected group
  const targets = allNodes.filter((n) => n.groupId !== groupId)

  let best: GroupSnapResult | null = null

  for (const gn of groupNodes) {
    for (const target of targets) {
      const dx = target.position.x - gn.position.x
      const dy = target.position.y - gn.position.y
      const dz = target.position.z - gn.position.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist <= threshold && (!best || dist < best.distance)) {
        best = {
          groupNodeId: gn.id,
          targetNodeId: target.id,
          targetPosition: { ...target.position },
          distance: dist,
          delta: { x: dx, y: dy, z: dz },
        }
      }
    }
  }

  return best
}
