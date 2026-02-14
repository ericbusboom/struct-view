---
status: draft
---

# Sprint 002 Use Cases

## SUC-004: Draw a 2D truss or frame shape
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: StructView app is loaded, 2D editor is accessible
- **Main Flow**:
  1. User opens the 2D drawing canvas.
  2. User clicks to place nodes and draw line segments between them.
  3. Snapping guides assist placement (grid, midpoint, perpendicular, parallel).
  4. User names the shape and saves it to the shape library.
  5. User optionally designates one or more members as snap edges.
- **Postconditions**: Named shape is stored in the project and available for 3D placement.
- **Acceptance Criteria**:
  - [ ] Lines snap to grid intersections, existing nodes, and midpoints.
  - [ ] Perpendicular and parallel alignment guides appear during drawing.
  - [ ] Shape appears in the shape library panel with its name.
  - [ ] Shape persists in project JSON across save/load.

## SUC-005: Use a standard truss template
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: 2D editor is open
- **Main Flow**:
  1. User selects a template (Pratt, Howe, Warren, scissors) from a template menu.
  2. Template loads into the 2D canvas with default dimensions.
  3. User modifies the template (move nodes, add/remove members, resize).
  4. User saves the modified shape under a new name.
- **Postconditions**: Customized template is stored as a named shape.
- **Acceptance Criteria**:
  - [ ] At least 4 truss templates are available.
  - [ ] Template geometry is editable after loading.
  - [ ] Modified template saves as an independent shape.

## SUC-006: Place a 2D shape into the 3D scene
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: At least one named 2D shape exists, 3D viewport is active
- **Main Flow**:
  1. User selects a shape from the library.
  2. User clicks a snap edge on the shape (or uses the pre-designated one).
  3. User drags the shape into the 3D viewport.
  4. The snap edge locks onto compatible geometry (existing beams, edges).
  5. The shape orients perpendicular to the target surface.
  6. User slides the shape along the target edge to position it.
  7. User optionally uses equal-spacing mode to place multiple copies.
  8. On release, shape nodes merge with any coincident existing nodes.
- **Postconditions**: New nodes and members are added to the 3D model.
- **Acceptance Criteria**:
  - [ ] Snap edge aligns with target geometry.
  - [ ] Shape orientation is perpendicular to the snap surface.
  - [ ] Coincident nodes merge within 1mm tolerance.
  - [ ] Equal-spacing placement produces correctly spaced copies.
  - [ ] Placed geometry persists in the model on save.
