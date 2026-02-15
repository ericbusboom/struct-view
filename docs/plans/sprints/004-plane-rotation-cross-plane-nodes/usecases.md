---
status: draft
---

# Sprint 004 Use Cases

## SUC-004-01: Rotate a Plane with Arrow Keys

- **Actor**: User
- **Preconditions**: A point-constrained plane exists and is active
- **Main Flow**:
  1. User taps an arrow key
  2. Plane rotates ~0.1 degrees around the corresponding tangent vector
  3. User holds an arrow key
  4. Rotation accelerates up to ~5 degrees/sec
  5. User releases the key; rotation stops
  6. The plane grid updates to reflect the new orientation
- **Postconditions**: Plane normal and tangent vectors updated in usePlaneStore
- **Acceptance Criteria**:
  - [ ] Single tap rotates ~0.1 degrees
  - [ ] Holding accelerates smoothly to ~5 deg/sec
  - [ ] Left/right arrows rotate around one tangent, up/down around the other
  - [ ] Releasing the key stops rotation immediately
  - [ ] Plane grid visual updates in real time

## SUC-004-02: Snap to 15-Degree Increments

- **Actor**: User
- **Preconditions**: User is rotating a plane with arrow keys
- **Main Flow**:
  1. User rotates the plane with arrow keys
  2. As the angle approaches a 15-degree increment (0, 15, 30, 45, 60, 75, 90),
     the plane snaps to that exact angle
  3. Continuing to hold the key moves past the snap point
- **Postconditions**: Plane is at an exact 15-degree angle
- **Acceptance Criteria**:
  - [ ] Plane snaps to 15-degree boundaries when within threshold
  - [ ] User can continue rotating past the snap point by holding the key
  - [ ] Snap is visually apparent (brief pause or indicator)

## SUC-004-03: Align Plane to World Axis

- **Actor**: User
- **Preconditions**: A constrained plane exists and is active
- **Main Flow**:
  1. User presses `x`, `y`, or `z`
  2. Plane rotates so that the corresponding world axis lies within the plane,
     passing through the constraint point
  3. For example, pressing `x` orients the plane so lines parallel to X can be
     drawn on it
- **Postconditions**: Plane normal is perpendicular to the chosen axis
- **Acceptance Criteria**:
  - [ ] `x` key aligns plane to include the X axis
  - [ ] `y` key aligns plane to include the Y axis
  - [ ] `z` key aligns plane to include the Z axis
  - [ ] Plane still passes through the constraint point
  - [ ] For line constraints, alignment only works if axis is perpendicular to
    the constraining line

## SUC-004-04: Rotate a Line-Constrained Plane

- **Actor**: User
- **Preconditions**: A line-constrained plane exists (created from 2 points or
  a beam)
- **Main Flow**:
  1. User presses up/down arrow keys
  2. Plane rotates around the constraining line
  3. Left/right arrows have no effect
- **Postconditions**: Plane has rotated around its constraint line
- **Acceptance Criteria**:
  - [ ] Up/down arrows rotate around the constraining line
  - [ ] Left/right arrows are no-ops for line constraints
  - [ ] Acceleration and 15-degree snap still apply

## SUC-004-05: See and Connect to Cross-Plane Nodes

- **Actor**: User
- **Preconditions**: Nodes exist from drawing on another plane, user is in 2D
  focus mode on a different plane
- **Main Flow**:
  1. User creates plane A and draws some nodes/beams
  2. User creates plane B at a different angle, overlapping plane A at some
     nodes
  3. User focuses on plane B
  4. Nodes from plane A that are within snap distance of plane B appear in the
     2D view
  5. User draws a beam connecting a plane-B node to a visible plane-A node
- **Postconditions**: A beam connects nodes across two planes, sharing the same
  node (no duplicate)
- **Acceptance Criteria**:
  - [ ] Nodes within snap distance of the active plane appear in 2D view
  - [ ] Cross-plane nodes are visually distinguishable (dimmer or different
    color)
  - [ ] Beams can connect to cross-plane nodes
  - [ ] The shared node is the same object in useModelStore (no duplicate)
