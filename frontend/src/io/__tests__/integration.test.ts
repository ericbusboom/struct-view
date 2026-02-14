import { describe, it, expect, beforeEach } from 'vitest'
import { useModelStore } from '../../store/useModelStore'
import { serializeProject, parseProjectFile } from '../projectFile'
import { validateProject, createNode, createMember, createLoadCase, createLoad, createProject } from '../../model'

function resetStore() {
  useModelStore.setState({
    name: 'Test',
    nodes: [],
    members: [],
    panels: [],
    loads: [],
    load_cases: [],
    combinations: [],
  })
}

describe('integration: create -> edit -> export -> import -> validate', () => {
  beforeEach(resetStore)

  it('full round-trip workflow preserves model integrity', () => {
    const store = useModelStore.getState()

    // Step 1: Create nodes
    const n1 = createNode({ id: 'n1', position: { x: 0, y: 0, z: 0 }, support: { type: 'fixed' } })
    const n2 = createNode({ id: 'n2', position: { x: 0, y: 3, z: 0 } })
    const n3 = createNode({ id: 'n3', position: { x: 5, y: 3, z: 0 } })
    const n4 = createNode({ id: 'n4', position: { x: 5, y: 0, z: 0 }, support: { type: 'fixed' } })
    store.addNode(n1)
    store.addNode(n2)
    store.addNode(n3)
    store.addNode(n4)

    // Step 2: Create members
    const m1 = createMember('n1', 'n2', { id: 'm1' })
    const m2 = createMember('n2', 'n3', { id: 'm2' })
    const m3 = createMember('n3', 'n4', { id: 'm3' })
    store.addMember(m1)
    store.addMember(m2)
    store.addMember(m3)

    // Step 3: Add loads
    const lc = createLoadCase({ name: 'Dead', type: 'dead' })
    const load = createLoad('m2', 'Dead', { id: 'L1', magnitude: -10000 })

    // Step 4: Edit — move a node
    useModelStore.getState().updateNode('n2', { position: { x: 0, y: 4, z: 0 } })

    // Step 5: Build full project state for export
    const state = useModelStore.getState()
    const project = createProject({
      name: 'Integration Test',
      nodes: state.nodes,
      members: state.members,
      loads: [load],
      load_cases: [lc],
    })

    // Step 6: Validate before export
    const preExportValidation = validateProject(project)
    expect(preExportValidation.valid).toBe(true)

    // Step 7: Export
    const json = serializeProject(project)
    expect(json).toBeTruthy()
    expect(json.length).toBeGreaterThan(100)

    // Step 8: Import
    const importResult = parseProjectFile(json)
    expect(importResult.ok).toBe(true)
    if (!importResult.ok) return

    // Step 9: Validate after import
    const postImportValidation = validateProject(importResult.project)
    expect(postImportValidation.valid).toBe(true)

    // Step 10: Verify data integrity
    const imported = importResult.project
    expect(imported.name).toBe('Integration Test')
    expect(imported.nodes).toHaveLength(4)
    expect(imported.members).toHaveLength(3)
    expect(imported.loads).toHaveLength(1)

    // Verify the edit was preserved
    const importedN2 = imported.nodes.find((n) => n.id === 'n2')
    expect(importedN2?.position.y).toBe(4)

    // Verify IDs are preserved
    expect(imported.nodes.map((n) => n.id)).toEqual(['n1', 'n2', 'n3', 'n4'])
    expect(imported.members.map((m) => m.id)).toEqual(['m1', 'm2', 'm3'])

    // Verify member references still valid
    expect(imported.members[0].start_node).toBe('n1')
    expect(imported.members[0].end_node).toBe('n2')

    // Step 11: Load into store and verify
    useModelStore.getState().loadProject(imported)
    const finalState = useModelStore.getState()
    expect(finalState.name).toBe('Integration Test')
    expect(finalState.nodes).toHaveLength(4)
    expect(finalState.members).toHaveLength(3)
  })

  it('detects corrupted data on import', () => {
    // Create a valid project, corrupt it, verify import fails
    const project = createProject({
      name: 'Corrupted',
      nodes: [createNode({ id: 'n1' })],
      members: [createMember('n1', 'missing', { id: 'm1' })],
    })
    const json = JSON.stringify({ version: '1.0.0', project })
    const result = parseProjectFile(json)

    // Schema parse succeeds but cross-reference validation catches the error
    // since parseProjectFile uses validateProject which checks references
    if (result.ok) {
      const validation = validateProject(result.project)
      expect(validation.valid).toBe(false)
    }
  })
})
