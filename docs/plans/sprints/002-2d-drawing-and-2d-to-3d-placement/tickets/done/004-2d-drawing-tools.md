---
id: '004'
title: 2D drawing tools
status: done
use-cases:
- SUC-004
depends-on:
- '002'
- '003'
---

# 2D drawing tools

## Description

Implement the drawing tool modes for the 2D canvas editor: place node (click), draw line segment (click start then click end), select entity, move node, and delete entity. All placement operations use the snap system from ticket 003. The drawing state (current tool mode, shape-in-progress with its nodes and members, selection state) is managed in a Zustand store. Undo/redo is not required in this ticket.

## Implementation Notes

- Create a `useEditor2DStore` Zustand store with state: `currentTool` (enum: `'draw-node'`, `'draw-segment'`, `'select'`, `'delete'`), `shape` (the Shape2D being edited), `selectedIds` (set of selected node/member ids), `pendingSegmentStart` (node id for segment-in-progress).
- Tool behaviors:
  - **draw-node**: On click, snap the cursor position, create a new Shape2DNode, add to shape.
  - **draw-segment**: On first click, snap and record as `pendingSegmentStart`. On second click, snap and create a Shape2DMember from start to end. If the click lands on an existing node, reuse that node id. Otherwise create a new node at the snapped position.
  - **select**: On click, hit-test nodes (point radius) and members (line proximity). Set selection. On drag of a selected node, move it (updating its x, y).
  - **delete**: On click, hit-test and remove the entity. If removing a node, also remove members referencing it.
- Toolbar UI within the 2D editor to switch tool modes.
- Render visual feedback: highlighted snap target, pending segment ghost line, selection highlights.

## Acceptance Criteria

- [ ] Clicking with the draw-node tool places a node at the snapped position.
- [ ] Clicking two points with the draw-segment tool creates a member between them.
- [ ] Drawing a segment to an existing node reuses that node (no duplicate).
- [ ] Select tool can click to select nodes and members.
- [ ] Selected node can be dragged to a new position with snapping.
- [ ] Delete tool removes clicked entity; deleting a node also removes its members.
- [ ] Tool mode switches via toolbar buttons in the 2D editor.
- [ ] Visual feedback shows snap indicator, ghost line for pending segment, and selection highlights.

## Testing

- **Existing tests to run**: Schema tests from ticket 001 to confirm generated shapes validate.
- **New tests to write**:
  - Store unit test: `draw-node` action adds a node to the shape.
  - Store unit test: `draw-segment` action with two node ids creates a member.
  - Store unit test: `draw-segment` reuses existing node when click lands within snap radius.
  - Store unit test: `delete` action on a node removes it and its connected members.
  - Store unit test: `select` followed by move updates node coordinates.
  - Store unit test: switching tool mode resets pending state (e.g., pending segment start).
- **Verification command**: `npx vitest run`
