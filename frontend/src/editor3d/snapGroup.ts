import type { Vec3, Node } from '../model'

export interface GroupSnapResult {
  /** The truss node that is near a model node */
  trussNodeId: string
  /** The model node it is near */
  targetNodeId: string
  /** Position of the target node */
  targetPosition: Vec3
  /** Distance between the two */
  distance: number
  /** Delta to apply to the entire truss to co-locate these nodes */
  delta: Vec3
}

/**
 * Find the closest snap candidate between truss nodes and non-truss model nodes.
 * Returns null if no candidate is within the threshold.
 *
 * @param trussNodes - Nodes belonging to the selected truss
 * @param allNodes - All model nodes
 * @param trussId - The trussId of the selected truss (to exclude from targets)
 * @param threshold - Snap distance threshold
 */
export function findGroupSnap(
  trussNodes: Node[],
  allNodes: Node[],
  trussId: string,
  threshold: number,
): GroupSnapResult | null {
  // Target nodes: all nodes NOT in the selected truss
  const targets = allNodes.filter((n) => n.trussId !== trussId)

  let best: GroupSnapResult | null = null

  for (const tn of trussNodes) {
    for (const target of targets) {
      const dx = target.position.x - tn.position.x
      const dy = target.position.y - tn.position.y
      const dz = target.position.z - tn.position.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist <= threshold && (!best || dist < best.distance)) {
        best = {
          trussNodeId: tn.id,
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
