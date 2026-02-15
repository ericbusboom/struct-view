---
id: '002'
title: "Beam placement mode (m key) \u2014 two-click workflow, snap to existing nodes"
status: done
use-cases:
- SUC-003-02
- SUC-003-03
depends-on:
- '001'
- '003'
---

# Beam placement mode (m key) — two-click workflow, snap to existing nodes

## Description

When in focus mode, pressing `m` activates beam (member) placement mode. The
user clicks twice: first click sets the start node, second click sets the end
node, and a member is created connecting them.

> **Note:** The sprint plan originally specified `b` key, but the existing
> KeyboardHandler uses `m` → `setMode('add-member')`. We keep `m` for
> consistency with the current codebase.

### What already exists

- `KeyboardHandler.tsx` maps `m` → `setMode('add-member')`
- `NodeMesh.tsx` handles click in add-member mode: first click sets
  `memberStartNode`, second click calls `addMember()`
- The existing workflow requires clicking on existing nodes

### What this ticket adds

**Extend `PlanePlacer.tsx`** (from Ticket 001) to also handle `add-member` mode:

1. When mode is `add-member` and user clicks in focus view:
   - Raycast onto the active plane, snap to grid
   - Search for nearest existing on-plane node within snap distance
   - If found, use that node; otherwise create a new node at the snapped position
   - If no `memberStartNode`: set it as the start (store in useEditorStore)
   - If `memberStartNode` already set: create the end node/find existing, then
     call `addMember(createMember(startId, endId))`, clear memberStartNode
2. Render a preview line from start node to cursor (visual feedback during
   two-click workflow)

**Preview line**: A `<Line>` from `@react-three/drei` or a simple `<line>`
geometry showing where the beam will go before the second click.

### Snap to existing nodes

When the cursor is within `snapRadius` (default 0.5) of an existing on-plane
node, use that node instead of creating a new one. This prevents duplicates at
the same position. The nearest-node search uses `isOnPlane()` to filter to only
on-plane nodes.

## Acceptance Criteria

- [ ] In focus mode, `m` activates beam placement mode
- [ ] First click sets start node (existing or new)
- [ ] Preview line renders from start node to cursor position
- [ ] Second click creates beam between start and end nodes
- [ ] If cursor is near an existing on-plane node, that node is reused
- [ ] After creating a beam, memberStartNode is cleared (ready for next beam)
- [ ] Console log confirms: `[place] member from nodeA to nodeB`

## Testing

- **Existing tests to run**: `npx vitest run` (all tests, verify no regressions)
- **New tests to write**: Covered by Ticket 008 (integration tests)
- **Verification command**: `npx vitest run`
