---
status: draft
---

# Sprint 005 Use Cases

## SUC-010: Assign material and section to members
Parent: UC-002 (Define member material/section)

- **Actor**: User
- **Preconditions**: Model contains members
- **Main Flow**:
  1. User selects one or more members in the viewport.
  2. User opens the properties panel.
  3. User picks a material from the database (or defines custom with E, G, density, yield strength).
  4. User picks a section from the database (or defines custom with A, Ix, Iy, Sx, Sy, J).
  5. Properties are applied to all selected members.
- **Postconditions**: Members have material and section data.
- **Acceptance Criteria**:
  - [ ] Database includes common steel, lumber, and aluminum entries.
  - [ ] Custom material/section entries validate positive values.
  - [ ] Multi-select assignment applies to all selected members.
  - [ ] Properties display in the panel and persist on save.

## SUC-011: Set support and connection types on nodes
Parent: UC-002 (Define member material/section)

- **Actor**: User
- **Preconditions**: Model contains nodes
- **Main Flow**:
  1. User selects a node.
  2. User sets support type (free, fixed, pinned, roller_x/y/z, spring).
  3. For spring supports, user enters stiffness per DOF.
  4. User sets connection type (rigid, pinned, semi-rigid with stiffness).
  5. User optionally sets connection method metadata (welded, bolted, etc.).
- **Postconditions**: Node has support and connection properties.
- **Acceptance Criteria**:
  - [ ] Visual indicators in viewport distinguish support types.
  - [ ] Spring stiffness accepts per-DOF values.
  - [ ] Connection type correctly maps to member end releases.
  - [ ] Settings persist on save.

## SUC-012: Create panels from beams
Parent: UC-003 (Create panels from closed loops)

- **Actor**: User
- **Preconditions**: Model contains beams forming closed boundaries
- **Main Flow (Closed Loop)**:
  1. User activates the closed-loop tool.
  2. User clicks nodes to define the boundary (minimum 3).
  3. User closes the loop (click first node or press Enter).
  4. System checks coplanarity; warns if not coplanar.
  5. Panel is created.
- **Main Flow (Select-and-Sheet)**:
  1. User selects beams forming a closed boundary.
  2. User chooses "Create Panel" from context menu.
  3. System identifies outer boundary, creates panel.
- **Postconditions**: Panel exists in the model.
- **Acceptance Criteria**:
  - [ ] Non-coplanar node sets produce a warning and are rejected.
  - [ ] Panel renders as a shaded surface between boundary nodes.
  - [ ] Panel properties (material, thickness, side) are configurable.

## SUC-013: Apply loads to the model
Parent: UC-004 (Apply loads with load cases/combinations)

- **Actor**: User
- **Preconditions**: Model contains members and/or panels
- **Main Flow**:
  1. User selects a member or panel.
  2. User chooses load type (point, distributed, area).
  3. User specifies magnitude, direction (gravity/lateral/uplift/custom vector), position.
  4. User assigns the load to a load case.
  5. Load is applied and visualized.
- **Postconditions**: Load exists on the target entity in the specified case.
- **Acceptance Criteria**:
  - [ ] Point loads render as arrows at the specified position.
  - [ ] Distributed loads render as arrow arrays along the member.
  - [ ] Area loads render on panel surfaces.
  - [ ] Self-weight toggle applies gravity from density, section area, and length.

## SUC-014: Manage load cases and combinations
Parent: UC-004 (Apply loads with load cases/combinations)

- **Actor**: User
- **Preconditions**: At least one load exists
- **Main Flow**:
  1. User opens load case manager.
  2. User creates named cases (Dead, Live, Snow, Wind, etc.).
  3. User assigns loads to cases.
  4. User creates combinations with factors (e.g., 1.2D + 1.6L).
- **Postconditions**: Load cases and combinations are defined.
- **Acceptance Criteria**:
  - [ ] Combinations reference cases by name with numeric factors.
  - [ ] User can add/remove/edit cases and combinations.
  - [ ] Viewport can filter display by active load case.
  - [ ] Cases and combinations persist on save.
