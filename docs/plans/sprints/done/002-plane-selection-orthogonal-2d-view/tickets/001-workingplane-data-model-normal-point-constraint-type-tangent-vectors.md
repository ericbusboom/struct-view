---
id: '001'
title: WorkingPlane data model (normal, point, constraint type, tangent vectors)
status: done
use-cases: []
depends-on: []
---

# WorkingPlane data model (normal, point, constraint type, tangent vectors)

## Description

Create a pure TypeScript data model for working planes at
`src/model/WorkingPlane.ts`. A WorkingPlane represents a 2D slice of 3D space
that the user can draw on. It holds the geometric definition (normal, anchor
point, tangent vectors) and the constraint metadata (how many points define it).

This is the foundation for all plane-based editing in the new workflow.

## Acceptance Criteria

- [ ] `WorkingPlane` type defined with fields: id, normal (Vec3), point (Vec3),
  constraintType ('point' | 'line' | 'plane'), constraintPoints (Vec3[]),
  tangentU (Vec3), tangentV (Vec3)
- [ ] `createPlaneFromPoints(points: Vec3[]): WorkingPlane` factory function
  handles 0, 1, 2, and 3 points:
  - 0 points: XY plane through origin, point constraint at origin
  - 1 point: XY plane through that point, point constraint
  - 2 points: plane through both, line constraint, normal chosen to minimize
    angle to nearest world axis
  - 3 points: plane through all three, plane constraint
- [ ] Tangent vectors (tangentU, tangentV) are orthogonal to each other and to
  the normal, seeded from the world axes most perpendicular to the normal
- [ ] All vectors are unit-normalized
- [ ] Exported from `src/model/index.ts`

## Testing

- **Existing tests to run**: `npx vitest run` (verify no regressions)
- **New tests to write**: Unit tests for `createPlaneFromPoints` with 0, 1, 2,
  and 3 point inputs. Verify normal direction, tangent orthogonality, constraint
  type, and anchor point for each case. Test that 2-point case picks the
  expected axis-aligned normal.
- **Verification command**: `npx vitest run`
