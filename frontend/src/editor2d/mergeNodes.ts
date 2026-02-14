import type { Node, Member } from '../model'

export const MERGE_TOLERANCE = 0.001 // 1mm

function dist3D(a: Node, b: Node): number {
  const dx = a.position.x - b.position.x
  const dy = a.position.y - b.position.y
  const dz = a.position.z - b.position.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Merge coincident nodes: for each new node within tolerance of an existing
 * node, discard the new node and record a remapping.
 */
export function mergeCoincidentNodes(
  existingNodes: Node[],
  newNodes: Node[],
  tolerance: number = MERGE_TOLERANCE,
): { mergedNodes: Node[]; remapTable: Map<string, string> } {
  const remapTable = new Map<string, string>()
  const mergedNodes: Node[] = []

  for (const newNode of newNodes) {
    let merged = false
    for (const existing of existingNodes) {
      if (dist3D(newNode, existing) <= tolerance) {
        remapTable.set(newNode.id, existing.id)
        merged = true
        break
      }
    }
    if (!merged) {
      mergedNodes.push(newNode)
    }
  }

  return { mergedNodes, remapTable }
}

/**
 * Remap member start/end node references. Removes degenerate members
 * (where start === end after remapping).
 */
export function applyNodeRemap(
  members: Member[],
  remapTable: Map<string, string>,
): Member[] {
  const result: Member[] = []
  for (const m of members) {
    const startNode = remapTable.get(m.start_node) ?? m.start_node
    const endNode = remapTable.get(m.end_node) ?? m.end_node
    if (startNode === endNode) continue // degenerate
    result.push({ ...m, start_node: startNode, end_node: endNode })
  }
  return result
}
