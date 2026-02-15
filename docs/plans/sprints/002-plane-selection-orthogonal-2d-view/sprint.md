---
id: "002"
title: Plane Selection + Orthogonal 2D View
status: planning
branch: sprint/002-plane-selection-orthogonal-2d-view
use-cases: []
---

# Sprint 002: Plane Selection + Orthogonal 2D View

## Goals

Implement the core plane-based editing paradigm: users can create working planes
from selected points/beams, visualize them in 3D, and toggle into an orthogonal
2D focus view. This is the foundational interaction pattern for all subsequent
drawing work.

After this sprint the user can: press `p` to create a plane through selected
points, see the plane rendered as a translucent grid in 3D, press `f` to snap
into an orthogonal top-down view of the plane, and press `f` again to return to
3D perspective.

## Problem

The new spec requires all 2D drawing to happen on planes selected from 3D space.
The old workflow used a separate modal 2D Canvas editor. The new workflow needs:
- A data model for working planes (normal, point, constraint type, tangent
  vectors)
- A store to manage the active plane
- Keyboard-driven plane creation from selected geometry
- 3D visualization of the active plane
- A camera toggle between 3D perspective and 2D orthogonal focus

## Solution

1. Define a `WorkingPlane` data model with normal vector, anchor point,
   constraint type (point/line/plane), and tangent vectors for rotation.
2. Create `usePlaneStore` to manage the active plane and plane history.
3. Implement `p` key handler that creates a plane from the current selection
   (0, 1, 2, or 3 points; or a beam; or a beam + point).
4. Render the active plane as a translucent grid in the 3D viewport.
5. Implement `f` key toggle that snaps the camera to orthogonal top-down view
   of the active plane, and back to 3D perspective.
6. Render grid overlay and axis labels in 2D focus mode.
7. Write integration tests for plane creation and focus toggle.

## Success Criteria

- User can select 0-3 points and press `p` to create a plane
- Selecting no points creates an XY plane through the origin
- Selecting one point creates an XY plane through that point
- Selecting two points creates a plane through both, oriented to nearest axis
- Selecting three points creates a plane through all three
- Selecting a beam creates a plane through the beam's endpoints ( equivalent to selecting 2 points) and selecting a beam and a point is equivalento to selecting 3 points. 
- The active plane appears as a translucent grid in 3D. The color is yellow in generally, or one of the 3 standard axis colors if it contains axes ( red for XY, blue for YZ and green for XZ )
- Pressing `f` snaps to orthogonal 2D view of the plane
- Pressing `f` again returns to 3D perspective
- Grid overlay and axis labels appear in 2D focus mode

## Scope

### In Scope

- WorkingPlane data model and type definitions
- usePlaneStore (active plane, CRUD)
- Plane creation keyboard handler (`p` key)
- Plane visualization in 3D (translucent grid)
- Camera focus toggle (`f` key)
- 2D focus mode grid overlay and axis labels
- Integration tests

### Out of Scope

- Drawing on planes (Sprint 003)
- Plane rotation with arrow keys (Sprint 004)
- Axis alignment keys (Sprint 004)
- Node visibility across planes (Sprint 004)
- Grouping (Sprint 005)

## Test Strategy

- **Unit tests**: WorkingPlane construction from 0/1/2/3 points, beam, and
  beam+point selections. Normal and tangent vector calculations.
- **Unit tests**: usePlaneStore CRUD operations.
- **Integration tests**: Full workflow: select points, press `p`, verify
  plane created, press `f`, verify camera position, press `f`, verify
  camera returns.
- **Manual verification**: Visual check that plane grid renders correctly and
  camera transition is smooth.

## Architecture Notes

- The WorkingPlane model is purely geometric. It holds: normal (Vec3), point
  (Vec3), constraintType (point|line|plane), constraintPoints (Vec3[]),
  tangentU (Vec3), tangentV (Vec3).
- usePlaneStore is a new Zustand store, separate from useModelStore and
  useEditorStore.
- The `f` key toggle stores the previous camera state (position, rotation,
  projection type) so it can restore on toggle-back.
- The plane grid component is a Three.js mesh (PlaneGeometry with grid shader
  or GridHelper rotated to plane orientation).

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [x] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

1. WorkingPlane data model (normal, point, constraint type, tangent vectors)
2. usePlaneStore (active plane, constraint data, CRUD)
3. Plane creation from selection (`p` key: 0/1/2/3 points, beam, beam+point)
4. Plane visualization in 3D viewport (translucent grid on active plane)
5. `f` key toggle: orthogonal camera snap to plane / back to 3D perspective
6. Plane rendering in 2D focus mode (grid overlay, axis labels)
7. Integration tests for plane creation + focus toggle
