import { describe, it, expect } from 'vitest'
import {
  createNode,
  createProject,
  ProjectSchema,
} from '../../../model'
import type { Shape2D, Node, Member } from '../../../model'
import { placeShape } from '../../../editor2d/placeShape'
import type { TargetEdge } from '../../../editor2d/placeShape'
import { mergeCoincidentNodes, applyNodeRemap } from '../../../editor2d/mergeNodes'
import { generatePrattTruss } from '../../../editor2d/trussTemplates'
import { placeEqualSpacing } from '../../../editor2d/equalSpacing'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a node-id set from the project's nodes. */
function nodeIdSet(nodes: Node[]): Set<string> {
  return new Set(nodes.map((n) => n.id))
}

/** Check every member references valid node ids. */
function assertNoOrphanRefs(nodes: Node[], members: Member[]) {
  const ids = nodeIdSet(nodes)
  for (const m of members) {
    expect(ids.has(m.start_node)).toBe(true)
    expect(ids.has(m.end_node)).toBe(true)
  }
}

/** Check every node is referenced by at least one member. */
function assertNoOrphanNodes(nodes: Node[], members: Member[]) {
  const referenced = new Set<string>()
  for (const m of members) {
    referenced.add(m.start_node)
    referenced.add(m.end_node)
  }
  for (const n of nodes) {
    expect(referenced.has(n.id)).toBe(true)
  }
}

// ---------------------------------------------------------------------------
// Workflow 1: Custom shape end-to-end
// ---------------------------------------------------------------------------
describe('Workflow 1: Custom shape draw → save → place → merge → validate → round-trip', () => {
  // Simulate drawing a simple triangle in the 2D editor
  const triangleShape: Shape2D = {
    id: 'tri',
    name: 'Triangle',
    nodes: [
      { id: 'n1', x: 0, y: 0 },
      { id: 'n2', x: 4, y: 0 },
      { id: 'n3', x: 2, y: 3 },
    ],
    members: [
      { id: 'm1', startNode: 'n1', endNode: 'n2', isSnapEdge: true },
      { id: 'm2', startNode: 'n2', endNode: 'n3', isSnapEdge: false },
      { id: 'm3', startNode: 'n3', endNode: 'n1', isSnapEdge: false },
    ],
  }

  const targetEdge: TargetEdge = {
    start: { x: 0, y: 0, z: 0 },
    end: { x: 8, y: 0, z: 0 },
  }

  it('places custom shape and produces correct node/member counts', () => {
    const result = placeShape(triangleShape, targetEdge)
    expect(result.nodes).toHaveLength(3)
    expect(result.members).toHaveLength(3)
  })

  it('placed nodes have correct 3D coordinates (scale 2x)', () => {
    const result = placeShape(triangleShape, targetEdge)
    // Snap edge is (0,0)→(4,0), target is (0,0,0)→(8,0,0) → scale = 2
    const positions = result.nodes.map((n) => n.position)
    // n1 at (0,0) → (0,0,0)
    expect(positions.find((p) => Math.abs(p.x) < 0.01 && Math.abs(p.y) < 0.01)).toBeTruthy()
    // n2 at (4,0) → (8,0,0)
    expect(positions.find((p) => Math.abs(p.x - 8) < 0.01)).toBeTruthy()
    // n3 at (2,3) → (4, 6, 0) — 2D Y maps to 3D Y via perpendicular
    expect(positions.find((p) => Math.abs(p.x - 4) < 0.01)).toBeTruthy()
  })

  it('merges shared node when placing two adjacent shapes', () => {
    const placed1 = placeShape(triangleShape, targetEdge)
    const edge2: TargetEdge = {
      start: { x: 8, y: 0, z: 0 },
      end: { x: 16, y: 0, z: 0 },
    }
    const placed2 = placeShape(triangleShape, edge2)

    // placed1's n2 is at (8,0,0), placed2's n1 is at (8,0,0) — should merge
    const { mergedNodes, remapTable } = mergeCoincidentNodes(placed1.nodes, placed2.nodes)
    const remapped = applyNodeRemap(placed2.members, remapTable)

    const allNodes = [...placed1.nodes, ...mergedNodes]
    const allMembers = [...placed1.members, ...remapped]

    // 3 + 2 = 5 unique nodes (one merged)
    expect(allNodes).toHaveLength(5)
    expect(allMembers).toHaveLength(6)
    assertNoOrphanRefs(allNodes, allMembers)
  })

  it('round-trips through ProjectSchema', () => {
    const result = placeShape(triangleShape, targetEdge)
    const project = createProject({
      name: 'Custom Shape Test',
      nodes: result.nodes,
      members: result.members,
      shapes: [triangleShape],
    })

    const json = JSON.parse(JSON.stringify(project))
    const parsed = ProjectSchema.parse(json)

    expect(parsed.nodes).toHaveLength(3)
    expect(parsed.members).toHaveLength(3)
    expect(parsed.shapes).toHaveLength(1)
    expect(parsed.shapes[0].name).toBe('Triangle')
  })
})

