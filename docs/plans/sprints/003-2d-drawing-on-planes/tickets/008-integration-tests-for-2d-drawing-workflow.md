---
id: "008"
title: Integration tests for 2D drawing workflow
status: todo
use-cases:
  - SUC-003-01
  - SUC-003-02
  - SUC-003-03
  - SUC-003-04
depends-on:
  - "001"
  - "002"
  - "003"
  - "004"
  - "006"
---

# Integration tests for 2D drawing workflow

## Description

Write integration tests that verify the full 2D drawing workflow end-to-end.
These tests exercise the store-level logic (not React rendering) to confirm that
plane creation, node placement, beam placement, snap behavior, and coordinate
editing all work together correctly.

### Test file: `src/__tests__/integration/sprint-003-drawing/workflow.test.ts`

Following the pattern from Sprint 002's integration tests
(`src/__tests__/integration/sprint-002-planes/workflow.test.ts`).

### Test scenarios

1. **Node placement on plane**: Create a plane, simulate placing a node via the
   planeSnap utilities, verify node exists in model store at the snapped position.

2. **Grid snap accuracy**: Place a node at a non-grid position, verify
   `snapToPlaneGrid` rounds correctly, verify the resulting node is at a grid
   intersection.

3. **Beam creation between placed nodes**: Place two nodes on a plane, create a
   member connecting them, verify member exists in model store with correct
   start/end node IDs.

4. **Snap to existing node**: Place a node, then attempt to place another node
   within snap distance. Verify the nearest-node search finds the existing node
   (no duplicate created).

5. **Coordinate round-trip**: Convert a 3D point to plane-local (u, v) and back
   to 3D. Verify the result matches the original within tolerance.

6. **Coordinate editing**: Set a node's x position to 5.0, then apply "+2.5"
   relative adjustment, verify final position is 7.5.

7. **Tilted plane workflow**: Create a plane from 3 non-axis-aligned points,
   place nodes on it, verify they lie on the plane (isOnPlane returns true).

8. **Focus mode round-trip**: Verify that savedCameraState is populated on
   focus enter, and that toggling focus off restores the state (already covered
   by Sprint 002 tests, but verify no regression).

## Acceptance Criteria

- [ ] All integration test scenarios pass
- [ ] Tests run without requiring a browser/DOM (store-level only)
- [ ] No regressions in existing 188 tests
- [ ] Tests cover plane snap, node placement, beam creation, coordinate editing

## Testing

- **Existing tests to run**: `npx vitest run` (all tests)
- **New tests to write**: `src/__tests__/integration/sprint-003-drawing/workflow.test.ts`
- **Verification command**: `npx vitest run src/__tests__/integration/sprint-003-drawing/`
