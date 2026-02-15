export {
  NodeSchema,
  MemberSchema,
  GroupSchema,
  PanelSchema,
  LoadSchema,
  LoadCaseSchema,
  LoadCombinationSchema,
  PlacementPlaneSchema,
  Shape2DNodeSchema,
  Shape2DMemberSchema,
  Shape2DSchema,
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
  Group,
  PanelMaterial,
  Panel,
  LoadType,
  Load,
  LoadCaseType,
  LoadCase,
  CombinationFactor,
  LoadCombination,
  PlacementPlane,
  Shape2DNode,
  Shape2DMember,
  Shape2D,
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
  createGroup,
  createShape2D,
  createProject,
} from './defaults'

export type { WorkingPlane, ConstraintType } from './WorkingPlane'
export { createPlaneFromPoints, getPlaneColor, _resetPlaneIdCounter } from './WorkingPlane'