// ---------------------------------------------------------------------------
// Workflow 2: Template shape with equal spacing
// ---------------------------------------------------------------------------
describe('Workflow 2: Template Pratt truss → equal spacing → merge → validate → round-trip', () => {
  const pratt = generatePrattTruss(6, 2, 4)

  it('generated Pratt truss has expected structure', () => {
    // 4 panels → 5 bottom + 5 top = 10 nodes
    expect(pratt.nodes).toHaveLength(10)
    // 4 bottom + 4 top + 5 verticals + 4 diagonals = 17 members
    expect(pratt.members).toHaveLength(17)
    // Bottom chord members should be snap edges
    const snapEdges = pratt.members.filter((m) => m.isSnapEdge)
    expect(snapEdges).toHaveLength(4)
  })

  it('places 3 copies via equal spacing along target edge', () => {
    const targetEdge: TargetEdge = {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 18, y: 0, z: 0 },
    }
    const result = placeEqualSpacing(pratt, targetEdge, 3, [])

    // Each copy has 10 nodes and 17 members. Copies may share nodes due to merging.
    expect(result.nodes.length).toBeGreaterThan(0)
    expect(result.members.length).toBeGreaterThan(0)
    // 3 copies * 17 = 51 members at most (some may be removed as degenerate)
    expect(result.members.length).toBeLessThanOrEqual(51)
    assertNoOrphanRefs(result.nodes, result.members)
  })

  it('round-trips project with placed template copies', () => {
    const targetEdge: TargetEdge = {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 18, y: 0, z: 0 },
    }
    const result = placeEqualSpacing(pratt, targetEdge, 2, [])

    const project = createProject({
      name: 'Template Test',
      nodes: result.nodes,
      members: result.members,
      shapes: [pratt],
    })

    const json = JSON.parse(JSON.stringify(project))
    const parsed = ProjectSchema.parse(json)

    expect(parsed.nodes).toHaveLength(result.nodes.length)
    expect(parsed.members).toHaveLength(result.members.length)
    expect(parsed.shapes).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// Workflow 3: Model referential integrity
// ---------------------------------------------------------------------------
describe('Workflow 3: Model validation after placement', () => {
  const shape: Shape2D = {
    id: 'beam',
    name: 'Simple Beam',
    nodes: [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 5, y: 0 },
    ],
    members: [
      { id: 'mb', startNode: 'a', endNode: 'b', isSnapEdge: true },
    ],
  }

  it('validates against ProjectSchema after placement', () => {
    const placed = placeShape(shape, {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })

    const project = createProject({
      name: 'Validation Test',
      nodes: placed.nodes,
      members: placed.members,
    })

    const result = ProjectSchema.safeParse(project)
    expect(result.success).toBe(true)
  })

  it('no dangling member references after merge', () => {
    const existing = [createNode({ id: 'e1', position: { x: 0, y: 0, z: 0 } })]
    const placed = placeShape(shape, {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })

    const { mergedNodes, remapTable } = mergeCoincidentNodes(existing, placed.nodes)
    const remapped = applyNodeRemap(placed.members, remapTable)
    const allNodes = [...existing, ...mergedNodes]

    assertNoOrphanRefs(allNodes, remapped)
  })

  it('every node referenced by at least one member', () => {
    const placed = placeShape(shape, {
      start: { x: 0, y: 0, z: 0 },
      end: { x: 10, y: 0, z: 0 },
    })
    assertNoOrphanNodes(placed.nodes, placed.members)
  })
})

// ---------------------------------------------------------------------------
// Backward compatibility: Sprint 001 JSON
// ---------------------------------------------------------------------------
describe('Backward compatibility: Sprint 001 project JSON', () => {
  it('loads a project without shapes field and defaults to empty array', () => {
    const sprint1Json = {
      name: 'Sprint 001 Project',
      nodes: [],
      members: [],
      panels: [],
      loads: [],
      load_cases: [],
      combinations: [],
      // no "shapes" field
    }

    const parsed = ProjectSchema.parse(sprint1Json)
    expect(parsed.shapes).toEqual([])
  })

  it('loads a project with shapes field intact', () => {
    const withShapes = {
      name: 'Project with shapes',
      nodes: [],
      members: [],
      panels: [],
      loads: [],
      load_cases: [],
      combinations: [],
      shapes: [
        {
          id: 's1',
          name: 'Test Shape',
          nodes: [{ id: 'n1', x: 0, y: 0 }],
          members: [],
        },
      ],
    }

    const parsed = ProjectSchema.parse(withShapes)
    expect(parsed.shapes).toHaveLength(1)
    expect(parsed.shapes[0].name).toBe('Test Shape')
  })
})
