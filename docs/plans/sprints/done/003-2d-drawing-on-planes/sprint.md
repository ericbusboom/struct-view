---
id: '003'
title: 2D Drawing on Planes
status: done
branch: sprint/003-2d-drawing-on-planes
use-cases: []
---

# Sprint 003: 2D Drawing on Planes

## Goals

Enable users to draw nodes and beams on the focused plane. After this sprint
the user can create a plane, focus on it, place nodes with mouse clicks, connect
them with beams, and see the results in both 2D focus view and 3D perspective.

This is the first sprint where the user can actually build geometry through the
new plane-based workflow.

## Problem

Sprint 002 gives us planes and focus mode, but no way to draw on them. The user
needs:
- A node placement mode (`n` key) that creates nodes on the active plane
- A beam placement mode (`b` key) that connects nodes with two clicks
- Grid snapping so nodes land on clean coordinates
- Visual feedback: existing node highlighting, cursor snap indicators
- A sidebar showing 3D world coordinates for the selected node
- The ability to edit coordinates with +/- relative adjustments
- Rendering of the 3D model projected onto the 2D focus view

## Solution

1. Implement `n` key node placement mode: click on the plane to place a node.
   Mouse position is raycasted onto the active plane and snapped to grid.
2. Implement `b` key beam placement mode: first click sets start node (or
   creates one), second click sets end node. Beams snap to existing nearby
   nodes.
3. Build a grid snap engine: 1" imperial / 1cm metric, configurable.
4. Highlight existing nodes when cursor is near them, reuse on click.
5. Add sidebar panel showing selected node's 3D world coordinates.
6. Support +/- relative coordinate adjustments in the sidebar.
7. Render the full 3D model projected onto the active plane in 2D focus view
   (nodes and beams that lie on or near the plane).
8. Write integration tests for the drawing workflow.

## Success Criteria

- In focus mode, pressing `n` activates node placement; clicking places a node
- Nodes snap to grid (1" or 1cm increments)
- Pressing `b` activates beam mode; two clicks create a beam
- Clicking near an existing node highlights it and reuses it (no duplicate)
- Sidebar shows x, y, z coordinates for selected node
- Typing `+5` in the x field shifts the node 5 units along x
- Toggling back to 3D (`f`) shows the newly created geometry
- All 3D model geometry near the plane is visible in 2D focus view

## Scope

### In Scope

- Node placement mode (`n` key) with raycasting onto active plane
- Beam placement mode (`b` key) with two-click workflow
- Grid snap engine (1"/1cm, configurable)
- Existing node highlight and reuse
- Sidebar coordinate display for selected node
- Coordinate editing with +/- relative adjustments
- Model projection rendering in 2D focus view
- Integration tests

### Out of Scope

- Plane rotation (Sprint 004)
- Cross-plane node visibility (Sprint 004)
- Grouping and library placement (Sprint 005)
- CSV/text file import (Sprint 006)

## Test Strategy

- **Unit tests**: Grid snap calculations, raycast-to-plane intersection,
  nearest node detection
- **Unit tests**: Coordinate parsing (+5, -3.2, absolute values)
- **Integration tests**: Full workflow: create plane, focus, place 3 nodes,
  connect with beams, verify model state, toggle back to 3D
- **Manual verification**: Visual check of grid snap, node highlighting, sidebar
  coordinate display

## Architecture Notes

- Node placement uses Three.js Raycaster to find the intersection of the mouse
  ray with the active plane, then snaps to the nearest grid point.
- The grid snap engine is a pure function: `snapToGrid(point: Vec3, gridSize: number): Vec3`.
  It operates in the plane's local coordinate system (tangentU, tangentV).
- Beam placement reuses the existing `addMember` from useModelStore. The
  two-click state is tracked in useEditorStore (similar to the old
  memberStartNode pattern).
- The sidebar coordinate panel is a new React component that subscribes to
  useEditorStore.selectedNodeIds and useModelStore for node positions.
- Model projection in 2D: SceneModel already renders all nodes/members. In
  focus mode, the orthogonal camera naturally shows only what's near the plane.
  No special projection logic needed beyond camera setup from Sprint 002.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [x] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

1. Node placement mode (`n` key) -- click on plane to place node
2. Beam placement mode (`b` key) -- two-click workflow, snap to existing nodes
3. Grid snap engine (1" imperial / 1cm metric, configurable)
4. Existing node highlight + reuse when cursor near node
5. Sidebar 3D coordinate display for selected node
6. Coordinate editing with +/- relative adjustments
7. Node/beam rendering in 2D focus view (project 3D model onto plane)
8. Integration tests for 2D drawing workflow
