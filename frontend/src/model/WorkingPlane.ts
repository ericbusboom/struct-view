import type { Vec3 } from './schemas'

export type ConstraintType = 'point' | 'line' | 'plane'

export interface WorkingPlane {
  id: string
  normal: Vec3
  point: Vec3
  constraintType: ConstraintType
  constraintPoints: Vec3[]
  tangentU: Vec3
  tangentV: Vec3
}

// --- Vector helpers (pure, no dependencies) ---

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

function length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

function normalize(v: Vec3): Vec3 {
  const len = length(v)
  if (len < 1e-12) return { x: 0, y: 0, z: 1 }
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

function negate(v: Vec3): Vec3 {
  return { x: -v.x, y: -v.y, z: -v.z }
}

const WORLD_X: Vec3 = { x: 1, y: 0, z: 0 }
const WORLD_Y: Vec3 = { x: 0, y: 1, z: 0 }
const WORLD_Z: Vec3 = { x: 0, y: 0, z: 1 }
const WORLD_AXES: Vec3[] = [WORLD_X, WORLD_Y, WORLD_Z]

/**
 * Compute tangent vectors from a normal.
 * tangentV is always the projection of world-Z onto the plane ("up" in the
 * plane), so the 2D focus view shows Z-up on screen.  For horizontal planes
 * where Z is the normal, we fall back to projecting world-Y as screen-up.
 * tangentU completes the right-handed frame (U × V = N).
 */
function computeTangents(normal: Vec3): { tangentU: Vec3; tangentV: Vec3 } {
  // Project world-Z onto the plane: projZ = Z - dot(Z, N) * N
  const dotZN = dot(WORLD_Z, normal)
  const projZ: Vec3 = {
    x: WORLD_Z.x - dotZN * normal.x,
    y: WORLD_Z.y - dotZN * normal.y,
    z: WORLD_Z.z - dotZN * normal.z,
  }

  let tangentV: Vec3
  if (length(projZ) > 1e-6) {
    // Non-horizontal plane: Z projected onto plane is "up"
    tangentV = normalize(projZ)
  } else {
    // Horizontal plane (normal ≈ ±Z): use world-Y as "up" on screen
    const dotYN = dot(WORLD_Y, normal)
    const projY: Vec3 = {
      x: WORLD_Y.x - dotYN * normal.x,
      y: WORLD_Y.y - dotYN * normal.y,
      z: WORLD_Y.z - dotYN * normal.z,
    }
    tangentV = normalize(projY)
  }

  // tangentU = "right" in the plane, completing right-handed frame (U × V = N)
  const tangentU = normalize(cross(tangentV, normal))
  return { tangentU, tangentV }
}

/**
 * For 2-point constraint, choose the normal that is most axis-aligned.
 * The line direction is from p0 to p1. The normal must be perpendicular to this line.
 * We pick the world axis most perpendicular to the line direction, then cross
 * with the line to get the normal.
 */
function bestNormalForLine(lineDir: Vec3): Vec3 {
  // Find world axis most perpendicular to lineDir
  let bestAxis = WORLD_X
  let minDot = Math.abs(dot(lineDir, WORLD_X))
  for (const axis of WORLD_AXES) {
    const d = Math.abs(dot(lineDir, axis))
    if (d < minDot) {
      minDot = d
      bestAxis = axis
    }
  }

  // Normal = lineDir × bestAxis (perpendicular to both)
  const raw = cross(lineDir, bestAxis)
  return normalize(raw)
}

let nextId = 1

/**
 * Create a WorkingPlane from 0, 1, 2, or 3 points.
 *
 * - 0 points: XY plane through origin (normal = +Z)
 * - 1 point: XY plane through that point (normal = +Z)
 * - 2 points: plane through both, line constraint, normal nearest world axis
 * - 3 points: plane through all three, fully constrained
 */
export function createPlaneFromPoints(points: Vec3[]): WorkingPlane {
  const id = `plane-${nextId++}`

  if (points.length === 0) {
    const normal = { ...WORLD_Z }
    const point = { x: 0, y: 0, z: 0 }
    const { tangentU, tangentV } = computeTangents(normal)
    return {
      id,
      normal,
      point,
      constraintType: 'point',
      constraintPoints: [point],
      tangentU,
      tangentV,
    }
  }

  if (points.length === 1) {
    const normal = { ...WORLD_Z }
    const point = { ...points[0] }
    const { tangentU, tangentV } = computeTangents(normal)
    return {
      id,
      normal,
      point,
      constraintType: 'point',
      constraintPoints: [point],
      tangentU,
      tangentV,
    }
  }

  if (points.length === 2) {
    const lineDir = normalize(sub(points[1], points[0]))
    const normal = bestNormalForLine(lineDir)
    const point = { ...points[0] }
    // Align tangentU to constraint line for predictable grid orientation
    const tangentU = lineDir
    const tangentV = normalize(cross(normal, tangentU))
    return {
      id,
      normal,
      point,
      constraintType: 'line',
      constraintPoints: points.map((p) => ({ ...p })),
      tangentU,
      tangentV,
    }
  }

  // 3+ points: use first 3 for full constraint
  const p0 = points[0]
  const p1 = points[1]
  const p2 = points[2]
  const v1 = sub(p1, p0)
  const v2 = sub(p2, p0)
  let rawNormal = cross(v1, v2)

  // If points are collinear, fall back to line constraint
  if (length(rawNormal) < 1e-10) {
    const lineDir = normalize(v1)
    const normal = bestNormalForLine(lineDir)
    const point = { ...p0 }
    const tangentU = lineDir
    const tangentV = normalize(cross(normal, tangentU))
    return {
      id,
      normal,
      point,
      constraintType: 'line',
      constraintPoints: points.slice(0, 2).map((p) => ({ ...p })),
      tangentU,
      tangentV,
    }
  }

  const normal = normalize(rawNormal)
  // Ensure normal points "upward" (positive Z component) for consistency (Z-up)
  const finalNormal = normal.z < 0 ? negate(normal) : normal
  const point = { ...p0 }
  // Align tangentU to first edge (p0→p1) for predictable grid orientation
  const edgeDir = normalize(v1)
  const tangentU = edgeDir
  const tangentV = normalize(cross(finalNormal, tangentU))
  return {
    id,
    normal: finalNormal,
    point,
    constraintType: 'plane',
    constraintPoints: [p0, p1, p2].map((p) => ({ ...p })),
    tangentU,
    tangentV,
  }
}

/**
 * Determine the axis-alignment color for a plane based on its normal.
 * - Red: XY plane (normal along Z)
 * - Blue: YZ plane (normal along X)
 * - Green: XZ plane (normal along Y)
 * - Yellow: general (non-axis-aligned)
 */
export function getPlaneColor(normal: Vec3): string {
  const THRESHOLD = 0.99
  const ax = Math.abs(normal.x)
  const ay = Math.abs(normal.y)
  const az = Math.abs(normal.z)

  if (az > THRESHOLD) return '#ff4444' // Red — XY plane
  if (ax > THRESHOLD) return '#4488ff' // Blue — YZ plane
  if (ay > THRESHOLD) return '#44cc44' // Green — XZ plane
  return '#ffcc00' // Yellow — general
}

/** Distance threshold for cross-plane node visibility in focus mode. */
export const NEAR_PLANE_THRESHOLD = 0.5

/** Check if a point lies on (or very near) a working plane. */
export function isOnPlane(position: Vec3, plane: WorkingPlane, threshold = 0.01): boolean {
  const dx = position.x - plane.point.x
  const dy = position.y - plane.point.y
  const dz = position.z - plane.point.z
  const dist = Math.abs(dx * plane.normal.x + dy * plane.normal.y + dz * plane.normal.z)
  return dist < threshold
}

/**
 * Create a WorkingPlane from a PlacementPlane string ('XZ', 'XY', 'YZ').
 * Used as a fallback when no explicit WorkingPlane is set.
 */
export function workingPlaneFromPlacementPlane(pp: 'XZ' | 'XY' | 'YZ'): WorkingPlane {
  const point = { x: 0, y: 0, z: 0 }
  switch (pp) {
    case 'XY':
      return { id: 'default-XY', normal: { x: 0, y: 0, z: 1 }, point, constraintType: 'plane', constraintPoints: [], tangentU: { x: 1, y: 0, z: 0 }, tangentV: { x: 0, y: 1, z: 0 } }
    case 'XZ':
      return { id: 'default-XZ', normal: { x: 0, y: 1, z: 0 }, point, constraintType: 'plane', constraintPoints: [], tangentU: { x: 1, y: 0, z: 0 }, tangentV: { x: 0, y: 0, z: 1 } }
    case 'YZ':
      return { id: 'default-YZ', normal: { x: 1, y: 0, z: 0 }, point, constraintType: 'plane', constraintPoints: [], tangentU: { x: 0, y: 1, z: 0 }, tangentV: { x: 0, y: 0, z: 1 } }
  }
}

/** Reset the ID counter (for tests). */
export function _resetPlaneIdCounter() {
  nextId = 1
}
