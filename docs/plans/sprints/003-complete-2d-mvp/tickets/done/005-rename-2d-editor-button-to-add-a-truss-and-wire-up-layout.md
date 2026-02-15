---
id: '005'
title: Rename 2D Editor button to Add a Truss and wire up layout
status: done
use-cases:
- SUC-001
- SUC-002
depends-on:
- '002'
- '004'
---

# Rename 2D Editor button to Add a Truss and wire up layout

## Description

Update `App.tsx` layout to integrate the new components:

1. Rename the "2D Editor" toolbar button to "Add a Truss".
2. Add `TrussLibraryPanel` to the right side of the main layout
   (flex row: Viewport3D grows, TrussLibraryPanel fixed width).
3. Wire the "Add a Truss" button to open the pop-up editor for a new shape.
4. Wire TrussCard Edit action to open pop-up editor for existing shape.
5. Wire TrussCard Add-to-3D action to start placement workflow.
6. Remove the old `ShapeLibrary` panel if it's fully replaced.

## Acceptance Criteria

- [ ] Toolbar shows "Add a Truss" instead of "2D Editor"
- [ ] TrussLibraryPanel renders on the right side of the viewport
- [ ] Main layout is flex row with viewport taking remaining space
- [ ] All wiring works: new truss, edit truss, place truss

## Testing

- **Existing tests to run**: App component tests, placement workflow tests
- **New tests to write**: Layout integration test
- **Verification command**: `npm test` + manual visual verification
