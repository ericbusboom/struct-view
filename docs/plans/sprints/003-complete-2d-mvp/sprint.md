---
id: "003"
title: Complete 2D MVP
status: planning
branch: sprint/003-complete-2d-mvp
use-cases: []
---

# Sprint 003: Complete 2D MVP

## Goals

Transform the 2D editor from a full-screen overlay into a pop-up modal with
proper coordinate orientation, add a truss library panel with thumbnails,
and implement Tinkercad-style 3D manipulation tools (plane-constrained move,
rotate, node snapping, rotate-around-node).

## Problem

The current workflow has friction at several points:
1. The 2D editor takes over the entire screen, losing context of the 3D scene.
2. There is no persistent visual library of created trusses — users must
   navigate the shape library list to find and place shapes.
3. After placement, trusses cannot be moved or rotated in the 3D scene
   without manually editing node positions.
4. There is no plane-constrained movement or rotation tooling, making
   precise 3D positioning tedious.

## Solution

1. **Pop-up 2D editor**: Replace the full-screen overlay with a resizable
   modal pop-up. Set the coordinate origin to the lower-left region
   (showing ~10% of negative axes) so drawing starts naturally from zero
   and increases right/up.
2. **"Add a Truss" button**: Rename the editor entry point; each save
   produces a truss card in a right-side library panel with thumbnail,
   edit, and "add to 3D" actions.
3. **Plane selection**: In the truss editor, allow choosing the placement
   plane (X-Z default, X-Y, Y-Z) so the truss is oriented correctly on
   placement.
4. **Tinkercad-style 3D tools**: Add a plane selector (XY / XZ / YZ) and
   move/rotate tools. Movement constrains to the selected plane via
   mouse drag or arrow keys. Rotation uses an on-screen arc widget with
   15-degree snaps and optional keyboard rotation.
5. **Node snapping during move/rotate**: Nodes snap to nearby existing
   nodes while dragging.
6. **Rotate around node**: Allow setting a specific node as the rotation
   center for precision alignment.

## Success Criteria

- [ ] 2D editor opens as a pop-up (not full-screen), origin visible in lower-left
- [ ] "Add a Truss" button opens the editor; saved trusses appear as
      thumbnail cards in a right-side panel
- [ ] Each truss card has Edit and Add-to-3D actions
- [ ] Plane selection (XZ / XY / YZ) is available in the truss editor
- [ ] Placed trusses can be moved in-plane via mouse drag and arrow keys
- [ ] Placed trusses can be rotated via on-screen arc with 15-degree snaps
- [ ] Arrow keys rotate the truss in the selected plane
- [ ] Nodes snap to other nodes during move and rotate operations
- [ ] Rotate-around-node feature works (user selects a node as pivot)

## Scope

### In Scope

- 2D editor pop-up modal (fixed-size, large but not full-screen)
- Coordinate origin repositioned to lower-left with ~10% negative axis visible
- "Add a Truss" button replacing "2D Editor" button
- Right-side truss library panel with thumbnail previews
- Edit and Add-to-3D actions per truss card
- Placement plane selection (XZ default, XY, YZ) in truss editor
- Plane selection tool for 3D manipulation (3-button toggle: XY, XZ, YZ)
- Move tool: drag to translate in selected plane, arrow keys for nudge
- Rotate tool: on-screen arc widget, 15-degree snap, arrow key rotation
- Node-to-node snapping during move and rotate
- Rotate-around-node (set pivot to a specific model node)

### Out of Scope

- STL reference snapping (Sprint 004)
- Material/section property assignment (Sprint 005)
- Multi-select group operations (future sprint)
- Undo/redo for move/rotate (Sprint 007 — command stack)
- Auto-layout patterns (Sprint 004)

## Test Strategy

- **Unit tests**: Plane-constrained math (projection, rotation, snapping)
- **Component tests**: 2D editor pop-up open/close lifecycle, truss library
  panel CRUD, plane selector state
- **Integration tests**: Full workflow — create truss → save → see in
  library → place in 3D → move → rotate → snap
- **Visual smoke tests**: Verify coordinate orientation, thumbnail rendering,
  arc widget appearance

## Architecture Notes

- The 2D editor is currently a full-screen fixed overlay (`Canvas2DEditor`).
  It will become a positioned pop-up (likely CSS `position: fixed` with
  constrained dimensions, e.g. 60-70% of viewport).
- The truss library panel is a new persistent UI component docked to the
  right edge of the viewport, always visible.
- 3D manipulation requires a new "object selection" concept — currently
  nodes and members are selected individually. We need a "placed group"
  or "truss instance" concept to move/rotate an entire placed truss as
  a unit.
- Plane-constrained movement projects mouse ray intersection onto the
  selected plane through the object's current position.
- Rotation arc widget is a Three.js overlay (torus geometry) rendered
  at the object's position in the selected plane.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [ ] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

(To be created after sprint approval.)
