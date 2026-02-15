---
id: '012'
title: Snap indicators for node co-location during move and rotate
status: done
use-cases:
- SUC-004
- SUC-005
- SUC-006
depends-on:
- 009
- '010'
---

# Snap indicators for node co-location during move and rotate

## Description

Add visual snap feedback and positional snapping (no merge) during
move and rotate operations:

1. Create `editor3d/snapGroup.ts` with `findGroupSnap()`: checks if
   any truss node is within threshold of a non-truss model node.
   Returns the closest snap candidate and offset to co-locate.
2. Create `SnapIndicators.tsx` — renders visual indicators (e.g.,
   highlighted spheres, connection lines) when a snap candidate is
   detected.
3. Integrate into `MoveGizmo`: during drag, run snap detection and
   apply positional offset when within threshold.
4. Integrate into `RotateArc`: during rotation, run snap detection.
5. Nodes are co-located but never merged — they remain separate entities.

## Acceptance Criteria

- [ ] `findGroupSnap()` correctly detects nearby nodes
- [ ] Visual snap indicators appear when a truss node is near a model node
- [ ] Truss position snaps to co-locate nodes when within threshold
- [ ] Snapping works during both move and rotate
- [ ] No nodes are merged — co-located nodes remain separate entities
- [ ] Snap threshold is configurable

## Testing

- **Existing tests to run**: Move and rotate tests from tickets 009/010
- **New tests to write**: `findGroupSnap()` unit tests, threshold edge cases
- **Verification command**: `npm test`
