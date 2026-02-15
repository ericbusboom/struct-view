---
id: 009
title: MoveGizmo for plane-constrained truss dragging with arrow key nudge
status: done
use-cases:
- SUC-004
depends-on:
- '007'
- 008
---

# MoveGizmo for plane-constrained truss dragging with arrow key nudge

## Description

Create the `MoveGizmo` Three.js overlay for moving selected trusses:

1. When a truss is selected and the move tool is active, render a
   translucent plane quad at the truss centroid oriented to the
   active plane.
2. On pointer down + drag: raycast against the constraint plane,
   compute delta from drag start, translate all truss nodes by delta.
3. Arrow keys: nudge the truss by a configurable step size along the
   two axes of the selected plane.
4. Add "move" to the editor tool modes.
5. During drag, integrate snap detection (ticket 012) if available,
   otherwise just free movement for now.

## Acceptance Criteria

- [ ] Move tool appears in toolbar when a truss is selected
- [ ] Dragging moves the truss constrained to the active plane
- [ ] Arrow keys nudge the truss in discrete steps
- [ ] All truss nodes and members move together
- [ ] Movement is smooth and responsive

## Testing

- **Existing tests to run**: Editor mode tests
- **New tests to write**: Move delta computation, arrow key nudge logic
- **Verification command**: `npm test` + manual visual verification
