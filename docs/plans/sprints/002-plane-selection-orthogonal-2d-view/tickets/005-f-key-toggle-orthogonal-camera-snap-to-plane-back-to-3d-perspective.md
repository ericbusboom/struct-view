---
id: "005"
title: "f key toggle — orthogonal camera snap to plane / back to 3D perspective"
status: todo
use-cases: []
depends-on: ["002"]
---

# f key toggle: orthogonal camera snap to plane / back to 3D perspective

## Description

Add `f` key handling to KeyboardHandler that toggles between the 3D perspective
view and an orthogonal top-down view of the active plane. When entering focus
mode, the current camera state is saved so it can be restored on exit.

## Acceptance Criteria

- [ ] Pressing `f` with an active plane switches to orthogonal camera looking
  down the plane's negative normal
- [ ] Camera is positioned above the plane's anchor point
- [ ] Camera up vector aligns with the plane's tangentV
- [ ] The previous camera state (position, rotation, projection) is saved
- [ ] Pressing `f` again restores the saved 3D perspective camera state
- [ ] Pressing `f` with no active plane does nothing
- [ ] `usePlaneStore.isFocused` reflects the current state
- [ ] OrbitControls rotation is disabled in focus mode (pan and zoom remain)

## Testing

- **Existing tests to run**: `npx vitest run`
- **New tests to write**: Unit test: toggle focus on/off, verify isFocused
  state. Integration test: create a plane, press `f`, verify camera is
  orthogonal and positioned correctly, press `f` again, verify camera restored.
- **Verification command**: `npx vitest run`
