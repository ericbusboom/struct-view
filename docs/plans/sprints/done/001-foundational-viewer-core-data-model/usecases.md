# Sprint 001 Use Cases

## SUC-001: Create and edit a basic wireframe
- Actor: User
- Preconditions: StructView app is loaded
- Main Flow:
  1. User adds nodes in the 3D workspace.
  2. User creates members between node pairs.
  3. User moves or deletes nodes/members.
- Postconditions: Updated model remains structurally valid.
- Acceptance Criteria:
  - Invalid member references are rejected.
  - View updates reflect edits immediately.

## SUC-002: Persist and reload project model
- Actor: User
- Preconditions: Model contains at least one node/member
- Main Flow:
  1. User exports project to JSON.
  2. User reloads the JSON project.
- Postconditions: Reloaded model matches exported model.
- Acceptance Criteria:
  - Schema validation passes on load.
  - Entity IDs and coordinates are preserved.

## SUC-003: Inspect model in 3D viewport
- Actor: User
- Preconditions: App is loaded with a model
- Main Flow:
  1. User orbits, pans, and zooms camera.
  2. User selects nodes/members in viewport.
- Postconditions: User can inspect geometry clearly.
- Acceptance Criteria:
  - Selection highlights target entity.
  - Camera controls function on desktop and mobile.
