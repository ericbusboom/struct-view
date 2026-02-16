---
id: '002'
title: 15-degree snap angle behavior
status: done
use-cases: []
depends-on:
- '001'
---

# 15-degree snap angle behavior

## Description

When rotating a plane, if the normal's angle is within a threshold (~1 degree)
of a 15-degree increment relative to a reference direction, snap to that exact
angle. This makes it easy to hit common angles (15, 30, 45, 60, 75, 90 degrees).

## Acceptance Criteria

- [ ] Plane snaps to 15-degree increments when within threshold
- [ ] Snap threshold is ~1 degree
- [ ] Snap works for all rotation directions
- [ ] Snapping is visually smooth (no jarring jumps outside threshold)

## Testing

- **Existing tests to run**: `npx vitest run`
- **New tests to write**: Unit tests for snap detection and application
- **Verification command**: `npx vitest run`
