---
id: '003'
title: Grid snap engine (1 inch imperial / 1 cm metric, configurable)
status: done
use-cases:
- SUC-003-01
- SUC-003-02
depends-on: []
---

# Grid snap engine (1 inch imperial / 1 cm metric, configurable)

## Description

Create pure-function utilities for snapping 3D points to a grid aligned with the
active WorkingPlane and for raycasting mouse events onto a plane. Unlike the
existing `snap3d.ts` (which snaps in world-axis-aligned grid), this engine
operates in the plane's local coordinate system (tangentU, tangentV) so the grid
aligns correctly with arbitrarily oriented planes.

### New file: `src/editor3d/planeSnap.ts`

```ts
/** Snap a 3D point to the nearest grid intersection on a WorkingPlane. */
function snapToPlaneGrid(point: Vec3, plane: WorkingPlane, gridSize: number): Vec3

/** Project a 3D world point onto plane-local (u, v) coordinates. */
function worldToPlaneLocal(point: Vec3, plane: WorkingPlane): { u: number; v: number }

/** Convert plane-local (u, v) back to 3D world coordinates. */
function planeLocalToWorld(u: number, v: number, plane: WorkingPlane): Vec3

/** Intersect a Three.js Raycaster with a WorkingPlane. Returns null if
 *  the ray is parallel to the plane. */
function raycastOntoPlane(raycaster: THREE.Raycaster, plane: WorkingPlane): Vec3 | null
```

### Grid size

Default to `gridSize = 1.0` (unitless — matches the integer coordinate system
used throughout the model). True imperial/metric unit support is deferred to a
future sprint (see `docs/plans/todo/unit-display-imperial-metric.md`).

### Implementation notes

- `snapToPlaneGrid`: project point onto plane, decompose into (u, v) along
  tangentU/tangentV, round each to nearest gridSize, convert back to 3D.
- `raycastOntoPlane`: construct a `THREE.Plane` from `plane.normal` and
  `plane.point`, call `raycaster.ray.intersectPlane()`.
- These utilities are used by Tickets 001, 002, and 004.

## Acceptance Criteria

- [ ] `snapToPlaneGrid` rounds a point to nearest grid intersection in plane-local coords
- [ ] `worldToPlaneLocal` and `planeLocalToWorld` are inverse operations (round-trip preserves point)
- [ ] `raycastOntoPlane` returns correct intersection for non-parallel rays
- [ ] `raycastOntoPlane` returns null when ray is parallel to plane
- [ ] Works correctly for XY, XZ, YZ, and arbitrarily tilted planes
- [ ] Grid size is a parameter, not hardcoded

## Testing

- **Existing tests to run**: `npx vitest run` (all tests, verify no regressions)
- **New tests to write**: `src/editor3d/__tests__/planeSnap.test.ts`
  - snapToPlaneGrid on XY plane at origin with gridSize=1.0
  - snapToPlaneGrid on tilted plane
  - worldToPlaneLocal / planeLocalToWorld round-trip
  - raycastOntoPlane intersection correctness
  - raycastOntoPlane parallel ray returns null
- **Verification command**: `npx vitest run src/editor3d/__tests__/planeSnap.test.ts`
