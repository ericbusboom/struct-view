import type { Vec3, PlacementPlane } from '../model'

/** Normal vectors for each constraint plane. */
const PLANE_NORMALS: Record<PlacementPlane, Vec3> = {
  XY: { x: 0, y: 0, z: 1 },
  XZ: { x: 0, y: 1, z: 0 },
  YZ: { x: 1, y: 0, z: 0 },
}

/**
 * Project a ray onto a constraint plane passing through a given point.
 * Returns the intersection point, or null if the ray is parallel to the plane.
 *
 * @param rayOrigin - Origin of the ray (e.g., camera position)
 * @param rayDir - Direction of the ray (does not need to be normalized)
 * @param planePoint - A point on the constraint plane
 * @param plane - Which constraint plane ('XY', 'XZ', or 'YZ')
 */
export function projectToPlane(
  rayOrigin: Vec3,
  rayDir: Vec3,
  planePoint: Vec3,
  plane: PlacementPlane,
): Vec3 | null {
  const normal = PLANE_NORMALS[plane]

  // dot(normal, rayDir)
  const denom = normal.x * rayDir.x + normal.y * rayDir.y + normal.z * rayDir.z

  // Ray is parallel to the plane (or nearly so)
  if (Math.abs(denom) < 1e-10) return null

  // dot(normal, planePoint - rayOrigin)
  const dx = planePoint.x - rayOrigin.x
  const dy = planePoint.y - rayOrigin.y
  const dz = planePoint.z - rayOrigin.z
  const t = (normal.x * dx + normal.y * dy + normal.z * dz) / denom

  return {
    x: rayOrigin.x + t * rayDir.x,
    y: rayOrigin.y + t * rayDir.y,
    z: rayOrigin.z + t * rayDir.z,
  }
}
