---
id: '001'
title: Arrow key rotation with acceleration (0.1 deg tap to 5 deg/sec hold)
status: done
use-cases: []
depends-on: []
---

# Arrow key rotation with acceleration

## Description

When the user has an active WorkingPlane (via P key) and no group is selected,
arrow keys rotate the plane's orientation. A single tap rotates ~0.1 degrees.
Holding a key accelerates from 0.1 to ~5 deg/sec over ~1 second.

Rotation axes depend on constraint type:
- **Point-constrained**: left/right rotates around tangentV, up/down around tangentU
- **Line-constrained**: only up/down arrows work, rotating around the constraint line
- **Fully-constrained (3 points)**: no rotation (arrow keys do nothing)

When no active plane exists, arrow keys keep their existing behavior (nudge/rotate
selected groups).

## Acceptance Criteria

- [ ] Arrow keys rotate point-constrained planes around tangent axes
- [ ] Single tap produces ~0.1 degree rotation
- [ ] Holding a key accelerates from 0.1 to ~5 deg/sec
- [ ] Releasing the key stops rotation immediately
- [ ] Existing arrow key behavior (group nudge/rotate) unchanged when a group is selected
- [ ] Fully-constrained planes ignore arrow key rotation

## Testing

- **Existing tests to run**: `npx vitest run` (all 243 tests)
- **New tests to write**: Unit tests for `rotatePlane()`, `rodriguesRotate()`, and
  acceleration curve computation
- **Verification command**: `npx vitest run`
