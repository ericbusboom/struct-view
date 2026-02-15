---
status: draft
---

# Sprint 001 Use Cases

This is a cleanup sprint with no user-facing features. The use cases describe
developer-facing outcomes rather than end-user workflows.

## SUC-001-01: Clean Build After Schema Migration

- **Actor**: Developer
- **Preconditions**: Codebase has obsolete trussId references and old placement
  pipeline code
- **Main Flow**:
  1. Developer deletes obsolete files (Canvas2DEditor, placement pipeline,
     old stores)
  2. Developer updates Node/Member schemas (remove trussId, add groupId)
  3. Developer adds Group type to model
  4. Developer moves connection info from Node to Member end_releases
  5. Developer runs `tsc -b` and confirms zero errors
  6. Developer runs `npx vitest run` and confirms all tests pass
- **Postconditions**: Build is clean, all tests pass, no dead code remains
- **Acceptance Criteria**:
  - [x] `tsc -b` produces zero errors
  - [x] `npx vitest run` passes all tests
  - [x] No imports of deleted modules remain

## SUC-001-02: 3D Viewport Still Renders After Cleanup

- **Actor**: Developer (manual verification)
- **Preconditions**: Obsolete code deleted, schemas updated
- **Main Flow**:
  1. Developer starts the dev server (`npm run dev`)
  2. Developer opens the app in browser
  3. Developer loads a sample project JSON (or the default state includes
     sample nodes/members)
  4. Developer verifies nodes render as spheres and members render as tubes
- **Postconditions**: 3D viewport is functional with the new schema
- **Acceptance Criteria**:
  - [x] Nodes render as colored spheres
  - [x] Members render as tube geometries
  - [x] OrbitControls (pan/zoom/rotate) still work

## SUC-001-03: Group CRUD Operations

- **Actor**: Developer (unit test verification)
- **Preconditions**: Group schema and store methods exist
- **Main Flow**:
  1. Call addGroup with a name and set of nodeIds/memberIds
  2. Call getGroup to retrieve the group
  3. Call removeGroup to delete it
  4. Verify the group is gone from state
- **Postconditions**: Group CRUD is functional and tested
- **Acceptance Criteria**:
  - [x] addGroup creates a group with correct fields
  - [x] getGroup returns the group by ID
  - [x] removeGroup deletes the group
  - [x] Nodes/members are not deleted when their group is removed
