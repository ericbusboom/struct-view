---
status: draft
---

# Sprint 007 (002A) Use Cases

These use cases complete the workflows partially implemented in Sprint 002.

## SUC-004: Place a 2D shape into the 3D scene (completion)
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: At least one shape exists in the shape library with a snap edge designated
- **Main Flow**:
  1. User opens the shape library and clicks "Place" on a shape.
  2. System enters placement mode: 3D viewport shows a crosshair cursor.
  3. User clicks two points in 3D to define the target edge (or clicks an existing member).
  4. System shows a ghost preview of the shape aligned to the target edge.
  5. User adjusts offset along the edge via slider or drag.
  6. User presses Enter or clicks "Confirm" to commit the placement.
  7. System runs placeShape, mergeCoincidentNodes, and adds the result to the model store.
  8. Placed nodes and members appear in the 3D viewport.
- **Alternate Flow (cancel)**:
  6a. User presses Esc — placement is discarded, no model changes.
- **Postconditions**: New nodes and members exist in the model at correct 3D positions. Coincident nodes are merged.
- **Acceptance Criteria**:
  - [ ] "Place" action is accessible from the shape library.
  - [ ] Target edge can be defined by clicking two 3D points or selecting a member.
  - [ ] Ghost preview is visible and updates with offset changes.
  - [ ] Committed placement adds nodes/members to the model store.
  - [ ] Coincident nodes are merged with existing model nodes.

## SUC-005: Place multiple copies at equal spacing (completion)
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: User is in placement mode with a target edge defined
- **Main Flow**:
  1. User enters a copy count (e.g., 5) in the placement panel.
  2. System shows ghost preview of all copies equally spaced along the target edge.
  3. User adjusts count — preview updates.
  4. User confirms — all copies are placed with incremental node merging.
- **Postconditions**: N copies of the shape exist in the model, with shared nodes merged.
- **Acceptance Criteria**:
  - [ ] Count input is visible during placement mode.
  - [ ] Preview shows all copies at correct equal spacing.
  - [ ] Committed placement merges nodes between adjacent copies.
  - [ ] Total node/member counts match expected values (accounting for merges).

## SUC-006: Manage multiple shapes in 2D editor (completion)
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: 2D editor is open
- **Main Flow**:
  1. User opens the shape library panel within the 2D editor.
  2. User clicks "Load" on a saved shape — the canvas replaces current content with that shape.
  3. User edits the shape and clicks "Save" to update it in the library.
  4. User clicks "New" to clear the canvas and start a fresh shape.
  5. User can switch between shapes without losing unsaved work (prompted to save first).
- **Postconditions**: Multiple named shapes exist in the library, each independently editable.
- **Acceptance Criteria**:
  - [ ] "Load" replaces canvas content with the selected shape.
  - [ ] "Save" updates the existing shape in the library.
  - [ ] "New" clears the canvas for a fresh shape.
  - [ ] Unsaved changes prompt before switching.

## SUC-010: Move nodes in 3D viewport
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: At least one node exists in the 3D model
- **Main Flow**:
  1. User activates Move mode (G key or toolbar).
  2. User clicks a node — transform handles appear.
  3. User drags the node to a new position.
  4. Connected members update in real-time.
  5. Node position snaps to grid or existing geometry during drag.
- **Postconditions**: Node is at the new position; connected members updated.
- **Acceptance Criteria**:
  - [ ] Move mode enables drag on selected nodes.
  - [ ] Connected members visually update during drag.
  - [ ] Drag snaps to grid intersections.
  - [ ] Node position is updated in the model store on release.

## SUC-011: 3D snap system for node/beam creation
Parent: UC-001 (Build structural wireframes)

- **Actor**: User
- **Preconditions**: User is creating or moving nodes/beams in 3D
- **Main Flow**:
  1. User is in Add Node, Add Member, or Move mode.
  2. As cursor moves, system highlights the nearest snap target.
  3. Snap priority: existing node > member midpoint > grid intersection.
  4. User clicks — action uses the snapped position.
- **Postconditions**: Created/moved geometry is at a snapped position.
- **Acceptance Criteria**:
  - [ ] Snap indicator visible in 3D viewport.
  - [ ] Snaps to existing nodes within tolerance.
  - [ ] Snaps to member midpoints.
  - [ ] Falls back to grid snap.
