import type { Shape2DNode, Shape2DMember } from '../model'

export interface Point2D {
  x: number
  y: number
}

export interface GuideLine {
  type: 'perpendicular' | 'parallel'
  from: Point2D
  to: Point2D
}

export interface SnapResult {
  point: Point2D
  type: 'node' | 'midpoint' | 'grid' | 'none'
  sourceId?: string
  guides: GuideLine[]
}

export interface SnapOptions {
  /** Snap radius in world units (caller should convert from screen pixels). */
  snapRadius: number
  /** Grid spacing in world units. */
  gridSize: number
  /** The last-placed node, used for perpendicular/parallel guide detection. */
  lastNode?: Point2D
  /** Angular tolerance in radians for perpendicular/parallel detection. Default 0.05 (~2.9 degrees). */
  angleTolerance?: number
}

function dist(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function midpoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function snapToGrid(cursor: Point2D, gridSize: number): Point2D {
  return {
    x: Math.round(cursor.x / gridSize) * gridSize,
    y: Math.round(cursor.y / gridSize) * gridSize,
  }
}

function angle(from: Point2D, to: Point2D): number {
  return Math.atan2(to.y - from.y, to.x - from.x)
}

/** Normalize angle to [0, PI) for undirected comparison. */
function normalizeAngle(a: number): number {
  let n = a % Math.PI
  if (n < 0) n += Math.PI
  return n
}

function detectGuides(
  cursor: Point2D,
  lastNode: Point2D,
  existingNodes: Shape2DNode[],
  existingMembers: Shape2DMember[],
  angleTolerance: number,
): GuideLine[] {
  const guides: GuideLine[] = []
  const cursorAngle = angle(lastNode, cursor)
  const normalizedCursorAngle = normalizeAngle(cursorAngle)

  // Build node lookup for member endpoints
  const nodeMap = new Map<string, Shape2DNode>()
  for (const n of existingNodes) {
    nodeMap.set(n.id, n)
  }

  for (const member of existingMembers) {
    const start = nodeMap.get(member.startNode)
    const end = nodeMap.get(member.endNode)
    if (!start || !end) continue

    const segAngle = normalizeAngle(angle(start, end))

    // Parallel: cursor-to-lastNode angle matches segment angle
    const parallelDiff = Math.abs(normalizedCursorAngle - segAngle)
    if (parallelDiff < angleTolerance || Math.abs(parallelDiff - Math.PI) < angleTolerance) {
      guides.push({
        type: 'parallel',
        from: { x: lastNode.x, y: lastNode.y },
        to: { x: cursor.x, y: cursor.y },
      })
    }

    // Perpendicular: cursor-to-lastNode angle is 90 degrees from segment angle
    const perpDiff = Math.abs(normalizedCursorAngle - segAngle)
    const perpCheck = Math.abs(perpDiff - Math.PI / 2)
    if (perpCheck < angleTolerance) {
      guides.push({
        type: 'perpendicular',
        from: { x: lastNode.x, y: lastNode.y },
        to: { x: cursor.x, y: cursor.y },
      })
    }
  }

  return guides
}

/**
 * Calculate the best snap target for a cursor position.
 * Priority: node > midpoint > grid.
 */
export function snapPoint(
  cursor: Point2D,
  existingNodes: Shape2DNode[],
  existingMembers: Shape2DMember[],
  options: SnapOptions,
): SnapResult {
  const {
    snapRadius,
    gridSize,
    lastNode,
    angleTolerance = 0.05,
  } = options

  // Build node lookup
  const nodeMap = new Map<string, Shape2DNode>()
  for (const n of existingNodes) {
    nodeMap.set(n.id, n)
  }

  // Detect guides if we have a lastNode
  const guides = lastNode
    ? detectGuides(cursor, lastNode, existingNodes, existingMembers, angleTolerance)
    : []

  // Priority 1: Snap to nearest node
  let closestNode: Shape2DNode | null = null
  let closestNodeDist = Infinity
  for (const node of existingNodes) {
    const d = dist(cursor, node)
    if (d < snapRadius && d < closestNodeDist) {
      closestNodeDist = d
      closestNode = node
    }
  }
  if (closestNode) {
    return {
      point: { x: closestNode.x, y: closestNode.y },
      type: 'node',
      sourceId: closestNode.id,
      guides,
    }
  }

  // Priority 2: Snap to midpoint of nearest member
  let closestMidpoint: Point2D | null = null
  let closestMidDist = Infinity
  let closestMidId: string | undefined
  for (const member of existingMembers) {
    const start = nodeMap.get(member.startNode)
    const end = nodeMap.get(member.endNode)
    if (!start || !end) continue
    const mid = midpoint(start, end)
    const d = dist(cursor, mid)
    if (d < snapRadius && d < closestMidDist) {
      closestMidDist = d
      closestMidpoint = mid
      closestMidId = member.id
    }
  }
  if (closestMidpoint) {
    return {
      point: closestMidpoint,
      type: 'midpoint',
      sourceId: closestMidId,
      guides,
    }
  }

  // Priority 3: Snap to grid
  if (gridSize > 0) {
    return {
      point: snapToGrid(cursor, gridSize),
      type: 'grid',
      guides,
    }
  }

  // No snap
  return { point: cursor, type: 'none', guides }
}
