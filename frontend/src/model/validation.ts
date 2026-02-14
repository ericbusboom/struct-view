import { ProjectSchema } from './schemas'
import type { Project } from './schemas'

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/** Validate a project against schema and cross-reference rules. */
export function validateProject(data: unknown): ValidationResult {
  const errors: ValidationError[] = []

  // Phase 1: Schema validation via Zod
  const parsed = ProjectSchema.safeParse(data)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push({
        path: issue.path.join('.'),
        message: issue.message,
      })
    }
    return { valid: false, errors }
  }

  const project: Project = parsed.data

  // Phase 2: Cross-reference validation
  const nodeIds = new Set<string>()

  // Check duplicate node IDs
  for (const node of project.nodes) {
    if (nodeIds.has(node.id)) {
      errors.push({
        path: `nodes`,
        message: `Duplicate node ID: "${node.id}"`,
      })
    }
    nodeIds.add(node.id)
  }

  // Check member endpoint references
  for (const member of project.members) {
    if (!nodeIds.has(member.start_node)) {
      errors.push({
        path: `members.${member.id}.start_node`,
        message: `Member "${member.id}" references non-existent start_node "${member.start_node}"`,
      })
    }
    if (!nodeIds.has(member.end_node)) {
      errors.push({
        path: `members.${member.id}.end_node`,
        message: `Member "${member.id}" references non-existent end_node "${member.end_node}"`,
      })
    }
    if (member.start_node === member.end_node) {
      errors.push({
        path: `members.${member.id}`,
        message: `Member "${member.id}" has identical start and end nodes`,
      })
    }
  }

  // Check duplicate member IDs
  const memberIds = new Set<string>()
  for (const member of project.members) {
    if (memberIds.has(member.id)) {
      errors.push({
        path: `members`,
        message: `Duplicate member ID: "${member.id}"`,
      })
    }
    memberIds.add(member.id)
  }

  // Check panel node references
  const panelIds = new Set<string>()
  for (const panel of project.panels) {
    if (panelIds.has(panel.id)) {
      errors.push({
        path: `panels`,
        message: `Duplicate panel ID: "${panel.id}"`,
      })
    }
    panelIds.add(panel.id)

    for (const nid of panel.node_ids) {
      if (!nodeIds.has(nid)) {
        errors.push({
          path: `panels.${panel.id}.node_ids`,
          message: `Panel "${panel.id}" references non-existent node "${nid}"`,
        })
      }
    }
  }

  // Check load target references and load case references
  const targetIds = new Set([...memberIds, ...panelIds])
  const loadCaseNames = new Set(project.load_cases.map((lc) => lc.name))
  const loadIds = new Set<string>()

  for (const load of project.loads) {
    if (loadIds.has(load.id)) {
      errors.push({
        path: `loads`,
        message: `Duplicate load ID: "${load.id}"`,
      })
    }
    loadIds.add(load.id)

    if (load.type !== 'self_weight' && !targetIds.has(load.target)) {
      errors.push({
        path: `loads.${load.id}.target`,
        message: `Load "${load.id}" references non-existent target "${load.target}"`,
      })
    }

    if (!loadCaseNames.has(load.case)) {
      errors.push({
        path: `loads.${load.id}.case`,
        message: `Load "${load.id}" references non-existent load case "${load.case}"`,
      })
    }
  }

  // Check combination factor references
  for (const combo of project.combinations) {
    for (const factor of combo.factors) {
      if (!loadCaseNames.has(factor.case)) {
        errors.push({
          path: `combinations.${combo.name}.factors`,
          message: `Combination "${combo.name}" references non-existent load case "${factor.case}"`,
        })
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
