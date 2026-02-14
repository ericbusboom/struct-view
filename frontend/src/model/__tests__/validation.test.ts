import { describe, it, expect } from 'vitest'
import { validateProject } from '../validation'
import {
  createNode,
  createMember,
  createPanel,
  createLoad,
  createLoadCase,
  createProject,
} from '../defaults'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function minimalValidProject() {
  const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
  const n2 = createNode({ id: 'n2', position: { x: 3, y: 0, z: 0 } })
  const m1 = createMember('n1', 'n2', { id: 'm1' })
  const lc = createLoadCase({ name: 'Dead', type: 'dead' })
  const load = createLoad('m1', 'Dead', { id: 'L1' })
  return createProject({
    name: 'Test',
    nodes: [n1, n2],
    members: [m1],
    loads: [load],
    load_cases: [lc],
  })
}

// ---------------------------------------------------------------------------
// Empty / minimal projects
// ---------------------------------------------------------------------------

describe('validateProject – basic', () => {
  it('accepts an empty project', () => {
    const result = validateProject(createProject())
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('accepts a minimal valid project with nodes, member, load case, and load', () => {
    const result = validateProject(minimalValidProject())
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects completely invalid input', () => {
    const result = validateProject('not a project')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('rejects null', () => {
    const result = validateProject(null)
    expect(result.valid).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Duplicate IDs
// ---------------------------------------------------------------------------

describe('validateProject – duplicate IDs', () => {
  it('catches duplicate node IDs', () => {
    const n1a = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 } })
    const n1b = createNode({ id: 'n1', position: { x: 1, y: 0, z: 0 } })
    const result = validateProject(createProject({ nodes: [n1a, n1b] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('Duplicate node ID'))).toBe(true)
  })

  it('catches duplicate member IDs', () => {
    const n1 = createNode({ id: 'n1' })
    const n2 = createNode({ id: 'n2' })
    const n3 = createNode({ id: 'n3' })
    const m1a = createMember('n1', 'n2', { id: 'm1' })
    const m1b = createMember('n2', 'n3', { id: 'm1' })
    const result = validateProject(createProject({ nodes: [n1, n2, n3], members: [m1a, m1b] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('Duplicate member ID'))).toBe(true)
  })

  it('catches duplicate panel IDs', () => {
    const nodes = ['n1', 'n2', 'n3', 'n4'].map((id, i) =>
      createNode({ id, position: { x: i, y: 0, z: 0 } }),
    )
    const p1a = createPanel(['n1', 'n2', 'n3'], { id: 'p1' })
    const p1b = createPanel(['n2', 'n3', 'n4'], { id: 'p1' })
    const result = validateProject(createProject({ nodes, panels: [p1a, p1b] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('Duplicate panel ID'))).toBe(true)
  })

  it('catches duplicate load IDs', () => {
    const n1 = createNode({ id: 'n1' })
    const n2 = createNode({ id: 'n2' })
    const m1 = createMember('n1', 'n2', { id: 'm1' })
    const lc = createLoadCase({ name: 'Dead' })
    const la = createLoad('m1', 'Dead', { id: 'L1' })
    const lb = createLoad('m1', 'Dead', { id: 'L1' })
    const result = validateProject(
      createProject({ nodes: [n1, n2], members: [m1], loads: [la, lb], load_cases: [lc] }),
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('Duplicate load ID'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Invalid references
// ---------------------------------------------------------------------------

describe('validateProject – invalid references', () => {
  it('catches member referencing non-existent start node', () => {
    const n1 = createNode({ id: 'n1' })
    const m = createMember('missing', 'n1', { id: 'm1' })
    const result = validateProject(createProject({ nodes: [n1], members: [m] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('non-existent start_node'))).toBe(true)
  })

  it('catches member referencing non-existent end node', () => {
    const n1 = createNode({ id: 'n1' })
    const m = createMember('n1', 'missing', { id: 'm1' })
    const result = validateProject(createProject({ nodes: [n1], members: [m] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('non-existent end_node'))).toBe(true)
  })

  it('catches member with identical start and end nodes', () => {
    const n1 = createNode({ id: 'n1' })
    const m = createMember('n1', 'n1', { id: 'm1' })
    const result = validateProject(createProject({ nodes: [n1], members: [m] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('identical start and end'))).toBe(true)
  })

  it('catches panel referencing non-existent node', () => {
    const n1 = createNode({ id: 'n1' })
    const n2 = createNode({ id: 'n2' })
    const p = createPanel(['n1', 'n2', 'missing'], { id: 'p1' })
    const result = validateProject(createProject({ nodes: [n1, n2], panels: [p] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('non-existent node'))).toBe(true)
  })

  it('catches load referencing non-existent target', () => {
    const lc = createLoadCase({ name: 'Dead' })
    const load = createLoad('missing', 'Dead', { id: 'L1' })
    const result = validateProject(createProject({ loads: [load], load_cases: [lc] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('non-existent target'))).toBe(true)
  })

  it('catches load referencing non-existent load case', () => {
    const n1 = createNode({ id: 'n1' })
    const n2 = createNode({ id: 'n2' })
    const m1 = createMember('n1', 'n2', { id: 'm1' })
    const load = createLoad('m1', 'NoSuchCase', { id: 'L1' })
    const result = validateProject(
      createProject({ nodes: [n1, n2], members: [m1], loads: [load] }),
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('non-existent load case'))).toBe(true)
  })

  it('catches combination referencing non-existent load case', () => {
    const combo = { name: 'Bad Combo', factors: [{ case: 'Missing', factor: 1.0 }] }
    const result = validateProject(createProject({ combinations: [combo] }))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('non-existent load case'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Schema-level validation
// ---------------------------------------------------------------------------

describe('validateProject – schema validation', () => {
  it('rejects node with NaN coordinate', () => {
    const bad = createNode({ id: 'n1', position: { x: NaN, y: 0, z: 0 } })
    const result = validateProject(createProject({ nodes: [bad] }))
    expect(result.valid).toBe(false)
  })

  it('rejects node with Infinity coordinate', () => {
    const bad = createNode({ id: 'n1', position: { x: Infinity, y: 0, z: 0 } })
    const result = validateProject(createProject({ nodes: [bad] }))
    expect(result.valid).toBe(false)
  })

  it('rejects member with negative material properties', () => {
    const n1 = createNode({ id: 'n1' })
    const n2 = createNode({ id: 'n2' })
    const m = createMember('n1', 'n2', { id: 'm1' })
    m.material.E = -1
    const result = validateProject(createProject({ nodes: [n1, n2], members: [m] }))
    expect(result.valid).toBe(false)
  })

  it('rejects panel with fewer than 3 nodes', () => {
    const raw = createProject() as Record<string, unknown>
    raw.panels = [{ id: 'p1', node_ids: ['n1', 'n2'], material: { name: 'X', E: 1, G: 1, thickness: 1, density: 1 }, side: 'positive', tags: [] }]
    const result = validateProject(raw)
    expect(result.valid).toBe(false)
  })

  it('rejects spring support without stiffness', () => {
    const bad = createNode({ id: 'n1', support: { type: 'spring' } as never })
    const result = validateProject(createProject({ nodes: [bad] }))
    expect(result.valid).toBe(false)
  })

  it('accepts spring support with stiffness', () => {
    const good = createNode({
      id: 'n1',
      support: {
        type: 'spring',
        spring_stiffness: { kx: 100, ky: 100, kz: 100, krx: 0, kry: 0, krz: 0 },
      },
    })
    const result = validateProject(createProject({ nodes: [good] }))
    expect(result.valid).toBe(true)
  })

  it('rejects empty project name', () => {
    const result = validateProject({ ...createProject(), name: '' })
    expect(result.valid).toBe(false)
  })

  it('rejects load position outside 0-1 range', () => {
    const n1 = createNode({ id: 'n1' })
    const n2 = createNode({ id: 'n2' })
    const m1 = createMember('n1', 'n2', { id: 'm1' })
    const lc = createLoadCase({ name: 'Dead' })
    const load = createLoad('m1', 'Dead', { id: 'L1', position: 1.5 })
    const result = validateProject(
      createProject({ nodes: [n1, n2], members: [m1], loads: [load], load_cases: [lc] }),
    )
    expect(result.valid).toBe(false)
  })
})
