---
id: '002'
title: Refactor Canvas2DEditor to fixed-size pop-up modal with lower-left origin
status: done
use-cases:
- SUC-001
depends-on: []
---

# Refactor Canvas2DEditor to fixed-size pop-up modal with lower-left origin

## Description

Convert the existing full-screen overlay `Canvas2DEditor` into a fixed-size
pop-up modal:

1. Change CSS from `position: fixed; inset: 0` to a centered modal
   (approx 80% width, 85% height) with semi-transparent backdrop.
2. On open, set the initial camera offset so the canvas origin (0,0)
   appears in the lower-left region (~10% from left, ~10% from bottom).
3. Ensure +X goes right, +Y goes up (standard math orientation).
4. Update `useCanvas2DStore.open()` to compute the initial camera offset
   based on canvas dimensions.

## Acceptance Criteria

- [ ] 2D editor opens as a centered pop-up, not full-screen
- [ ] Pop-up has a semi-transparent backdrop behind it
- [ ] Origin (0,0) is visible in the lower-left region of the canvas
- [ ] ~10% of negative X and Y axes are visible
- [ ] +X increases to the right, +Y increases upward
- [ ] All existing drawing tools work in the new modal
- [ ] Clicking backdrop or pressing Escape closes the modal

## Testing

- **Existing tests to run**: Any Canvas2DEditor tests
- **New tests to write**: Test that camera offset positions origin correctly
- **Verification command**: `npm test` + manual visual verification
