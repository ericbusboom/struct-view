---
id: '004'
title: Plane Rotation + Cross-Plane Nodes
status: done
branch: sprint/004-plane-rotation-cross-plane-nodes
use-cases: []
---

# Sprint 004: Plane Rotation + Cross-Plane Nodes

## Goals

Give users full control over plane orientation and enable multi-plane workflows.
After this sprint the user can rotate planes with arrow keys (with acceleration
and 15-degree snap), align planes to world axes with x/y/z keys, and share
nodes across planes (nodes near a plane appear in its 2D view).

This sprint makes the plane-based workflow powerful enough to build real 3D
structures by working across multiple oriented planes.

## Problem

Sprints 002-003 only create axis-aligned planes. Real structures need planes at
arbitrary angles (roof slopes, angled braces, etc.). Users also need to connect
geometry across planes (e.g., a wall plane meeting a roof plane at a shared
ridge beam). This requires:
- Arrow key rotation with acceleration for fine and coarse adjustment
- 15-degree snap for common angles
- Gimbal-lock-free tangent vector tracking
- x/y/z keys for quick axis alignment
- Line constraint rotation (restricted to single axis)
- Cross-plane node visibility and sharing

## Solution

1. Arrow key rotation: tap for ~0.1 degree, hold for acceleration up to ~5
   degrees/sec. Rotation happens around the plane's tangent vectors (point
   constraint) or the constraining line (line constraint).
2. 15-degree snap: when the plane angle is within a threshold of a 15-degree
   increment, snap to it.
3. Tangent vector tracking: after each rotation, update tangentU and tangentV
   incrementally from the current orientation to avoid gimbal lock.
4. x/y/z keys: orient the plane so the corresponding world axis lies within
   the plane, passing through the constraint point.
5. Line constraint: only up/down arrows work, rotating around the line.
6. Node visibility: in 2D focus mode, show all nodes within snap distance of
   the plane surface, not just nodes created on that plane.
7. Cross-plane node sharing: when drawing beams in 2D, existing nodes from
   other planes that appear in the view can be used as endpoints.
8. Integration tests for rotation and cross-plane connections.

## Success Criteria

- Arrow keys rotate point-constrained planes smoothly with acceleration
- Holding an arrow key accelerates from ~0.1 deg to ~5 deg/sec
- Plane snaps to 15-degree increments when near a snap angle
- Pressing x/y/z aligns the plane to the corresponding axis
- Line-constrained planes only rotate around the constraining line
- Fully-constrained planes (3 points) have no rotation controls
- Nodes from other planes appear in 2D view when within snap distance
- Beams can connect to cross-plane nodes in 2D focus mode

## Scope

### In Scope

- Arrow key rotation with acceleration
- 15-degree snap angle behavior
- Tangent vector tracking (gimbal-lock-free)
- x/y/z axis alignment keys
- Line constraint rotation restrictions
- Node visibility across planes
- Cross-plane node sharing in beam placement
- Integration tests

### Out of Scope

- Grouping (Sprint 005)
- Truss library (Sprint 005)
- Coordinate entry sidebar improvements (Sprint 006)
- Data file import (Sprint 006)

## Test Strategy

- **Unit tests**: Rotation math (apply rotation to normal, update tangent
  vectors), snap angle detection, axis alignment calculation
- **Unit tests**: Node-near-plane detection (point-to-plane distance)
- **Integration tests**: Create two planes at different angles, draw on each,
  verify shared node at intersection
- **Integration tests**: Rotate a plane with arrow keys, verify angle changes,
  verify snap at 15-degree boundaries
- **Manual verification**: Visual check of smooth rotation, snap behavior,
  cross-plane node highlighting

## Architecture Notes

- Rotation is applied as incremental quaternion multiplication on the plane's
  normal vector. The tangent vectors are re-derived after each rotation step
  using the previous tangent vectors as a reference (not from scratch), which
  prevents discontinuous jumps.
- Acceleration uses a timer: keydown starts at ~0.1 deg/tick, keyup resets.
  While held, the step size increases linearly toward ~5 deg/sec over ~1 second.
- The snap check compares the plane normal's angle to the nearest 15-degree
  reference direction and snaps if within a threshold (e.g., 1 degree).
- Cross-plane node visibility: a utility function
  `getNodesNearPlane(nodes, plane, snapDistance)` filters useModelStore nodes
  by point-to-plane distance. This runs whenever the plane changes or nodes
  change.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [x] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

1. Arrow key rotation with acceleration (0.1 deg tap to 5 deg/sec hold)
2. 15-degree snap angle behavior
3. Tangent vector tracking (gimbal-lock-free incremental updates)
4. x/y/z axis alignment keys for plane orientation
5. Line constraint rotation (up/down arrow only, around constraining line)
6. Node visibility across planes (nodes within snap distance appear in 2D view)
7. Cross-plane node sharing (connect beams to nodes from other planes)
8. Integration tests for rotation + cross-plane connections
9. Grid pattern alignment on angled planes (align grid to constraint points/lines)
10. Wider beam/member selection hitbox (at least 2x raycaster threshold)
