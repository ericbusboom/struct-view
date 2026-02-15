import { nanoid } from 'nanoid'
import type { Shape2D, Shape2DNode, Shape2DMember } from '../model'

function node(x: number, y: number): Shape2DNode {
  return { id: nanoid(), x, y }
}

function member(start: string, end: string, isSnapEdge = false): Shape2DMember {
  return { id: nanoid(), startNode: start, endNode: end, isSnapEdge }
}

/**
 * Pratt truss: top and bottom chords, verticals, and diagonals sloping toward center.
 * Bottom-left at origin. Bottom chord members are snap edges.
 */
export function generatePrattTruss(span: number, depth: number, panels: number): Shape2D {
  const nodes: Shape2DNode[] = []
  const members: Shape2DMember[] = []
  const dx = span / panels

  // Bottom chord nodes
  const bottom: Shape2DNode[] = []
  for (let i = 0; i <= panels; i++) {
    const n = node(i * dx, 0)
    bottom.push(n)
    nodes.push(n)
  }

  // Top chord nodes
  const top: Shape2DNode[] = []
  for (let i = 0; i <= panels; i++) {
    const n = node(i * dx, depth)
    top.push(n)
    nodes.push(n)
  }

  // Bottom chord members (snap edges)
  for (let i = 0; i < panels; i++) {
    members.push(member(bottom[i].id, bottom[i + 1].id, true))
  }

  // Top chord members
  for (let i = 0; i < panels; i++) {
    members.push(member(top[i].id, top[i + 1].id))
  }

  // Verticals
  for (let i = 0; i <= panels; i++) {
    members.push(member(bottom[i].id, top[i].id))
  }

  // Diagonals sloping toward center
  const mid = panels / 2
  for (let i = 0; i < panels; i++) {
    if (i < mid) {
      // Left half: diagonal from bottom-right to top-left of panel
      members.push(member(bottom[i + 1].id, top[i].id))
    } else {
      // Right half: diagonal from bottom-left to top-right of panel
      members.push(member(bottom[i].id, top[i + 1].id))
    }
  }

  return { id: nanoid(), name: 'Pratt Truss', nodes, members, placementPlane: 'XZ' as const }
}

/**
 * Howe truss: top and bottom chords, verticals, and diagonals sloping away from center.
 */
export function generateHoweTruss(span: number, depth: number, panels: number): Shape2D {
  const nodes: Shape2DNode[] = []
  const members: Shape2DMember[] = []
  const dx = span / panels

  const bottom: Shape2DNode[] = []
  for (let i = 0; i <= panels; i++) {
    const n = node(i * dx, 0)
    bottom.push(n)
    nodes.push(n)
  }

  const top: Shape2DNode[] = []
  for (let i = 0; i <= panels; i++) {
    const n = node(i * dx, depth)
    top.push(n)
    nodes.push(n)
  }

  for (let i = 0; i < panels; i++) {
    members.push(member(bottom[i].id, bottom[i + 1].id, true))
  }
  for (let i = 0; i < panels; i++) {
    members.push(member(top[i].id, top[i + 1].id))
  }
  for (let i = 0; i <= panels; i++) {
    members.push(member(bottom[i].id, top[i].id))
  }

  // Diagonals sloping away from center (opposite of Pratt)
  const mid = panels / 2
  for (let i = 0; i < panels; i++) {
    if (i < mid) {
      members.push(member(bottom[i].id, top[i + 1].id))
    } else {
      members.push(member(bottom[i + 1].id, top[i].id))
    }
  }

  return { id: nanoid(), name: 'Howe Truss', nodes, members, placementPlane: 'XZ' as const }
}

/**
 * Warren truss: top and bottom chords with alternating diagonals, no verticals.
 */
export function generateWarrenTruss(span: number, depth: number, panels: number): Shape2D {
  const nodes: Shape2DNode[] = []
  const members: Shape2DMember[] = []
  const dx = span / panels

  const bottom: Shape2DNode[] = []
  for (let i = 0; i <= panels; i++) {
    const n = node(i * dx, 0)
    bottom.push(n)
    nodes.push(n)
  }

  const top: Shape2DNode[] = []
  for (let i = 0; i <= panels; i++) {
    const n = node(i * dx, depth)
    top.push(n)
    nodes.push(n)
  }

  for (let i = 0; i < panels; i++) {
    members.push(member(bottom[i].id, bottom[i + 1].id, true))
  }
  for (let i = 0; i < panels; i++) {
    members.push(member(top[i].id, top[i + 1].id))
  }

  // Alternating diagonals — no verticals
  for (let i = 0; i < panels; i++) {
    if (i % 2 === 0) {
      members.push(member(bottom[i].id, top[i + 1].id))
    } else {
      members.push(member(bottom[i + 1].id, top[i].id))
    }
  }

  return { id: nanoid(), name: 'Warren Truss', nodes, members, placementPlane: 'XZ' as const }
}

/**
 * Scissors truss: crossed diagonals between top and bottom chords.
 */
export function generateScissorsTruss(span: number, depth: number, panels: number): Shape2D {
  const nodes: Shape2DNode[] = []
  const members: Shape2DMember[] = []
  const dx = span / panels

  const bottom: Shape2DNode[] = []
  for (let i = 0; i <= panels; i++) {
    const n = node(i * dx, 0)
    bottom.push(n)
    nodes.push(n)
  }

  const top: Shape2DNode[] = []
  for (let i = 0; i <= panels; i++) {
    const n = node(i * dx, depth)
    top.push(n)
    nodes.push(n)
  }

  for (let i = 0; i < panels; i++) {
    members.push(member(bottom[i].id, bottom[i + 1].id, true))
  }
  for (let i = 0; i < panels; i++) {
    members.push(member(top[i].id, top[i + 1].id))
  }

  // Crossed diagonals in each panel
  for (let i = 0; i < panels; i++) {
    members.push(member(bottom[i].id, top[i + 1].id))
    members.push(member(bottom[i + 1].id, top[i].id))
  }

  return { id: nanoid(), name: 'Scissors Truss', nodes, members, placementPlane: 'XZ' as const }
}
