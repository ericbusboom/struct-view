---
id: '005'
title: Sidebar 3D coordinate display for selected node
status: done
use-cases:
- SUC-003-04
depends-on: []
---

# Sidebar 3D coordinate display for selected node

## Description

Add a sidebar panel that shows the 3D world coordinates (x, y, z) of the
currently selected node. This is the first step toward the property editing pane
described in the TODO `sidebar-property-editor-beam-length.md`.

### What already exists

- `useEditorStore` tracks `selectedNodeIds: Set<string>`
- `useModelStore` has the full node list with positions
- `App.tsx` layout has a `viewport-main` area with `TrussLibraryPanel` on the
  right side

### What this ticket adds

**New component: `src/components/PropertiesPanel.tsx`**

A React component (outside the Canvas, in the DOM) that:

1. Subscribes to `useEditorStore.selectedNodeIds`
2. When exactly one node is selected, looks it up in `useModelStore.nodes`
3. Displays x, y, z coordinate fields (read-only in this ticket; editing is
   Ticket 006)
4. When no node is selected, shows "No selection" or is hidden
5. When multiple nodes are selected, shows count ("3 nodes selected")

**Modify `App.tsx`**: Mount `<PropertiesPanel />` in the sidebar area, above or
below `TrussLibraryPanel`.

### Layout

The panel should be compact: a small card with three labeled fields (X, Y, Z)
showing the coordinate values to 3 decimal places. Styled consistently with the
existing dark theme (#2a2a2a background).

## Acceptance Criteria

- [ ] Clicking a node populates the sidebar with x, y, z values
- [ ] Values update when a different node is selected
- [ ] Panel clears when selection is cleared (Escape or click empty space)
- [ ] Multiple node selection shows count, not coordinates
- [ ] Panel does not appear when no node is selected (or shows "No selection")
- [ ] Coordinate values display to 3 decimal places

## Testing

- **Existing tests to run**: `npx vitest run` (all tests, verify no regressions)
- **New tests to write**: Manual verification of sidebar display
- **Verification command**: `npx vitest run`
