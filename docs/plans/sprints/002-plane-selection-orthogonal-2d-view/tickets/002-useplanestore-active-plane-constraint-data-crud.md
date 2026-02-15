---
id: "002"
title: usePlaneStore (active plane, constraint data, CRUD)
status: todo
use-cases: []
depends-on: ["001"]
---

# usePlaneStore (active plane, constraint data, CRUD)

## Description

Create a Zustand store at `src/store/usePlaneStore.ts` to manage the active
working plane and focus mode state. This store is the bridge between the
WorkingPlane data model and the React components that visualize and interact
with planes.

## Acceptance Criteria

- [ ] `usePlaneStore` Zustand store with state:
  - `activePlane: WorkingPlane | null`
  - `isFocused: boolean` (true when in 2D orthogonal view)
  - `savedCameraState: CameraState | null` (for restoring on unfocus)
- [ ] Actions:
  - `setActivePlane(plane: WorkingPlane)` -- sets active plane
  - `clearActivePlane()` -- clears active plane and exits focus mode
  - `toggleFocus()` -- toggles isFocused (no-op if no active plane)
  - `saveCameraState(state: CameraState)` -- stores camera for restore
  - `updatePlane(plane: WorkingPlane)` -- updates active plane (for rotation)
- [ ] `CameraState` type captures position, quaternion, and projection type
- [ ] Store is exported and usable from components

## Testing

- **Existing tests to run**: `npx vitest run`
- **New tests to write**: Unit tests for store CRUD: set/clear plane, toggle
  focus with and without active plane, save/restore camera state.
- **Verification command**: `npx vitest run`
