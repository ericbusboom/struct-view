---
id: '010'
title: Sprint 002 integration tests
status: done
use-cases:
- SUC-004
- SUC-005
- SUC-006
depends-on:
- '001'
- '002'
- '003'
- '004'
- '005'
- '006'
- '007'
- 008
- 009
---

# Sprint 002 integration tests

## Description

End-to-end integration tests covering the full 2D-to-3D workflow introduced in Sprint 002. These tests exercise the complete pipeline programmatically using store operations: create a truss shape in the 2D editor, save it to the shape library, place it in the 3D scene, verify model integrity after placement and node merging, and confirm that export/import round-trips preserve the placed geometry. This ticket ensures all Sprint 002 components work together correctly.

## Implementation Notes

- Write Vitest integration tests that operate at the store level (no browser/DOM required for the core workflow tests).
- Test workflow 1 -- Custom shape:
  1. Create nodes and members via the 2D editor store.
  2. Save the shape to the project shape library.
  3. Place the shape in 3D using `placeShape` against a known target edge.
  4. Run `mergeCoincidentNodes`.
  5. Assert the model contains the expected nodes and members with correct coordinates.
  6. Export the project to JSON, reimport, assert deep equality.
- Test workflow 2 -- Template shape:
  1. Generate a Pratt truss via `generatePrattTruss`.
  2. Save to shape library.
  3. Place 3 copies via equal-spacing mode along a target edge.
  4. Assert correct total node/member counts accounting for merges.
  5. Export/import round-trip.
- Test workflow 3 -- Model validation:
  1. After placement, validate the model against the full `ProjectSchema`.
  2. Assert all member node references point to existing nodes.
  3. Assert no orphan nodes (every node is referenced by at least one member).
- Place test files in a dedicated integration test directory (e.g., `src/__tests__/integration/sprint-002/`).

## Acceptance Criteria

- [ ] Full custom-shape workflow test passes: draw, save, place, merge, verify.
- [ ] Full template workflow test passes: generate, save, place 3 copies, merge, verify.
- [ ] Model validates against `ProjectSchema` after all placements.
- [ ] All member node references are valid (no dangling references).
- [ ] Export-to-JSON and reimport round-trip preserves all placed geometry.
- [ ] No regressions in existing Sprint 001 tests.

## Testing

- **Existing tests to run**: All Sprint 001 tests, all Sprint 002 unit tests from tickets 001-009.
- **New tests to write**:
  - Integration test: custom shape end-to-end workflow (draw, save, place, merge, validate, round-trip).
  - Integration test: template shape end-to-end workflow (generate Pratt, place 3 copies, merge, validate, round-trip).
  - Integration test: model referential integrity after placement (no dangling node references, no orphan nodes).
  - Integration test: backward compatibility -- Sprint 001 project JSON loads correctly with the new `shapes` field defaulting to empty.
- **Verification command**: `npx vitest run`
