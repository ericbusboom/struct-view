---
status: draft
---

# Sprint 006 Use Cases

## SUC-006-01: Create Nodes via Coordinate Entry

- **Actor**: User
- **Preconditions**: App is running, no node is selected (entry mode)
- **Main Flow**:
  1. User clicks into the x field of the coordinate entry box in the sidebar
  2. User types x, y, z values (tabbing between fields)
  3. User presses Return
  4. A node is created at the entered coordinates
  5. The entry fields clear, ready for the next node
  6. User can immediately type the next set of coordinates
- **Postconditions**: New node exists in useModelStore at the entered position
- **Acceptance Criteria**:
  - [ ] x, y, z fields are visible in the sidebar
  - [ ] Return creates a node at the entered coordinates
  - [ ] Fields clear after creation
  - [ ] Tab moves between x, y, z fields
  - [ ] Node appears in 3D viewport immediately

## SUC-006-02: Edit Node Position via Coordinate Entry

- **Actor**: User
- **Preconditions**: A node is selected (edit mode)
- **Main Flow**:
  1. User clicks a node in 3D or 2D view
  2. Coordinate entry box populates with the node's x, y, z values
  3. User edits a value directly (types a new number)
  4. Node position updates in real time
  5. User presses Escape or clicks away to deselect
  6. Entry box clears
- **Postconditions**: Node position updated in useModelStore
- **Acceptance Criteria**:
  - [ ] Selecting a node fills the entry box with current coordinates
  - [ ] Editing a field updates the node position
  - [ ] Escape or deselect clears the entry box
  - [ ] Visual feedback in viewport is immediate

## SUC-006-03: Apply Relative Adjustments

- **Actor**: User
- **Preconditions**: A node is selected, entry box shows its coordinates
- **Main Flow**:
  1. User clicks into the x field (currently showing e.g., "5.0")
  2. User types "+2.5"
  3. The x coordinate becomes 7.5
  4. The entry field now shows "7.5" (absolute value replaces expression)
- **Postconditions**: Node x coordinate increased by 2.5
- **Acceptance Criteria**:
  - [ ] Typing `+N` adds N to the current value
  - [ ] Typing `-N` subtracts N from the current value
  - [ ] The result replaces the expression in the field
  - [ ] Works for all three axes (x, y, z)
  - [ ] Non-numeric input is rejected gracefully

## SUC-006-04: Import Nodes from CSV File

- **Actor**: User
- **Preconditions**: User has a CSV file with node coordinates
- **Main Flow**:
  1. User clicks "Import" button in the sidebar
  2. File picker opens
  3. User selects a CSV file
  4. Parser reads the file:
     - If first row contains "x", "y", "z" headers, use them
     - If no header, assume columns are x, y, z in order
  5. Each valid row creates a node
  6. Malformed rows are skipped with a warning count
  7. All imported nodes appear in the 3D viewport
- **Postconditions**: New nodes exist in useModelStore
- **Acceptance Criteria**:
  - [ ] CSV with header row imports correctly
  - [ ] CSV without header row imports correctly (assumes x, y, z order)
  - [ ] Malformed rows are skipped, not fatal
  - [ ] User sees a summary (N nodes imported, M rows skipped)
  - [ ] Imported nodes render in 3D viewport

## SUC-006-05: Import Nodes from Text File

- **Actor**: User
- **Preconditions**: User has a text file with space or comma-separated
  coordinates
- **Main Flow**:
  1. User clicks "Import" button
  2. User selects a text file
  3. Parser reads line by line:
     - Split each line by commas or whitespace
     - Parse three numbers as x, y, z
     - Skip blank lines and malformed lines
  4. Nodes are created for each valid line
- **Postconditions**: New nodes exist in useModelStore
- **Acceptance Criteria**:
  - [ ] Space-separated values import correctly
  - [ ] Comma-separated values import correctly
  - [ ] Blank lines and comments are skipped
  - [ ] User sees import summary
