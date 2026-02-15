---
id: '001'
title: 'Schema changes: PlacementPlane type and trussId on Node/Member'
status: done
use-cases:
- SUC-003
- SUC-004
- SUC-005
- SUC-006
depends-on: []
---

# Schema changes: PlacementPlane type and trussId on Node/Member

## Description

Add foundational schema changes that other tickets depend on:

1. Add `PlacementPlane` type (`"XZ" | "XY" | "YZ"`) to `model/schemas.ts`.
2. Add optional `placementPlane` field to `Shape2D` (default `"XZ"`).
3. Add optional `trussId` field to `Node` and `Member` schemas.
4. Update Zod validators for all affected types.
5. Update `useModelStore` with a helper to query nodes/members by trussId.

## Acceptance Criteria

- [ ] `PlacementPlane` type exported from schemas
- [ ] `Shape2D` schema includes `placementPlane` with default `"XZ"`
- [ ] `Node` schema includes optional `trussId`
- [ ] `Member` schema includes optional `trussId`
- [ ] Zod validators updated and passing
- [ ] `useModelStore` has `getNodesByTrussId(id)` and `getMembersByTrussId(id)` helpers
- [ ] Existing tests still pass (no regressions)

## Testing

- **Existing tests to run**: All existing model/schema tests
- **New tests to write**: Unit tests for schema validation with new fields, helper query functions
- **Verification command**: `npm test`
