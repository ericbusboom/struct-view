---
status: draft
---

# Sprint 006 Use Cases

## SUC-006-01: Edit Node Coordinates in Properties Panel

- **Actor**: User
- **Preconditions**: A single node is selected
- **Main Flow**:
  1. User clicks the X coordinate field in the sidebar
  2. The field's entire value is selected/highlighted
  3. User types a new number and presses Return
  4. The node moves to the new X position; focus advances to Y field
  5. User types Y value, Return, Z value, Return
- **Postconditions**: Node position updated in useModelStore
- **Acceptance Criteria**:
  - [ ] Click selects entire field contents
  - [ ] Return accepts value and advances to next field
  - [ ] Tab also accepts and advances
  - [ ] Invalid input is rejected gracefully

## SUC-006-02: Make Relative Coordinate Adjustment

- **Actor**: User
- **Preconditions**: A node is selected and a coordinate field is focused
- **Main Flow**:
  1. User clicks the X field (value "12.5" is highlighted)
  2. User presses left arrow (cursor moves to end, "12.5" un-highlighted)
  3. User types "+3"
  4. User presses Return
  5. Field evaluates "12.5+3" → "15.5" and updates the node
- **Postconditions**: Node X position is now 15.5
- **Acceptance Criteria**:
  - [ ] Left arrow moves cursor to end without deleting
  - [ ] `+` and `-` expressions are evaluated on accept
  - [ ] Works in sidebar fields and dimension overlay

## SUC-006-03: Configure Project Settings

- **Actor**: User
- **Preconditions**: App is loaded
- **Main Flow**:
  1. User clicks the gear icon
  2. Settings panel appears with unit system, snap grid size, grid line spacing,
     and work plane size
  3. User toggles to imperial units and sets snap to 1 ft
  4. Grid and snap behavior update immediately
  5. User closes the panel
- **Postconditions**: Settings persisted to localStorage
- **Acceptance Criteria**:
  - [ ] Gear icon opens settings panel
  - [ ] All four settings are editable
  - [ ] Changes take effect immediately
  - [ ] Settings persist across page reloads

## SUC-006-04: Drag a Node Without Drift

- **Actor**: User
- **Preconditions**: A node exists on a work plane
- **Main Flow**:
  1. User clicks and drags a node
  2. The node follows the mouse cursor exactly on the work plane
  3. User releases — node stays where the cursor was
- **Postconditions**: Node position matches cursor projection
- **Acceptance Criteria**:
  - [ ] No drift between cursor and node during drag
  - [ ] Works on ground plane and custom work planes
  - [ ] No jump at drag start

## SUC-006-05: Select and Move in One Mode

- **Actor**: User
- **Preconditions**: Nodes and beams exist in the viewport
- **Main Flow**:
  1. User clicks a node to select it
  2. User drags the selected node — it moves
  3. User clicks empty space — selection clears
  4. User click-drags a rectangle — nodes inside are selected
- **Postconditions**: No separate "move mode" needed
- **Acceptance Criteria**:
  - [ ] Single click selects
  - [ ] Dragging a selected entity moves it
  - [ ] No "move" mode in toolbar
  - [ ] Rectangle drag-select still works

## SUC-006-06: Place a Node with N Key

- **Actor**: User
- **Preconditions**: Active work plane or ground plane visible
- **Main Flow**:
  1. User hovers the cursor over the viewport
  2. User presses N
  3. A node is created at the cursor position (snapped to grid)
  4. The new node is automatically selected
- **Postconditions**: New node in useModelStore, selected in useEditorStore
- **Acceptance Criteria**:
  - [ ] N key creates node at cursor position
  - [ ] No mode switch required
  - [ ] Snaps to grid when enabled
  - [ ] Does nothing if cursor is over a text input

## SUC-006-07: Orbit the Camera (Turntable)

- **Actor**: User
- **Preconditions**: 3D viewport is visible
- **Main Flow**:
  1. User right-click drags left/right — camera orbits around Z axis
  2. User right-click drags up/down — camera tilts (elevation changes)
  3. The horizon stays level throughout
  4. User Shift + right-click drags — camera pans
  5. User scrolls — camera zooms toward cursor
- **Postconditions**: Camera position/orientation updated
- **Acceptance Criteria**:
  - [ ] Z axis always points up
  - [ ] Horizon never tilts
  - [ ] Pan and zoom work as expected
  - [ ] No stuck orientations

## SUC-006-08: Navigate with ViewCube

- **Actor**: User
- **Preconditions**: ViewCube is visible in viewport corner
- **Main Flow**:
  1. User clicks "Top" face on the ViewCube
  2. Camera animates to look straight down the Z axis
  3. Axis arrows show X right, Y forward, Z up
- **Postconditions**: Camera matches the clicked face orientation
- **Acceptance Criteria**:
  - [ ] Face labels match Z-up convention
  - [ ] Camera animates to correct orientation with correct up vector
  - [ ] ViewCube stays in sync with orbit controls

## SUC-006-09: Quick-Beam with B+Click

- **Actor**: User
- **Preconditions**: Exactly one node is selected
- **Main Flow**:
  1. User holds B key
  2. User clicks another node
  3. A beam is created between the selected node and the clicked node
  4. The clicked node becomes the new selection
  5. User (still holding B) clicks a third node — another beam is created
- **Postconditions**: Beams created in useModelStore, selection advanced
- **Acceptance Criteria**:
  - [ ] B+click creates beam between selected and clicked node
  - [ ] Selection advances for chaining
  - [ ] Does nothing with zero or multiple selected nodes

## SUC-006-10: Duplicate Selection with Offset

- **Actor**: User
- **Preconditions**: One or more nodes/beams are selected
- **Main Flow**:
  1. User activates "Duplicate" action
  2. Dialog appears with X, Y, Z offset fields
  3. User enters Z = 8 and confirms
  4. Selected items are duplicated 8 units up the Z axis
  5. Duplicated items become the new selection
- **Postconditions**: New nodes/beams/groups in useModelStore
- **Acceptance Criteria**:
  - [ ] Dialog shows X, Y, Z offset inputs
  - [ ] Nodes are duplicated at the offset position
  - [ ] Beams with both endpoints selected are also duplicated
  - [ ] Groups are duplicated as new groups
  - [ ] Duplicated items are selected after creation

## SUC-006-11: View Dimensions Overlay

- **Actor**: User
- **Preconditions**: Model has nodes and beams
- **Main Flow**:
  1. User toggles the dimension overlay on
  2. Each beam shows its length near its center
  3. Each node shows its (x, y, z) position
  4. User clicks a node position label
  5. The label becomes an editable text field
  6. User edits the value and presses Return
  7. The node moves to the new position
- **Postconditions**: Annotations visible; edits update model
- **Acceptance Criteria**:
  - [ ] Toggle enables/disables overlay
  - [ ] Beam lengths displayed at beam centers
  - [ ] Node positions displayed as (x, y, z) triplets
  - [ ] Labels face the camera (billboard)
  - [ ] Clicking a label makes it editable
