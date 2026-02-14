import type { Vec3, Node, Member } from '../model'

export type Snap3DType = 'node' | 'midpoint' | 'grid' | 'none'

export interface Snap3DResult {
  point: Vec3
  type: Snap3DType
  sourceId?: string
}

export interface Snap3DOptions {
  snapRadius: number
  gridSize: number
}

function dist3D(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function memberMidpoint(startNode: Node, endNode: Node): Vec3 {
  return {
    x: (startNode.position.x + endNode.position.x) / 2,
    y: (startNode.position.y + endNode.position.y) / 2,
    z: (startNode.position.z + endNode.position.z) / 2,
  }
}

function snapToGrid3D(cursor: Vec3, gridSize: number): Vec3 {
  return {
    x: Math.round(cursor.x / gridSize) * gridSize,
    y: Math.round(cursor.y / gridSize) * gridSize,
    z: Math.round(cursor.z / gridSize) * gridSize,
  }
}

/**
 * Calculate the best 3D snap target for a cursor position.
 * Priority: existing node > member midpoint > grid.
 */
export function snapPoint3D(
  cursor: Vec3,
  nodes: Node[],
  members: Member[],
  options: Snap3DOptions,
): Snap3DResult {
  const { snapRadius, gridSize } = options

  // Build node lookup
  const nodeMap = new Map<string, Node>()
  for (const n of nodes) {
    nodeMap.set(n.id, n)
  }

  // Priority 1: Snap to nearest node
  let closestNode: Node | null = null
  let closestNodeDist = Infinity
  for (const node of nodes) {
    const d = dist3D(cursor, node.position)
    if (d < snapRadius && d < closestNodeDist) {
      closestNodeDist = d
      closestNode = node
    }
  }
  if (closestNode) {
    return {
      point: { ...closestNode.position },
      type: 'node',
      sourceId: closestNode.id,
    }
  }

  // Priority 2: Snap to member midpoint
  let closestMid: Vec3 | null = null
  let closestMidDist = Infinity
  let closestMidId: string | undefined
  for (const member of members) {
    const start = nodeMap.get(member.start_node)
    const end = nodeMap.get(member.end_node)
    if (!start || !end) continue
    const mid = memberMidpoint(start, end)
    const d = dist3D(cursor, mid)
    if (d < snapRadius && d < closestMidDist) {
      closestMidDist = d
      closestMid = mid
      closestMidId = member.id
    }
  }
  if (closestMid) {
    return {
      point: closestMid,
      type: 'midpoint',
      sourceId: closestMidId,
    }
  }

  // Priority 3: Snap to grid
  if (gridSize > 0) {
    return {
      point: snapToGrid3D(cursor, gridSize),
      type: 'grid',
    }
  }

  return { point: cursor, type: 'none' }
}
