import type { Vec3 } from '../model'
import type { WorkingPlane } from '../model/WorkingPlane'

/**
 * Project a 3D world point onto plane-local (u, v) coordinates.
 * u = dot(point - plane.point, tangentU)
 * v = dot(point - plane.point, tangentV)
 */
export function worldToPlaneLocal(
  point: Vec3,
  plane: WorkingPlane,
): { u: number; v: number } {
  const dx = point.x - plane.point.x
  const dy = point.y - plane.point.y
  const dz = point.z - plane.point.z
  const u = dx * plane.tangentU.x + dy * plane.tangentU.y + dz * plane.tangentU.z
  const v = dx * plane.tangentV.x + dy * plane.tangentV.y + dz * plane.tangentV.z
  return { u, v }
}

/**
 * Convert plane-local (u, v) coordinates back to 3D world coordinates.
 * result = plane.point + u * tangentU + v * tangentV
 */
export function planeLocalToWorld(
  u: number,
  v: number,
  plane: WorkingPlane,
): Vec3 {
  return {
    x: plane.point.x + u * plane.tangentU.x + v * plane.tangentV.x,
    y: plane.point.y + u * plane.tangentU.y + v * plane.tangentV.y,
    z: plane.point.z + u * plane.tangentU.z + v * plane.tangentV.z,
  }
}

/**
 * Snap a 3D point to the nearest grid intersection on a WorkingPlane.
 * Projects onto plane-local coords, rounds to gridSize, converts back.
 */
export function snapToPlaneGrid(
  point: Vec3,
  plane: WorkingPlane,
  gridSize: number,
): Vec3 {
  const { u, v } = worldToPlaneLocal(point, plane)
  const snappedU = Math.round(u / gridSize) * gridSize
  const snappedV = Math.round(v / gridSize) * gridSize
  return planeLocalToWorld(snappedU, snappedV, plane)
}

/**
 * Intersect a ray with a WorkingPlane. Returns the intersection point
 * in world coordinates, or null if the ray is parallel to the plane.
 *
 * Uses the algebraic ray-plane intersection:
 *   t = dot(planePoint - rayOrigin, normal) / dot(rayDir, normal)
 */
export function raycastOntoPlane(
  rayOrigin: Vec3,
  rayDir: Vec3,
  plane: WorkingPlane,
): Vec3 | null {
  const denom =
    rayDir.x * plane.normal.x +
    rayDir.y * plane.normal.y +
    rayDir.z * plane.normal.z

  // Ray is parallel to the plane
  if (Math.abs(denom) < 1e-10) return null

  const dx = plane.point.x - rayOrigin.x
  const dy = plane.point.y - rayOrigin.y
  const dz = plane.point.z - rayOrigin.z
  const t =
    (dx * plane.normal.x + dy * plane.normal.y + dz * plane.normal.z) / denom

  // Intersection is behind the ray
  if (t < 0) return null

  return {
    x: rayOrigin.x + t * rayDir.x,
    y: rayOrigin.y + t * rayDir.y,
    z: rayOrigin.z + t * rayDir.z,
  }
}

/**
 * Find the nearest on-plane node within snapRadius.
 * Returns the node ID if found, null otherwise.
 */
export function findNearestOnPlaneNode(
  point: Vec3,
  nodes: { id: string; position: Vec3 }[],
  plane: WorkingPlane,
  snapRadius: number,
  planeTolerance = 0.01,
): string | null {
  let closestId: string | null = null
  let closestDist = Infinity

  for (const node of nodes) {
    // Check if node is on the plane
    const dx = node.position.x - plane.point.x
    const dy = node.position.y - plane.point.y
    const dz = node.position.z - plane.point.z
    const planeDist = Math.abs(
      dx * plane.normal.x + dy * plane.normal.y + dz * plane.normal.z,
    )
    if (planeDist > planeTolerance) continue

    // Check distance to cursor
    const ex = node.position.x - point.x
    const ey = node.position.y - point.y
    const ez = node.position.z - point.z
    const d = Math.sqrt(ex * ex + ey * ey + ez * ez)
    if (d < snapRadius && d < closestDist) {
      closestDist = d
      closestId = node.id
    }
  }

  return closestId
}
