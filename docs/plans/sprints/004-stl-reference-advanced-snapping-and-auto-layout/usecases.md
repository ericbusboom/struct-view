---
status: draft
---

# Sprint 004 Use Cases

## SUC-007: Import and display an STL reference shape
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: StructView app is loaded with an active project
- **Main Flow**:
  1. User clicks "Import STL" and selects a file.
  2. System parses the STL, extracts vertices/edges, builds spatial index.
  3. System computes the axis-aligned bounding box (AABB) and displays X/Y/Z extents in project display units.
  4. User verifies dimensions. If incorrect, user edits any single dimension to its known real-world value; system computes a uniform scale factor and applies it to all axes.
  5. STL renders as a semi-transparent shell in the 3D viewport at the corrected scale.
  6. User can toggle STL visibility and adjust transparency.
- **Alternate Flow (non-uniform scale)**:
  4a. User edits more than one dimension — system warns that this distorts geometry, applies non-uniform scale if confirmed.
- **Postconditions**: STL is displayed at correct real-world scale and available as snap target. Scale factor is stored in the project.
- **Acceptance Criteria**:
  - [ ] STL renders without blocking the UI (web worker processing).
  - [ ] Files exceeding 100k triangles are rejected with a clear message.
  - [ ] Both binary and ASCII STL formats are supported.
  - [ ] AABB dimensions are displayed immediately after import.
  - [ ] User can correct scale by editing a single known dimension.
  - [ ] Scale factor is stored in the project and applied on reload.
  - [ ] STL reference persists across save/load.

## SUC-008: Draw beams snapping to STL reference geometry
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: An STL reference shape is loaded
- **Main Flow**:
  1. User activates 3D beam drawing mode.
  2. User clicks a start point — cursor snaps to nearest STL vertex, edge, or face.
  3. User clicks an end point with the same snapping behavior.
  4. A beam is created between the two snapped points.
  5. Snap targets include both STL geometry and existing model nodes/members.
- **Postconditions**: New beam exists in the model at snapped coordinates.
- **Acceptance Criteria**:
  - [ ] Snap indicators show which STL feature is targeted (vertex, edge, face).
  - [ ] Snapping prioritizes: vertex > edge > face > grid.
  - [ ] Snap queries complete in < 16ms for meshes up to 100k triangles.
  - [ ] Created beams reference correct snapped coordinates.

## SUC-009: Auto-layout beams on an STL face
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: An STL reference shape is loaded
- **Main Flow**:
  1. User selects a face or set of coplanar faces on the STL.
  2. User chooses a layout pattern (studs or joists).
  3. User specifies spacing (e.g., 16 inches).
  4. System identifies the bounding rectangle of the selected face.
  5. System generates parallel beams at the specified spacing.
  6. System adds perimeter beams along face edges.
  7. Preview is shown before committing.
- **Postconditions**: Generated beams appear in the model.
- **Acceptance Criteria**:
  - [ ] Generated beams are correctly spaced within the face boundary.
  - [ ] Perimeter beams follow face edges.
  - [ ] Generated nodes merge with coincident existing nodes.
  - [ ] Layout preview is shown before committing.
  - [ ] Generated geometry persists on save.
