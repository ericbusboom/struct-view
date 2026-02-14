import { describe, it, expect } from 'vitest'
import { serializeProject, parseProjectFile } from '../projectFile'
import {
  createProject,
  createNode,
  createMember,
  createLoadCase,
  createLoad,
  createLoadCombination,
} from '../../model'

function sampleProject() {
  const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 }, support: { type: 'fixed' } })
  const n2 = createNode({ id: 'n2', position: { x: 5, y: 3, z: 0 } })
  const m1 = createMember('n1', 'n2', { id: 'm1' })
  const lc = createLoadCase({ name: 'Dead', type: 'dead' })
  const load = createLoad('m1', 'Dead', { id: 'L1', magnitude: -5000 })
  const combo = createLoadCombination({ name: '1.2D', factors: [{ case: 'Dead', factor: 1.2 }] })
  return createProject({
    name: 'Test Frame',
    nodes: [n1, n2],
    members: [m1],
    load_cases: [lc],
    loads: [load],
    combinations: [combo],
  })
}

describe('serializeProject / parseProjectFile', () => {
  it('round-trips a project exactly', () => {
    const project = sampleProject()
    const json = serializeProject(project)
    const result = parseProjectFile(json)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.project.name).toBe('Test Frame')
    expect(result.project.nodes).toHaveLength(2)
    expect(result.project.members).toHaveLength(1)
    expect(result.project.loads).toHaveLength(1)
    expect(result.project.combinations).toHaveLength(1)

    // IDs preserved
    expect(result.project.nodes[0].id).toBe('n1')
    expect(result.project.nodes[1].id).toBe('n2')
    expect(result.project.members[0].id).toBe('m1')

    // Coordinates preserved
    expect(result.project.nodes[0].position).toEqual({ x: 0, y: 0, z: 0 })
    expect(result.project.nodes[1].position).toEqual({ x: 5, y: 3, z: 0 })

    // Load magnitude preserved
    expect(result.project.loads[0].magnitude).toBe(-5000)
  })

  it('includes version metadata in serialized output', () => {
    const json = serializeProject(sampleProject())
    const parsed = JSON.parse(json)
    expect(parsed.version).toBe('1.0.0')
    expect(parsed.created_at).toBeDefined()
    expect(parsed.modified_at).toBeDefined()
  })

  it('rejects invalid JSON', () => {
    const result = parseProjectFile('not json {{{')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors[0]).toContain('Invalid JSON')
    }
  })

  it('rejects valid JSON that fails schema validation', () => {
    const result = parseProjectFile('{"name": ""}')
    expect(result.ok).toBe(false)
  })

  it('accepts a bare Project (without wrapper)', () => {
    const project = sampleProject()
    const bareJson = JSON.stringify(project)
    const result = parseProjectFile(bareJson)
    expect(result.ok).toBe(true)
  })

  it('round-trips an empty project', () => {
    const project = createProject({ name: 'Empty' })
    const json = serializeProject(project)
    const result = parseProjectFile(json)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.project.name).toBe('Empty')
      expect(result.project.nodes).toHaveLength(0)
    }
  })
})
