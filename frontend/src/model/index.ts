export {
  NodeSchema,
  MemberSchema,
  PanelSchema,
  LoadSchema,
  LoadCaseSchema,
  LoadCombinationSchema,
  ProjectSchema,
  SupportTypeSchema,
  ConnectionTypeSchema,
  ConnectionMethodSchema,
  LoadTypeSchema,
  LoadCaseTypeSchema,
} from './schemas'

export type {
  Vec3,
  Support,
  SpringStiffness,
  SupportType,
  ConnectionType,
  ConnectionMethod,
  Node,
  Material,
  Section,
  EndRelease,
  EndReleases,
  Member,
  PanelMaterial,
  Panel,
  LoadType,
  Load,
  LoadCaseType,
  LoadCase,
  CombinationFactor,
  LoadCombination,
  Project,
} from './schemas'

export { validateProject } from './validation'
export type { ValidationError, ValidationResult } from './validation'

export {
  createNode,
  createMember,
  createPanel,
  createLoad,
  createLoadCase,
  createLoadCombination,
  createProject,
} from './defaults'
