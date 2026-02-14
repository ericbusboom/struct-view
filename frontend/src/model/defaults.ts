import { nanoid } from 'nanoid'
import type { Node, Member, Panel, Load, Project, LoadCase, LoadCombination, Shape2D } from './schemas'

const NO_RELEASE = { fx: false, fy: false, fz: false, mx: false, my: false, mz: false }

/** Structural steel defaults (A36 / S275). */
const DEFAULT_MATERIAL = {
  name: 'Steel A36',
  E: 200e9,
  G: 77.2e9,
  density: 7850,
  yield_strength: 250e6,
}

/** W8x31 section approximation. */
const DEFAULT_SECTION = {
  name: 'W8x31',
  A: 5.87e-3,
  Ix: 110e-6 / 1e2, // 1.10e-4 m⁴ (simplified)
  Iy: 37.1e-6 / 1e2,
  Sx: 27.5e-6 / 1e1,
  Sy: 12.4e-6 / 1e1,
  J: 0.536e-6,
}

export function createNode(overrides: Partial<Node> = {}): Node {
  return {
    id: nanoid(),
    position: { x: 0, y: 0, z: 0 },
    support: { type: 'free' },
    connection_type: 'rigid',
    tags: [],
    ...overrides,
  }
}

export function createMember(
  startNode: string,
  endNode: string,
  overrides: Partial<Member> = {},
): Member {
  return {
    id: nanoid(),
    start_node: startNode,
    end_node: endNode,
    material: { ...DEFAULT_MATERIAL },
    section: { ...DEFAULT_SECTION },
    end_releases: { start: { ...NO_RELEASE }, end: { ...NO_RELEASE } },
    tags: [],
    ...overrides,
  }
}

export function createPanel(
  nodeIds: string[],
  overrides: Partial<Panel> = {},
): Panel {
  return {
    id: nanoid(),
    node_ids: nodeIds,
    material: {
      name: 'Plywood',
      E: 12.4e9,
      G: 0.62e9,
      thickness: 0.012,
      density: 600,
    },
    side: 'positive',
    tags: [],
    ...overrides,
  }
}

export function createLoad(
  target: string,
  caseName: string,
  overrides: Partial<Load> = {},
): Load {
  return {
    id: nanoid(),
    case: caseName,
    type: 'point',
    target,
    magnitude: -1000,
    direction: { x: 0, y: -1, z: 0 },
    tags: [],
    ...overrides,
  } as Load
}

export function createLoadCase(overrides: Partial<LoadCase> = {}): LoadCase {
  return {
    name: 'Dead',
    type: 'dead',
    ...overrides,
  }
}

export function createLoadCombination(
  overrides: Partial<LoadCombination> = {},
): LoadCombination {
  return {
    name: '1.2D + 1.6L',
    factors: [
      { case: 'Dead', factor: 1.2 },
      { case: 'Live', factor: 1.6 },
    ],
    ...overrides,
  }
}

export function createShape2D(name: string = 'Untitled Shape'): Shape2D {
  return {
    id: nanoid(),
    name,
    nodes: [],
    members: [],
  }
}

export function createProject(overrides: Partial<Project> = {}): Project {
  return {
    name: 'Untitled Project',
    nodes: [],
    members: [],
    panels: [],
    loads: [],
    load_cases: [],
    combinations: [],
    shapes: [],
    ...overrides,
  }
}
