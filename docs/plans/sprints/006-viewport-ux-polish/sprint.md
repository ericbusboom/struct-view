---
id: "006"
title: Viewport UX Polish
status: active
branch: sprint/006-viewport-ux-polish
use-cases: []
---

# Sprint 006: Viewport UX Polish

## Goals

Make the 3D viewport feel like a real tool. Fix broken interactions, simplify
the mode system, add essential settings, and introduce duplicate-with-offset
for practical structural modeling workflows.

## Features

### 1. Editable coordinate fields in properties panel

When a node is selected, the X/Y/Z coordinate fields in the sidebar should be
directly editable:

- Click a field to select its contents (full text selected on focus).
- Type a number to overwrite the current value.
- Press Return or Tab to accept the value and advance focus to the next field.
- Workflow: click X field, type `0`, Return, `0`, Return, `0`, Return — moves
  the node to the origin.

### 2. Settings panel

Add a settings panel (gear icon or similar) with:

- **Units**: Imperial or metric toggle. (Pull basic unit selection forward from
  Sprint 008 — the full round-trip dual-storage can stay in 008, but the user
  needs to be able to choose units now.)
- **Snap grid size**: Configure the snap increment (e.g., 1 ft, 0.5 m, 1/4 in).
- **Grid line spacing**: How frequently grid lines appear on work planes.
- **Work plane size**: When opening a work plane (e.g., pressing P for the XY
  ground plane), set how large the plane grid extends. This size should be cloe
  to the final size of the structure, and can be used to set the zoom level when
  moving the camera to the "home" position. 

Scale context: this is structural engineering. The smallest objects are roughly
3 ft / 1 m at the base. Drawn dimensions will never be smaller than 1/8 inch.
Snap grid defaults should reflect this (e.g., 1 ft or 0.25 m increments).

### 3. Fix point dragging (mouse-to-plane projection)

Dragging a node currently causes the point to wander away from the mouse
pointer. The projection from screen-space mouse position onto the work plane
is broken. Fix so the node stays locked under the cursor throughout the drag.

### 4. Duplicate with offset

Select one or more items, then activate a "Duplicate" action (toolbar button)
that opens a dialog to specify an X/Y/Z offset. The selected items are
duplicated at the offset position.

Primary use case: lay out stud base nodes, select all, duplicate with Z offset
of 8 ft to create the top-of-wall nodes. Then connect top to bottom with beams.

This should work with individually selected nodes or beams, or with objects that
have been grouped. 

If boths nodes of a beam have been selected, then also implicitly copy the beam. 

### 5. Unify select and move — no separate modes

Remove the distinction between "select mode" and "move mode." If the user
selects something and then grabs (drags) it, they're moving it. A single
interaction mode handles both selection and dragging.

### 6. Remove add-node mode — use N key instead

Instead of a separate toolbar mode for placing nodes, pressing the n key
places a node at the current mouse position (projected onto the active work
plane or the ground plane). No mode switch required.

### 7. Turntable orbit controls (Tinkercad-style)

Replace the current trackball orbit with turntable orbit that keeps Z-up
stable:

- **Left/right drag** rotates around the world Z axis (azimuth).
- **Up/down drag** tilts the camera in a vertical plane that passes through
  the Z axis and the center of the screen (elevation). The Z axis stays
  pointing up at all times — the horizon never tilts.
- **Shift + right-click** pans.
- **Scroll wheel** zooms toward cursor.

The current trackball controls allow the horizon to tilt freely, making it
easy to end up in a disorienting orientation that's hard to recover from.
Turntable orbit avoids this — you can reach any viewing angle, but it always
feels stable.

### 8. Axes and orientation cube alignment

ViewCube face labels and axis arrows must be consistent with the Z-up
coordinate system: Z=up, Y=front-to-back, X=left-to-right. Camera animations
when clicking cube faces must use correct up vectors.

### 9. B+click beam shortcut

In select mode, with exactly one node selected, hold B and click another node
to place a beam between them. Selection advances to the clicked node so beams
can be chained: select A → B+click B → B+click C creates beams A–B and B–C.

### 10. Dimension overlay mode (experimental)

A toggleable mode that annotates the 3D view with measurements:

- **Beam lengths**: A number displayed near the center of each beam showing its
  length.
- **Node positions**: An `(x, y, z)` triplet displayed near each node.
- Clicking a label makes it editable directly in the viewport — no need to go
  to the sidebar.

### 11. Relative expression editing in coordinate fields

When editing a position value (in the sidebar properties panel or the dimension
overlay):

- Clicking the field selects/highlights the entire number for immediate
  overwrite.
- Pressing the left arrow un-highlights and moves the cursor to the end of the
  number.
- From there, typing `+3` or `-1.5` appends a relative adjustment.
- On Return or Tab, the expression is evaluated (e.g., `12.5+3` → `15.5`) and
  the result is applied.

This lets users make relative adjustments without mental math — just append
`+` or `-` and a delta.

## Notes

- Sprint 008 (Unit Display: Imperial and Metric) handles the full dual-storage
  model for lossless imperial round-tripping. This sprint only needs the basic
  unit preference toggle and display formatting so the settings panel works.
- The snap grid and grid line settings should persist with the project (stored
  in useModelStore or a new settings store).

## Tickets

1. **001** — Editable coordinate fields in properties panel
2. **002** — Relative expression editing in coordinate fields (depends on 001)
3. **003** — Settings store (units, snap grid, grid spacing, plane size)
4. **004** — Settings panel UI (depends on 003)
5. **005** — Fix node drag projection
6. **006** — Unify select and move modes (depends on 005)
7. **007** — Remove add-node mode — N key places node at cursor
8. **008** — Turntable orbit controls
9. **009** — ViewCube and axes Z-up alignment (depends on 008)
10. **010** — B+click beam shortcut
11. **011** — Duplicate with offset (depends on 006)
12. **012** — Dimension overlay mode, experimental (depends on 001)
