---
status: draft
---

# Sprint 002 Use Cases

## SUC-002-01: Create a Plane from Selected Points

- **Actor**: User
- **Preconditions**: 3D viewport is active, user may have 0-3 nodes selected
- **Main Flow**:
  1. User selects 0, 1, 2, or 3 nodes in the 3D viewport
  2. User presses `p`
  3. A working plane is created through the selected geometry:
     - 0 points: XY plane through origin (point constraint at origin)
     - 1 point: XY plane through that point (point constraint)
     - 2 points: plane through both, oriented to nearest world axis (line
       constraint)
     - 3 points: plane through all three (plane constraint)
  4. The plane appears as a translucent grid in the 3D viewport
- **Postconditions**: Active plane is set in usePlaneStore, plane grid is
  visible in 3D
- **Acceptance Criteria**:
  - [ ] Pressing `p` with no selection creates XY plane at origin
  - [ ] Pressing `p` with 1 node creates XY plane at that node
  - [ ] Pressing `p` with 2 nodes creates a line-constrained plane
  - [ ] Pressing `p` with 3 nodes creates a fully-constrained plane
  - [ ] Plane grid is visible in 3D viewport after creation

## SUC-002-02: Create a Plane from a Beam

- **Actor**: User
- **Preconditions**: 3D viewport is active, user has a beam selected
- **Main Flow**:
  1. User selects a beam in the 3D viewport
  2. User presses `p`
  3. A plane is created through the beam's two endpoint nodes (line constraint)
  4. The plane appears as a translucent grid
- **Postconditions**: Active plane passes through both beam endpoints
- **Acceptance Criteria**:
  - [ ] Pressing `p` with a beam selected creates a line-constrained plane
  - [ ] The plane passes through both endpoint nodes of the beam

## SUC-002-03: Create a Plane from a Beam and a Point

- **Actor**: User
- **Preconditions**: User has a beam and one additional node selected
- **Main Flow**:
  1. User selects a beam and one node
  2. User presses `p`
  3. A plane is created through the beam's two endpoints and the additional
     node (plane constraint, three points total)
- **Postconditions**: Active plane passes through all three points
- **Acceptance Criteria**:
  - [ ] Beam + point selection creates a fully-constrained plane
  - [ ] Plane passes through beam endpoints and the selected node

## SUC-002-04: Toggle Focus Mode

- **Actor**: User
- **Preconditions**: A working plane exists (created via `p`)
- **Main Flow**:
  1. User presses `f`
  2. Camera snaps to orthogonal top-down view of the active plane
  3. Grid overlay and axis labels appear on screen
  4. User presses `f` again
  5. Camera returns to previous 3D perspective position
- **Postconditions**: Camera is back in 3D perspective mode
- **Acceptance Criteria**:
  - [ ] `f` snaps camera to orthogonal view looking down plane normal
  - [ ] Grid overlay is visible in 2D focus mode
  - [ ] Axis labels show the plane's tangent directions
  - [ ] Second `f` press restores the previous 3D camera state
  - [ ] Pressing `f` with no active plane does nothing
