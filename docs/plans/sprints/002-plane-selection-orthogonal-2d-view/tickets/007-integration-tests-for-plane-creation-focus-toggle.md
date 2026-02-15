---
id: "007"
title: Integration tests for plane creation + focus toggle
status: todo
use-cases: []
depends-on: ["003", "005"]
---

# Integration tests for plane creation + focus toggle

## Description

Write integration tests covering the full plane creation and focus toggle
workflow. These tests exercise the interaction between KeyboardHandler,
usePlaneStore, WorkingPlane factory functions, and the camera controller.

## Acceptance Criteria

- [ ] Test: press `p` with no selection, verify XY plane at origin created
- [ ] Test: select 1 node, press `p`, verify XY plane at that node
- [ ] Test: select 2 nodes, press `p`, verify line-constrained plane
- [ ] Test: select 3 nodes, press `p`, verify fully-constrained plane
- [ ] Test: select a beam, press `p`, verify line-constrained plane through
  beam endpoints (equivalent to 2 points)
- [ ] Test: select a beam + 1 node, press `p`, verify fully-constrained plane
  (equivalent to 3 points)
- [ ] Test: press `f` with active plane, verify isFocused is true and camera
  state saved
- [ ] Test: press `f` again, verify isFocused is false and camera state
  restored
- [ ] Test: press `f` with no active plane, verify no state change
- [ ] Test: verify plane grid color matches axis alignment (yellow for general,
  red for XY, blue for YZ, green for XZ)
- [ ] All tests pass with `npx vitest run`

## Testing

- **Existing tests to run**: `npx vitest run`
- **New tests to write**: All of the above acceptance criteria are the tests
- **Verification command**: `npx vitest run`
