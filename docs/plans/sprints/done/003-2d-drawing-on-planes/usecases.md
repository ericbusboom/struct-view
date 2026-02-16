---
status: draft
---

# Sprint 003 Use Cases

## SUC-003-01: Place Nodes on a Plane

- **Actor**: User
- **Preconditions**: A plane exists, user is in 2D focus mode
- **Main Flow**:
  1. User presses `n` to activate node placement mode
  2. User clicks on the 2D view
  3. Mouse position is raycasted onto the plane and snapped to grid
  4. A node is created at the snapped position with full 3D coordinates
  5. User can click again to place more nodes
- **Postconditions**: New nodes exist in useModelStore at the clicked positions
- **Acceptance Criteria**:
  - [ ] `n` key activates node placement mode
  - [ ] Click on 2D view creates a node on the active plane
  - [ ] Node position snaps to grid (1" imperial / 1cm metric)
  - [ ] Node appears as a sphere in both 2D and 3D views
  - [ ] Multiple clicks create multiple nodes

## SUC-003-02: Draw Beams Between Nodes

- **Actor**: User
- **Preconditions**: User is in 2D focus mode with at least 1 existing node
- **Main Flow**:
  1. User presses `b` to activate beam placement mode
  2. User clicks to set the start node (existing node or new placement)
  3. A preview line follows the cursor from the start node
  4. User clicks to set the end node
  5. A beam is created connecting start and end nodes
- **Postconditions**: A new member exists in useModelStore
- **Acceptance Criteria**:
  - [ ] `b` key activates beam placement mode
  - [ ] First click sets start node (or creates one)
  - [ ] Preview line shows from start to cursor
  - [ ] Second click creates the beam
  - [ ] If cursor is near an existing node, that node is reused

## SUC-003-03: Snap to Existing Nodes

- **Actor**: User
- **Preconditions**: Nodes exist on the plane, user is placing nodes or beams
- **Main Flow**:
  1. User moves cursor near an existing node
  2. The node highlights (color change or glow)
  3. User clicks; the existing node is reused instead of creating a duplicate
- **Postconditions**: No duplicate node created; existing node referenced
- **Acceptance Criteria**:
  - [ ] Nodes within snap distance highlight when cursor approaches
  - [ ] Clicking on a highlighted node reuses it
  - [ ] No duplicate nodes created at the same position

## SUC-003-04: View and Edit Node Coordinates

- **Actor**: User
- **Preconditions**: User has selected a node (click in 2D or 3D)
- **Main Flow**:
  1. User selects a node
  2. Sidebar shows x, y, z world coordinates
  3. User edits a coordinate field (types a new value or +/- adjustment)
  4. Node position updates in real time
  5. User deselects; sidebar clears
- **Postconditions**: Node position updated in useModelStore
- **Acceptance Criteria**:
  - [ ] Selecting a node populates sidebar with x, y, z values
  - [ ] Editing a value directly updates the node position
  - [ ] Typing `+5` adds 5 to the current value
  - [ ] Typing `-2.5` subtracts 2.5 from the current value
  - [ ] Deselecting or pressing Escape clears the sidebar
