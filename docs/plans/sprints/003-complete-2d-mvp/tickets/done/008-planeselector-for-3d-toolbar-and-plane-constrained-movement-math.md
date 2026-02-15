---
id: 008
title: PlaneSelector for 3D toolbar and plane-constrained movement math
status: done
use-cases:
- SUC-004
- SUC-005
depends-on:
- '001'
- '003'
---

# PlaneSelector for 3D toolbar and plane-constrained movement math

## Description

Reuse the `PlaneSelector` component (from ticket 003) in the 3D toolbar
and implement the plane-constrained projection math:

1. Add `PlaneSelector` to the 3D editor toolbar (visible when a truss
   is selected).
2. Add `activePlane` state to `useEditorStore` (default "XZ").
3. Create `editor3d/planeMove.ts` with `projectToPlane()` function:
   given a camera ray and a constraint plane passing through a point,
   return the intersection point.
4. Unit test the projection math for all three planes and edge cases
   (parallel ray, etc.).

## Acceptance Criteria

- [ ] PlaneSelector visible in 3D toolbar when a truss is selected
- [ ] `activePlane` state in editor store, default XZ
- [ ] `projectToPlane()` correctly projects rays onto XY, XZ, YZ planes
- [ ] Edge cases handled (parallel ray returns null)

## Testing

- **Existing tests to run**: Editor store tests
- **New tests to write**: `projectToPlane()` unit tests for all planes, edge cases
- **Verification command**: `npm test`
