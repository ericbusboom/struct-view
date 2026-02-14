import { z } from 'zod'

// --- Shared primitives ---

const Vec3Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
})

const positiveFinite = z.number().finite().positive()

// --- Node ---

export const SupportTypeSchema = z.enum([
  'free', 'pinned', 'fixed',
  'roller_x', 'roller_y', 'roller_z',
  'spring',
])

const SpringStiffnessSchema = z.object({
  kx: z.number().finite().nonnegative(),
  ky: z.number().finite().nonnegative(),
  kz: z.number().finite().nonnegative(),
  krx: z.number().finite().nonnegative(),
  kry: z.number().finite().nonnegative(),
  krz: z.number().finite().nonnegative(),
})

const SupportSchema = z.object({
  type: SupportTypeSchema,
  spring_stiffness: SpringStiffnessSchema.optional(),
}).refine(
  (s) => s.type !== 'spring' || s.spring_stiffness !== undefined,
  { message: 'spring_stiffness is required when support type is "spring"' },
)

export const ConnectionTypeSchema = z.enum(['rigid', 'pinned', 'semi_rigid'])

export const ConnectionMethodSchema = z.enum([
  'welded', 'bolted', 'screwed', 'nailed', 'glued',
])

export const NodeSchema = z.object({
  id: z.string().min(1),
  position: Vec3Schema,
  support: SupportSchema,
  connection_type: ConnectionTypeSchema,
  connection_method: ConnectionMethodSchema.optional(),
  tags: z.array(z.string()),
})

// --- Member ---

const MaterialSchema = z.object({
  name: z.string().min(1),
  E: positiveFinite,
  G: positiveFinite,
  density: positiveFinite,
  yield_strength: positiveFinite,
})

const SectionSchema = z.object({
  name: z.string().min(1),
  A: positiveFinite,
  Ix: positiveFinite,
  Iy: positiveFinite,
  Sx: positiveFinite,
  Sy: positiveFinite,
  J: positiveFinite,
})

const EndReleaseSchema = z.object({
  fx: z.boolean(),
  fy: z.boolean(),
  fz: z.boolean(),
  mx: z.boolean(),
  my: z.boolean(),
  mz: z.boolean(),
})

const EndReleasesSchema = z.object({
  start: EndReleaseSchema,
  end: EndReleaseSchema,
})

export const MemberSchema = z.object({
  id: z.string().min(1),
  start_node: z.string().min(1),
  end_node: z.string().min(1),
  material: MaterialSchema,
  section: SectionSchema,
  end_releases: EndReleasesSchema,
  tags: z.array(z.string()),
})

// --- Panel ---

const PanelMaterialSchema = z.object({
  name: z.string().min(1),
  E: positiveFinite,
  G: positiveFinite,
  thickness: positiveFinite,
  density: positiveFinite,
})

export const PanelSchema = z.object({
  id: z.string().min(1),
  node_ids: z.array(z.string().min(1)).min(3),
  material: PanelMaterialSchema,
  side: z.enum(['positive', 'negative']),
  tags: z.array(z.string()),
})

// --- Load ---

export const LoadTypeSchema = z.enum([
  'point', 'distributed', 'area', 'self_weight',
])

export const LoadSchema = z.object({
  id: z.string().min(1),
  case: z.string().min(1),
  type: LoadTypeSchema,
  target: z.string().min(1),
  magnitude: z.number().finite(),
  direction: Vec3Schema,
  position: z.number().finite().min(0).max(1).optional(),
  start_magnitude: z.number().finite().optional(),
  end_magnitude: z.number().finite().optional(),
})

// --- Load Case & Combination ---

export const LoadCaseTypeSchema = z.enum([
  'dead', 'live', 'wind', 'snow', 'seismic', 'other',
])

export const LoadCaseSchema = z.object({
  name: z.string().min(1),
  type: LoadCaseTypeSchema,
})

const CombinationFactorSchema = z.object({
  case: z.string().min(1),
  factor: z.number().finite(),
})

export const LoadCombinationSchema = z.object({
  name: z.string().min(1),
  factors: z.array(CombinationFactorSchema).min(1),
})

// --- Project ---

export const ProjectSchema = z.object({
  name: z.string().min(1),
  nodes: z.array(NodeSchema),
  members: z.array(MemberSchema),
  panels: z.array(PanelSchema),
  loads: z.array(LoadSchema),
  load_cases: z.array(LoadCaseSchema),
  combinations: z.array(LoadCombinationSchema),
})

// --- Inferred Types ---

export type Vec3 = z.infer<typeof Vec3Schema>
export type Support = z.infer<typeof SupportSchema>
export type SpringStiffness = z.infer<typeof SpringStiffnessSchema>
export type SupportType = z.infer<typeof SupportTypeSchema>
export type ConnectionType = z.infer<typeof ConnectionTypeSchema>
export type ConnectionMethod = z.infer<typeof ConnectionMethodSchema>
export type Node = z.infer<typeof NodeSchema>
export type Material = z.infer<typeof MaterialSchema>
export type Section = z.infer<typeof SectionSchema>
export type EndRelease = z.infer<typeof EndReleaseSchema>
export type EndReleases = z.infer<typeof EndReleasesSchema>
export type Member = z.infer<typeof MemberSchema>
export type PanelMaterial = z.infer<typeof PanelMaterialSchema>
export type Panel = z.infer<typeof PanelSchema>
export type LoadType = z.infer<typeof LoadTypeSchema>
export type Load = z.infer<typeof LoadSchema>
export type LoadCaseType = z.infer<typeof LoadCaseTypeSchema>
export type LoadCase = z.infer<typeof LoadCaseSchema>
export type CombinationFactor = z.infer<typeof CombinationFactorSchema>
export type LoadCombination = z.infer<typeof LoadCombinationSchema>
export type Project = z.infer<typeof ProjectSchema>
