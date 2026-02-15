import type { Vec3, PlacementPlane } from '../model'

/** Snap angle to nearest increment. */
export function snapAngle(angleDeg: number, snapDeg: number): number {
  return Math.round(angleDeg / snapDeg) * snapDeg
}

/**
 * Rotation axis normal for each constraint plane.
 * The rotation axis is the plane's normal vector.
 */
const ROTATION_AXES: Record<PlacementPlane, Vec3> = {
  XY: { x: 0, y: 0, z: 1 },
  XZ: { x: 0, y: 1, z: 0 },
  YZ: { x: 1, y: 0, z: 0 },
}

/**
 * Rotate a set of positions around a pivot in a given plane by angleDeg degrees.
 * Returns new positions without mutating the originals.
 */
export function rotatePositionsAroundPivot(
  positions: Vec3[],
  pivot: Vec3,
  angleDeg: number,
  plane: PlacementPlane,
): Vec3[] {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const axis = ROTATION_AXES[plane]

  return positions.map((pos) => {
    // Translate to origin relative to pivot
    const dx = pos.x - pivot.x
    const dy = pos.y - pivot.y
    const dz = pos.z - pivot.z

    // Rodrigues' rotation formula for rotation around axis by angle
    // v_rot = v*cos(a) + (axis x v)*sin(a) + axis*(axis . v)*(1-cos(a))
    const dot = axis.x * dx + axis.y * dy + axis.z * dz
    const crossX = axis.y * dz - axis.z * dy
    const crossY = axis.z * dx - axis.x * dz
    const crossZ = axis.x * dy - axis.y * dx

    const rx = dx * cos + crossX * sin + axis.x * dot * (1 - cos)
    const ry = dy * cos + crossY * sin + axis.y * dot * (1 - cos)
    const rz = dz * cos + crossZ * sin + axis.z * dot * (1 - cos)

    return {
      x: pivot.x + rx,
      y: pivot.y + ry,
      z: pivot.z + rz,
    }
  })
}
