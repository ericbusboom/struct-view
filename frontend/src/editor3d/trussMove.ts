import type { Vec3, Node, PlacementPlane } from '../model'

/** Axis pair for each constraint plane. */
const PLANE_AXES: Record<PlacementPlane, [keyof Vec3, keyof Vec3]> = {
  XY: ['x', 'y'],
  XZ: ['x', 'z'],
  YZ: ['y', 'z'],
}

/**
 * Compute the centroid of a set of nodes.
 */
export function computeTrussCentroid(nodes: Node[]): Vec3 {
  if (nodes.length === 0) return { x: 0, y: 0, z: 0 }
  const sum = { x: 0, y: 0, z: 0 }
  for (const n of nodes) {
    sum.x += n.position.x
    sum.y += n.position.y
    sum.z += n.position.z
  }
  return {
    x: sum.x / nodes.length,
    y: sum.y / nodes.length,
    z: sum.z / nodes.length,
  }
}

/**
 * Compute the translation delta constrained to a plane.
 * Only the two axes of the active plane are included; the third axis is zeroed.
 */
export function constrainDeltaToPlane(delta: Vec3, plane: PlacementPlane): Vec3 {
  const [a1, a2] = PLANE_AXES[plane]
  const result: Vec3 = { x: 0, y: 0, z: 0 }
  result[a1] = delta[a1]
  result[a2] = delta[a2]
  return result
}

/**
 * Compute a nudge delta for arrow key movement.
 * "first axis" maps to left/right arrows, "second axis" maps to up/down.
 */
export function computeNudgeDelta(
  direction: 'left' | 'right' | 'up' | 'down',
  plane: PlacementPlane,
  stepSize: number,
): Vec3 {
  const [a1, a2] = PLANE_AXES[plane]
  const delta: Vec3 = { x: 0, y: 0, z: 0 }

  if (direction === 'right') delta[a1] = stepSize
  else if (direction === 'left') delta[a1] = -stepSize
  else if (direction === 'up') delta[a2] = stepSize
  else if (direction === 'down') delta[a2] = -stepSize

  return delta
}
