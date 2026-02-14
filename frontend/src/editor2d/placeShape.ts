import { nanoid } from 'nanoid'
import type { Shape2D, Node, Member, Vec3 } from '../model'
import { createNode, createMember } from '../model'

export interface TargetEdge {
  start: Vec3
  end: Vec3
}

export interface PlacementResult {
  nodes: Node[]
  members: Member[]
}

/**
 * Find the first snap edge in a shape, or fall back to the first member.
 * Returns the two endpoint nodes of the snap edge in local 2D space.
 */
function findSnapEdge(shape: Shape2D): { start: { x: number; y: number }; end: { x: number; y: number } } | null {
  const nodeMap = new Map(shape.nodes.map((n) => [n.id, n]))
  const snapMember = shape.members.find((m) => m.isSnapEdge) ?? shape.members[0]
  if (!snapMember) return null
  const start = nodeMap.get(snapMember.startNode)
  const end = nodeMap.get(snapMember.endNode)
  if (!start || !end) return null
  return { start: { x: start.x, y: start.y }, end: { x: end.x, y: end.y } }
}

/**
 * Transform a Shape2D from local 2D coordinates to 3D world coordinates,
 * aligning the snap edge to a target 3D edge.
 *
 * The shape's 2D X axis aligns to the target edge direction.
 * The shape's 2D Y axis aligns perpendicular in the plane formed by
 * the target edge direction and a computed "up" vector.
 *
 * @param offset - 0..1 parameter to slide along the target edge (0 = start, 1 = end minus shape width)
 */
export function placeShape(
  shape: Shape2D,
  targetEdge: TargetEdge,
  offset: number = 0,
): PlacementResult {
  const snapEdge = findSnapEdge(shape)
  if (!snapEdge || shape.nodes.length === 0) {
    return { nodes: [], members: [] }
  }

  // Snap edge direction in 2D (local space)
  const localDx = snapEdge.end.x - snapEdge.start.x
  const localDy = snapEdge.end.y - snapEdge.start.y
  const localLen = Math.sqrt(localDx * localDx + localDy * localDy)
  if (localLen === 0) return { nodes: [], members: [] }

  // Target edge direction in 3D
  const targetDx = targetEdge.end.x - targetEdge.start.x
  const targetDy = targetEdge.end.y - targetEdge.start.y
  const targetDz = targetEdge.end.z - targetEdge.start.z
  const targetLen = Math.sqrt(targetDx * targetDx + targetDy * targetDy + targetDz * targetDz)
  if (targetLen === 0) return { nodes: [], members: [] }

  // Unit vectors
  // U = target edge direction (maps to local X direction)
  const ux = targetDx / targetLen
  const uy = targetDy / targetLen
  const uz = targetDz / targetLen

  // V = "up" vector perpendicular to U in the plane
  // We need a vector perpendicular to U. Use world Y (0,1,0) as reference,
  // unless U is nearly parallel to Y, in which case use Z.
  let refX = 0, refY = 1, refZ = 0
  const dotUp = Math.abs(uy)
  if (dotUp > 0.9) {
    refX = 0; refY = 0; refZ = 1
  }

  // V = cross(U, ref), then normalize -> this gives the "right" vector
  // Then W = cross(V, U) for the "up" in the placement plane
  // Actually: we want local Y to map to something perpendicular to U
  let vx = uy * refZ - uz * refY
  let vy = uz * refX - ux * refZ
  let vz = ux * refY - uy * refX
  const vLen = Math.sqrt(vx * vx + vy * vy + vz * vz)
  vx /= vLen; vy /= vLen; vz /= vLen

  // W = cross(U, V) — the shape's local Y maps to W
  const wx = uy * vz - uz * vy
  const wy = uz * vx - ux * vz
  const wz = ux * vy - uy * vx

  // Scale factor: target length / local snap edge length
  const scale = targetLen / localLen

  // Origin offset: slide along target edge
  const ox = targetEdge.start.x + offset * targetDx - (snapEdge.start.x * scale) * ux - (snapEdge.start.y * scale) * wx
  const oy = targetEdge.start.y + offset * targetDy - (snapEdge.start.x * scale) * uy - (snapEdge.start.y * scale) * wy
  const oz = targetEdge.start.z + offset * targetDz - (snapEdge.start.x * scale) * uz - (snapEdge.start.y * scale) * wz

  // Transform each node from local 2D to world 3D
  const idMap = new Map<string, string>()
  const nodes: Node[] = []

  for (const n of shape.nodes) {
    const worldX = ox + (n.x * scale) * ux + (n.y * scale) * wx
    const worldY = oy + (n.x * scale) * uy + (n.y * scale) * wy
    const worldZ = oz + (n.x * scale) * uz + (n.y * scale) * wz
    const newId = nanoid()
    idMap.set(n.id, newId)
    nodes.push(createNode({
      id: newId,
      position: { x: worldX, y: worldY, z: worldZ },
    }))
  }

  // Create members with remapped node ids
  const members: Member[] = []
  for (const m of shape.members) {
    const startId = idMap.get(m.startNode)
    const endId = idMap.get(m.endNode)
    if (startId && endId) {
      members.push(createMember(startId, endId))
    }
  }

  return { nodes, members }
}
