---
status: draft
---

# Sprint 005 Use Cases

## SUC-005-01: Select Multiple Elements with Drag Selection

- **Actor**: User
- **Preconditions**: Model has nodes and beams in the 3D viewport
- **Main Flow**:
  1. User clicks and drags in the 3D viewport
  2. A selection rectangle appears on screen
  3. All nodes within the rectangle are selected (highlighted)
  4. User releases the mouse button
- **Postconditions**: Selected nodes are in useEditorStore.selectedNodeIds
- **Acceptance Criteria**:
  - [ ] Click-and-drag shows a visible selection rectangle
  - [ ] Nodes inside the rectangle are selected on release
  - [ ] Releasing outside the viewport cancels the selection
  - [ ] Shift-drag adds to existing selection instead of replacing

## SUC-005-02: Modify Selection with Shift-Click

- **Actor**: User
- **Preconditions**: Some nodes are already selected
- **Main Flow**:
  1. User holds Shift and clicks a node
  2. If the node was not selected, it is added to the selection
  3. If the node was already selected, it is removed from the selection
- **Postconditions**: Selection toggled for the clicked node
- **Acceptance Criteria**:
  - [ ] Shift-click on unselected node adds it to selection
  - [ ] Shift-click on selected node removes it from selection
  - [ ] Regular click (no Shift) replaces the entire selection

## SUC-005-03: Create a Group from Selection

- **Actor**: User
- **Preconditions**: One or more nodes are selected
- **Main Flow**:
  1. User clicks the Group button (or presses a keyboard shortcut)
  2. A dialog or prompt asks for a group name
  3. User enters a name and confirms
  4. A Group is created containing the selected nodeIds and any memberIds
     whose both endpoints are in the selection
- **Postconditions**: Group exists in useModelStore.groups
- **Acceptance Criteria**:
  - [ ] Group button is visible when nodes are selected
  - [ ] Created group contains the selected node IDs
  - [ ] Members fully enclosed by the selection are included in the group
  - [ ] Group appears in a groups list (sidebar or panel)

## SUC-005-04: Move a Group in 3D

- **Actor**: User
- **Preconditions**: A group exists and is selected
- **Main Flow**:
  1. User selects a group (click on any member of the group)
  2. All group members highlight
  3. User drags the group
  4. All nodes in the group translate by the drag delta
  5. Beams follow their nodes
- **Postconditions**: All node positions updated in useModelStore
- **Acceptance Criteria**:
  - [ ] Clicking a group member selects the entire group
  - [ ] All group members highlight on selection
  - [ ] Dragging moves all group nodes together
  - [ ] Beams update to follow their moved nodes

## SUC-005-05: Save Drawing to Truss Library

- **Actor**: User
- **Preconditions**: User is in 2D focus mode with nodes and beams drawn
- **Main Flow**:
  1. User clicks "Save to Library" button
  2. A dialog asks for a name
  3. User enters a name and confirms
  4. The current plane's nodes and beams are saved as a Shape2D library entry
  5. The shape appears in the library panel
- **Postconditions**: New Shape2D in useModelStore.shapes
- **Acceptance Criteria**:
  - [ ] Save button is visible in 2D focus mode
  - [ ] Saved shape appears in the library panel
  - [ ] Shape stores 2D coordinates (projected from 3D plane coords)
  - [ ] Shape can be placed into other planes later

## SUC-005-06: Place Library Shape into Plane View

- **Actor**: User
- **Preconditions**: User is in 2D focus mode, library has at least one shape
- **Main Flow**:
  1. User opens the library panel
  2. User selects a shape
  3. The shape appears as a preview on the current plane
  4. User clicks to confirm placement
  5. The shape's 2D coordinates are mapped to the active plane's 3D coords
  6. New nodes and beams are created in useModelStore
  7. A group is automatically created for the placed elements
- **Postconditions**: New nodes, beams, and group exist in useModelStore
- **Acceptance Criteria**:
  - [ ] Library shapes can be selected for placement
  - [ ] Preview shows shape position before confirming
  - [ ] Placed shape creates real 3D nodes and beams
  - [ ] Placed elements are automatically grouped
  - [ ] Shared nodes (near existing nodes) are reused, not duplicated

## SUC-005-07: Use Built-in Truss Templates

- **Actor**: User
- **Preconditions**: User is in 2D focus mode
- **Main Flow**:
  1. User opens the template picker
  2. User selects a template (Pratt, Howe, Warren, or Scissors)
  3. User configures parameters (span, height, panel count)
  4. The template generates a Shape2D
  5. Shape is placed into the current plane view as a group
- **Postconditions**: Template truss placed as nodes, beams, and a group
- **Acceptance Criteria**:
  - [ ] All four templates (Pratt, Howe, Warren, Scissors) are available
  - [ ] Parameters are configurable
  - [ ] Generated geometry places correctly on the active plane
  - [ ] Placed template becomes a group
