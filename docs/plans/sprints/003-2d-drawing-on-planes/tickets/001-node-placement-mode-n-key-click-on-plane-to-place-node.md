---
id: "001"
title: Node placement mode (n key) — click on plane to place node
status: todo
use-cases:
  - SUC-003-01
depends-on:
  - "003"
---

# Node placement mode (n key) — click on plane to place node

## Description

When in focus mode with an active plane, pressing `n` activates node placement
mode. Clicking on the 2D view raycasts onto the active plane, snaps the
intersection to the plane grid, and creates a node at that 3D position.

### What already exists

- `KeyboardHandler.tsx` already maps `n` → `setMode('add-node')`
- `GroundPlane.tsx` handles add-node clicks but only at z=0 on the XY plane
- `useModelStore.addNode()` creates a node from a position

### What this ticket adds

**New component: `src/components/PlanePlacer.tsx`**

A R3F component (mounted inside `<Canvas>`) that intercepts click events when
`mode === 'add-node'` and `isFocused === true`. It:

1. Gets mouse position from the click event
2. Creates a `THREE.Raycaster` from the camera and mouse coords
3. Calls `raycastOntoPlane(raycaster, activePlane)` (from Ticket 003)
4. Calls `snapToPlaneGrid(intersection, activePlane, gridSize)` (from Ticket 003)
5. Calls `useModelStore.addNode(createNode({ position: snapped }))`

**Modify: `src/components/GroundPlane.tsx`**

When `isFocused`, GroundPlane should not handle add-node clicks (PlanePlacer
takes over). Add a guard: `if (isFocused) return` early in handleClick.

**Modify: `src/components/Viewport3D.tsx`**

Mount `<PlanePlacer />` inside the Canvas.

### Interaction with non-focused mode

When NOT focused, pressing `n` and clicking still uses the existing GroundPlane
behavior (places nodes on XY at z=0). PlanePlacer only activates when focused.

## Acceptance Criteria

- [ ] In focus mode, `n` key activates node placement mode (already works)
- [ ] Clicking on the 2D view creates a node on the active plane
- [ ] Node position is snapped to the plane grid (gridSize=1.0)
- [ ] Node appears as a sphere in both 2D focus view and 3D perspective
- [ ] Multiple clicks create multiple nodes
- [ ] Node placement does NOT work outside focus mode (GroundPlane handles that)
- [ ] Console log confirms placement: `[place] node at (x, y, z)`

## Testing

- **Existing tests to run**: `npx vitest run` (all tests, verify no regressions)
- **New tests to write**: Covered by Ticket 008 (integration tests)
- **Verification command**: `npx vitest run`
