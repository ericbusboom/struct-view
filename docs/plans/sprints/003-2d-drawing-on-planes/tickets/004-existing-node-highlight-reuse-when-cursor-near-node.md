---
id: "004"
title: Existing node highlight + reuse when cursor near node
status: todo
use-cases:
  - SUC-003-03
depends-on:
  - "001"
  - "003"
---

# Existing node highlight + reuse when cursor near node

## Description

When in focus mode and in add-node or add-member mode, moving the cursor near an
existing on-plane node should highlight that node with a visual indicator
(color change or ring). If the user clicks, the existing node is reused instead
of creating a duplicate.

### What already exists

- `NodeMesh.tsx` has color logic for selected, highlighted, pivot, and support
  states
- `snap3d.ts` has a `snapPoint3D` function that finds nearest nodes within a
  radius
- `isOnPlane()` in `WorkingPlane.ts` checks if a node is on the active plane

### What this ticket adds

**New state in `useEditorStore`**: `hoverNodeId: string | null`

Tracks which node the cursor is hovering near (within snap distance). Used by
NodeMesh to render a highlight ring.

**Extend `PlanePlacer.tsx`**: On `onPointerMove`, raycast onto the plane, snap
to grid, then search for the nearest on-plane node within `snapRadius`. If found,
set `hoverNodeId`. If not found, clear it.

**Modify `NodeMesh.tsx`**: Add a hover highlight state. When
`hoverNodeId === node.id`, render with a distinct color (e.g., bright cyan ring
or enlarged sphere) to indicate the node will be reused on click.

### Snap distance

Use `snapRadius = 0.5` (same as the existing snap3d default). This is in world
units.

## Acceptance Criteria

- [ ] Moving cursor near an on-plane node highlights it visually
- [ ] Highlight disappears when cursor moves away
- [ ] Clicking a highlighted node reuses it (no duplicate created)
- [ ] Works in both add-node and add-member modes
- [ ] Only on-plane nodes are highlighted (off-plane ghosted nodes are ignored)
- [ ] hoverNodeId is cleared when exiting focus mode or changing modes

## Testing

- **Existing tests to run**: `npx vitest run` (all tests, verify no regressions)
- **New tests to write**: Covered by Ticket 008 (integration tests)
- **Verification command**: `npx vitest run`
