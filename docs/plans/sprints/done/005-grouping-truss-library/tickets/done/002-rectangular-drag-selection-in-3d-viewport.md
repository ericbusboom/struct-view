---
id: '002'
title: Rectangular drag selection in 3D viewport
status: done
use-cases:
- SUC-005-01
depends-on: []
---

# Rectangular drag selection in 3D viewport

## Description

Add a DragSelect component that lets users click-and-drag a rectangle in the
3D viewport to select all nodes within the rectangle. The component lives
inside the R3F Canvas, attaches DOM event listeners to the canvas element,
and draws a selection rectangle overlay. On mouse release it projects node
positions to screen space and selects those inside the rectangle.

Also adds `setSelectedNodeIds` to useEditorStore for bulk selection.

## Acceptance Criteria

- [x] Click-and-drag in select mode shows a visible selection rectangle
- [x] Nodes inside the rectangle are selected on release
- [x] Shift-drag adds to existing selection instead of replacing
- [x] Orbit controls are disabled during drag selection
- [x] `setSelectedNodeIds` method added to useEditorStore
- [x] All existing tests still pass

## Testing

- **Existing tests to run**: `cd frontend && npx vitest run`
- **New tests to write**: Unit test for `setSelectedNodeIds` in useEditorStore
- **Verification command**: `cd frontend && npx vitest run`
