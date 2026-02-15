---
status: draft
---

# Sprint 003 Use Cases

## SUC-001: Create a Truss via Pop-up Editor
Parent: UC-002 (2D Drawing + 2D-to-3D Placement)

- **Actor**: User
- **Preconditions**: Main 3D viewport is visible
- **Main Flow**:
  1. User clicks the "Add a Truss" button in the toolbar.
  2. A pop-up modal opens over the viewport (not full-screen).
  3. The editor canvas shows a grid with the origin in the lower-left
     region; approximately 10% of the negative X and Y axes are visible.
  4. X increases to the right; Y increases upward.
  5. User draws nodes and members to define the truss geometry.
  6. User optionally selects a snap edge.
  7. User clicks Save; the pop-up closes.
- **Postconditions**: The truss appears as a thumbnail card in the
  right-side truss library panel.
- **Acceptance Criteria**:
  - [ ] Pop-up does not cover the entire screen
  - [ ] Origin is positioned in the lower-left with ~10% negative axis visible
  - [ ] Drawing orientation: +X right, +Y up
  - [ ] Save closes the pop-up and adds the truss to the library

## SUC-002: Browse and Manage Truss Library
Parent: UC-002

- **Actor**: User
- **Preconditions**: At least one truss has been saved
- **Main Flow**:
  1. The right-side panel displays thumbnail cards for all saved trusses.
  2. Each card shows a small rendered preview of the truss geometry.
  3. User can click "Edit" on a card to re-open the truss in the pop-up editor.
  4. User can click "Add to 3D" to start the placement workflow.
  5. As more trusses are created, cards stack vertically (scrollable).
- **Postconditions**: Library reflects all user-created trusses with
  correct thumbnails.
- **Acceptance Criteria**:
  - [ ] Truss cards appear on the right side of the viewport
  - [ ] Each card shows a recognizable thumbnail of the truss shape
  - [ ] Edit button re-opens the truss in the pop-up editor
  - [ ] Add-to-3D button initiates the placement workflow
  - [ ] Panel scrolls when many trusses are present

## SUC-003: Select Placement Plane for a Truss
Parent: UC-002

- **Actor**: User
- **Preconditions**: User is in the truss editor (creating or editing)
- **Main Flow**:
  1. The truss editor displays a plane selector (XZ, XY, YZ).
  2. Default selection is X-Z (the flat "elevation" view).
  3. User can switch to X-Y or Y-Z before saving.
  4. The selected plane is stored with the truss.
  5. When placed into 3D, the truss geometry is oriented in the
     selected plane.
- **Postconditions**: The truss carries its intended placement plane.
- **Acceptance Criteria**:
  - [ ] Plane selector visible in the truss editor
  - [ ] Default is X-Z
  - [ ] Changing the plane is reflected when the truss is placed in 3D
  - [ ] Plane selection persists with the saved truss

## SUC-004: Move a Placed Truss in a Plane
Parent: UC-002

- **Actor**: User
- **Preconditions**: A truss has been placed in the 3D scene
- **Main Flow**:
  1. User selects the placed truss in the 3D viewport.
  2. User activates the move tool.
  3. User selects the constraint plane (XY, XZ, or YZ) via the
     plane selector tool (3-button toggle).
  4. User clicks and drags the truss; it moves only within the
     selected plane.
  5. Alternatively, user presses arrow keys to nudge the truss
     in discrete steps within the selected plane.
  6. During movement, nodes that come close to existing model nodes
     display a snap indicator.
  7. On release, if a snap was active, the truss snaps into position.
- **Postconditions**: The truss (all its nodes and members) has moved
  to the new position. Snapped nodes are co-located but remain separate
  entities (no merge).
- **Acceptance Criteria**:
  - [ ] Movement is constrained to the selected plane
  - [ ] Mouse drag moves the truss smoothly in the plane
  - [ ] Arrow keys nudge the truss in grid increments
  - [ ] Node-to-node snap indicators appear when close
  - [ ] Snap co-locates nodes without merging them

## SUC-005: Rotate a Placed Truss in a Plane
Parent: UC-002

- **Actor**: User
- **Preconditions**: A truss has been placed in the 3D scene
- **Main Flow**:
  1. User selects the placed truss.
  2. User selects the constraint plane via the plane selector.
  3. User activates the rotate tool.
  4. An on-screen arc widget appears around the truss, oriented in
     the selected plane.
  5. User clicks and drags along the arc to rotate the truss.
  6. Rotation snaps at 15-degree increments.
  7. Alternatively, user presses arrow keys to rotate in positive or
     negative direction in 15-degree steps.
  8. Node-to-node snapping is active during rotation.
- **Postconditions**: The truss has rotated to the new angle. Snapped
  nodes are co-located but remain separate entities (no merge).
- **Acceptance Criteria**:
  - [ ] On-screen arc widget visible in the correct plane
  - [ ] Drag rotates the truss smoothly with 15-degree snaps
  - [ ] Arrow keys rotate in 15-degree increments
  - [ ] Node snapping works during rotation
  - [ ] All nodes and members of the truss rotate together

## SUC-006: Rotate a Truss Around a Specific Node
Parent: UC-002

- **Actor**: User
- **Preconditions**: A truss is selected and the rotate tool is active
- **Main Flow**:
  1. User activates the "rotate around node" mode (e.g., via a
     toolbar toggle or modifier key).
  2. User clicks a specific node in the truss (or in the model).
  3. The rotation pivot moves to that node's position.
  4. The arc widget repositions around the new pivot.
  5. User rotates as in SUC-005, but around the selected node.
- **Postconditions**: The truss has rotated around the chosen node.
- **Acceptance Criteria**:
  - [ ] User can designate any node as the rotation pivot
  - [ ] Arc widget moves to the selected node
  - [ ] Rotation occurs around the selected pivot, not the truss center
  - [ ] Node snapping still works during rotation
