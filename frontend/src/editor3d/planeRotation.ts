import type { Vec3, WorkingPlane } from '../model'

/**
 * Rodrigues' rotation formula: rotate vector v around unit axis by angleDeg degrees.
 */
export function rodriguesRotate(v: Vec3, axis: Vec3, angleDeg: number): Vec3 {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  const dot = axis.x * v.x + axis.y * v.y + axis.z * v.z
  const crossX = axis.y * v.z - axis.z * v.y
  const crossY = axis.z * v.x - axis.x * v.z
  const crossZ = axis.x * v.y - axis.y * v.x

  return {
    x: v.x * cos + crossX * sin + axis.x * dot * (1 - cos),
    y: v.y * cos + crossY * sin + axis.y * dot * (1 - cos),
    z: v.z * cos + crossZ * sin + axis.z * dot * (1 - cos),
  }
}

function vecLength(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

function normalize(v: Vec3): Vec3 {
  const len = vecLength(v)
  if (len < 1e-12) return { x: 0, y: 0, z: 1 }
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

/**
 * Rotate a WorkingPlane's full orthonormal frame (normal, tangentU, tangentV)
 * around an axis by angleDeg degrees. This is gimbal-lock-free because all
 * three vectors are rotated by the same rotation — no re-derivation from scratch.
 */
export function rotatePlane(plane: WorkingPlane, axis: Vec3, angleDeg: number): WorkingPlane {
  const newNormal = normalize(rodriguesRotate(plane.normal, axis, angleDeg))
  const newTangentU = normalize(rodriguesRotate(plane.tangentU, axis, angleDeg))
  const newTangentV = normalize(rodriguesRotate(plane.tangentV, axis, angleDeg))

  return {
    ...plane,
    normal: newNormal,
    tangentU: newTangentU,
    tangentV: newTangentV,
  }
}

/**
 * Get the rotation axes available for a plane based on its constraint type.
 * Returns the axes that arrow keys should rotate around.
 *
 * - Point-constrained: horizontal (tangentU) and vertical (tangentV)
 * - Line-constrained: only the constraint line direction
 * - Fully-constrained: no rotation
 */
export function getRotationAxes(plane: WorkingPlane): {
  horizontal: Vec3 | null  // up/down arrows rotate around this
  vertical: Vec3 | null    // left/right arrows rotate around this
} {
  if (plane.constraintType === 'plane') {
    return { horizontal: null, vertical: null }
  }

  if (plane.constraintType === 'line') {
    // Line constraint: rotation only around the line direction.
    // The line direction is tangentU (derived from constraint points).
    const p0 = plane.constraintPoints[0]
    const p1 = plane.constraintPoints[1]
    const lineDir = normalize({
      x: p1.x - p0.x,
      y: p1.y - p0.y,
      z: p1.z - p0.z,
    })
    // Up/down rotates around the line; left/right disabled.
    return { horizontal: lineDir, vertical: null }
  }

  // Point-constrained: free rotation around both tangent axes.
  return {
    horizontal: plane.tangentU,  // up/down arrows
    vertical: plane.tangentV,    // left/right arrows
  }
}

/** Angle between two unit vectors in degrees. */
function angleBetweenDeg(a: Vec3, b: Vec3): number {
  const dot = a.x * b.x + a.y * b.y + a.z * b.z
  // Clamp to avoid acos domain errors
  return Math.acos(Math.min(1, Math.max(-1, dot))) * (180 / Math.PI)
}

// World axis reference normals for snap detection
const WORLD_AXES: Vec3[] = [
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: -1 },
]

const SNAP_INTERVAL = 15 // degrees
const SNAP_THRESHOLD = 1 // degrees

/**
 * Check if the plane normal is within SNAP_THRESHOLD of a 15-degree multiple
 * relative to any world axis. If so, snap to that exact angle.
 *
 * Returns the plane unchanged if no snap applies.
 */
export function snapPlaneAngle(plane: WorkingPlane, rotationAxis: Vec3): WorkingPlane {
  // For each world axis, check if the angle from the normal is near a 15-degree multiple
  for (const worldAxis of WORLD_AXES) {
    const angle = angleBetweenDeg(plane.normal, worldAxis)
    const nearestSnap = Math.round(angle / SNAP_INTERVAL) * SNAP_INTERVAL
    const diff = Math.abs(angle - nearestSnap)

    if (diff > 0 && diff < SNAP_THRESHOLD) {
      // Snap: rotate from current angle to the nearest snap angle
      const correction = nearestSnap - angle
      // The correction rotation is around the same axis that produced this deviation
      return rotatePlane(plane, rotationAxis, correction)
    }
  }

  return plane
}

/**
 * Compute rotation speed (degrees/second) from hold duration.
 * Linear ramp from MIN_SPEED to MAX_SPEED over RAMP_DURATION seconds.
 */
const MIN_SPEED = 5    // deg/sec starting speed
const MAX_SPEED = 180  // deg/sec max speed
const RAMP_DURATION = 2 // seconds to reach max

export function computeRotationSpeed(holdDuration: number): number {
  const t = Math.min(1, holdDuration / RAMP_DURATION)
  return MIN_SPEED + t * (MAX_SPEED - MIN_SPEED)
}

/** Minimum angle for a single tap (degrees). */
export const TAP_ANGLE = 0.5
