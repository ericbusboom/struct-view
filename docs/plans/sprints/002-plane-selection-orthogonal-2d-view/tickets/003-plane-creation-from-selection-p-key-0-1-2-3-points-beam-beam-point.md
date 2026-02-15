---
id: '003'
title: "Plane creation from selection (p key \u2014 0/1/2/3 points, beam, beam+point)"
status: done
use-cases: []
depends-on:
- '001'
- '002'
---

# Plane creation from selection (p key — 0/1/2/3 points, beam, beam+point)

## Description

Add `p` key handling to KeyboardHandler that creates a working plane from the
current selection. The selection can be 0-3 points, a beam (equivalent to
selecting its 2 endpoint nodes), or a beam plus a point (equivalent to selecting
3 points).

## Acceptance Criteria

- [ ] Pressing `p` with no selection creates an XY plane through the origin
  (point constraint at origin)
- [ ] Pressing `p` with 1 selected node creates an XY plane through that node
  (point constraint)
- [ ] Pressing `p` with 2 selected nodes creates a line-constrained plane
  through both, oriented to nearest world axis
- [ ] Pressing `p` with 3 selected nodes creates a fully-constrained plane
  through all three
- [ ] Pressing `p` with a beam selected creates a line-constrained plane
  through the beam's two endpoints (equivalent to selecting 2 points)
- [ ] Pressing `p` with a beam and one additional node selected creates a
  fully-constrained plane (equivalent to selecting 3 points)
- [ ] Pressing `p` with more than 3 points uses the first 3
- [ ] The created plane is set as the active plane in usePlaneStore
- [ ] If a plane already exists, pressing `p` replaces it with the new one

## Testing

- **Existing tests to run**: `npx vitest run`
- **New tests to write**: Unit tests for the selection-to-plane logic: verify
  correct constraint type and normal for each selection scenario (0 points, 1
  point, 2 points, 3 points, beam, beam+point). Integration test: set selection
  in useEditorStore, simulate `p` key, verify usePlaneStore has correct plane.
- **Verification command**: `npx vitest run`
