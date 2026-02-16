import type { Vec3, Shape2D, Shape2DNode, Shape2DMember, Node, Member } from '../model'
import type { WorkingPlane } from '../model/WorkingPlane'
import { nanoid } from 'nanoid'

/**
 * Project a 3D world-space point onto a WorkingPlane's 2D (u, v) coordinates.
 *
 * u = dot(worldPos - plane.point, tangentU)
 * v = dot(worldPos - plane.point, tangentV)
 */
export function worldToPlane2D(pos: Vec3, plane: WorkingPlane): { u: number; v: number } {
  const dx = pos.x - plane.point.x
  const dy = pos.y - plane.point.y
  const dz = pos.z - plane.point.z
  const u = dx * plane.tangentU.x + dy * plane.tangentU.y + dz * plane.tangentU.z
  const v = dx * plane.tangentV.x + dy * plane.tangentV.y + dz * plane.tangentV.z
  return { u, v }
}

/**
 * Convert 2D (u, v) plane-local coordinates back to 3D world space.
 *
 * worldPos = plane.point + u * tangentU + v * tangentV
 */
export function plane2DToWorld(u: number, v: number, plane: WorkingPlane): Vec3 {
  return {
    x: plane.point.x + u * plane.tangentU.x + v * plane.tangentV.x,
    y: plane.point.y + u * plane.tangentU.y + v * plane.tangentV.y,
    z: plane.point.z + u * plane.tangentU.z + v * plane.tangentV.z,
  }
}

/**
 * Save a set of 3D nodes and members on a plane as a Shape2D library entry.
 *
 * Projects each node to (u, v) plane coordinates and normalizes so the
 * bottom-left corner is at (0, 0).
 */
export function saveToShape2D(
  nodes: Node[],
  members: Member[],
  plane: WorkingPlane,
  name: string,
): Shape2D {
  if (nodes.length === 0) {
    return { id: nanoid(), name, nodes: [], members: [], placementPlane: 'XZ' }
  }

  // Project all nodes to plane-local 2D
  const projected = nodes.map((n) => ({
    id: n.id,
    ...worldToPlane2D(n.position, plane),
  }))

  // Normalize: shift so min(u) = 0, min(v) = 0
  const minU = Math.min(...projected.map((p) => p.u))
  const minV = Math.min(...projected.map((p) => p.v))

  const shapeNodes: Shape2DNode[] = projected.map((p) => ({
    id: p.id,
    x: p.u - minU,
    y: p.v - minV,
  }))

  // Build node ID set for filtering members
  const nodeIdSet = new Set(nodes.map((n) => n.id))

  const shapeMembers: Shape2DMember[] = members
    .filter((m) => nodeIdSet.has(m.start_node) && nodeIdSet.has(m.end_node))
    .map((m) => ({
      id: m.id,
      startNode: m.start_node,
      endNode: m.end_node,
      isSnapEdge: false,
    }))

  return {
    id: nanoid(),
    name,
    nodes: shapeNodes,
    members: shapeMembers,
    placementPlane: 'XZ',
  }
}

/**
 * Place a Shape2D onto a WorkingPlane at a given offset, creating 3D
 * nodes and members.
 *
 * Returns new Node[] and Member[] ready to add to the model store,
 * with fresh IDs.
 */
export function placeShapeOnPlane(
  shape: Shape2D,
  plane: WorkingPlane,
  offset: { u: number; v: number },
): { nodes: Node[]; members: Member[] } {
  // Map old shape node IDs to new 3D node IDs
  const idMap = new Map<string, string>()
  const nodes: Node[] = shape.nodes.map((sn) => {
    const newId = nanoid()
    idMap.set(sn.id, newId)
    const pos = plane2DToWorld(sn.x + offset.u, sn.y + offset.v, plane)
    return {
      id: newId,
      position: pos,
      support: { type: 'free' as const },
      connection: { type: 'rigid' as const, method: 'welded' as const },
      tags: [],
    }
  })

  const members: Member[] = shape.members.map((sm) => ({
    id: nanoid(),
    start_node: idMap.get(sm.startNode)!,
    end_node: idMap.get(sm.endNode)!,
    material: { name: 'Steel', E: 200e9, fy: 250e6, density: 7850 },
    section: { name: 'Default', A: 0.01, Ix: 1e-4, Iy: 1e-4, J: 2e-4 },
    end_releases: {
      start: { Fx: false, Fy: false, Fz: false, Mx: false, My: false, Mz: false },
      end: { Fx: false, Fy: false, Fz: false, Mx: false, My: false, Mz: false },
    },
    tags: [],
  }))

  return { nodes, members }
}
