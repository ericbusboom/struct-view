---
id: '010'
title: RotateArc widget with 15-degree snaps and arrow key rotation
status: done
use-cases:
- SUC-005
depends-on:
- '007'
- 008
---

# RotateArc widget with 15-degree snaps and arrow key rotation

## Description

Create the `RotateArc` Three.js overlay for rotating selected trusses:

1. Create `editor3d/planeRotate.ts` with `rotateNodesAroundPivot()`:
   rotates a set of positions around a pivot point in a given plane.
2. Create `RotateArc.tsx` — renders a torus arc (partial ring) around
   the truss centroid, oriented in the active plane.
3. On pointer down + drag along the arc: compute angle delta, snap to
   nearest 15-degree increment, rotate all truss nodes.
4. Arrow keys: rotate +/- 15 degrees per press.
5. Add "rotate" to the editor tool modes.

## Acceptance Criteria

- [ ] Rotate tool appears in toolbar when a truss is selected
- [ ] Arc widget renders in the correct plane orientation
- [ ] Dragging along the arc rotates the truss with 15-degree snaps
- [ ] Arrow keys rotate in 15-degree increments
- [ ] All truss nodes and members rotate together
- [ ] Default pivot is the truss centroid

## Testing

- **Existing tests to run**: Editor mode tests
- **New tests to write**: `rotateNodesAroundPivot()` unit tests for all planes,
  angle snap logic
- **Verification command**: `npm test` + manual visual verification
