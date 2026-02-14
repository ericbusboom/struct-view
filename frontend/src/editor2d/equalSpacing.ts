import type { Vec3, Shape2D, Node, Member } from '../model'
import { placeShape } from './placeShape'
import type { TargetEdge } from './placeShape'
import { mergeCoincidentNodes, applyNodeRemap, MERGE_TOLERANCE } from './mergeNodes'

/**
 * Compute N evenly-spaced positions along a target edge.
 * For N=1, returns the midpoint. For N>=2, returns positions at t = i/(N-1).
 */
export function computeEqualSpacingPositions(
  edgeStart: Vec3,
  edgeEnd: Vec3,
  count: number,
): Vec3[] {
  if (count <= 0) return []
  if (count === 1) {
    return [{
      x: (edgeStart.x + edgeEnd.x) / 2,
      y: (edgeStart.y + edgeEnd.y) / 2,
      z: (edgeStart.z + edgeEnd.z) / 2,
    }]
  }

  const positions: Vec3[] = []
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    positions.push({
      x: edgeStart.x + t * (edgeEnd.x - edgeStart.x),
      y: edgeStart.y + t * (edgeEnd.y - edgeStart.y),
      z: edgeStart.z + t * (edgeEnd.z - edgeStart.z),
    })
  }
  return positions
}

/**
 * Place N copies of a shape at equal spacing along a target edge,
 * with incremental node merging between copies and against existing nodes.
 */
export function placeEqualSpacing(
  shape: Shape2D,
  targetEdge: TargetEdge,
  count: number,
  existingNodes: Node[],
): { nodes: Node[]; members: Member[] } {
  const positions = computeEqualSpacingPositions(targetEdge.start, targetEdge.end, count)

  let accumulatedNodes = [...existingNodes]
  const allNewNodes: Node[] = []
  const allNewMembers: Member[] = []

  for (const pos of positions) {
    // Create a sub-edge for this copy: snap edge aligned at this position
    // The target edge for each copy has the same direction as the original
    const dx = targetEdge.end.x - targetEdge.start.x
    const dy = targetEdge.end.y - targetEdge.start.y
    const dz = targetEdge.end.z - targetEdge.start.z
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (len === 0) continue

    // Compute a sub-target edge of the same length as the original
    // but starting at the computed position
    const copyEdge: TargetEdge = {
      start: pos,
      end: {
        x: pos.x + dx,
        y: pos.y + dy,
        z: pos.z + dz,
      },
    }

    const placed = placeShape(shape, copyEdge, 0)

    // Merge against accumulated nodes
    const { mergedNodes, remapTable } = mergeCoincidentNodes(
      accumulatedNodes,
      placed.nodes,
      MERGE_TOLERANCE,
    )
    const remappedMembers = applyNodeRemap(placed.members, remapTable)

    allNewNodes.push(...mergedNodes)
    allNewMembers.push(...remappedMembers)
    accumulatedNodes = [...accumulatedNodes, ...mergedNodes]
  }

  return { nodes: allNewNodes, members: allNewMembers }
}
