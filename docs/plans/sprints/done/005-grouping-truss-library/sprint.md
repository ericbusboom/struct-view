---
id: '005'
title: Grouping + Truss Library
status: done
branch: sprint/005-grouping-truss-library
use-cases: []
---

# Sprint 005: Grouping + Truss Library

## Goals

Enable users to select, group, and reuse structural geometry. After this sprint
the user can drag-select elements, create named groups, move groups as units,
save 2D drawings to the truss library, place library shapes into plane views,
and use the built-in templates (Pratt, Howe, Warren, Scissors).

This sprint connects the new plane-based drawing workflow to the reusable
shape library, completing the core geometry creation toolset.

## Problem

Users need to organize their models and reuse common patterns. The spec defines:
- Rectangular drag selection for picking multiple elements
- Shift-click to modify selection
- Grouping: create named groups from selections, move as a unit
- Truss library: save the current 2D plane drawing as a library entry, place
  library shapes into any plane view as a group
- Built-in templates adapted to the new plane-based workflow

The Group data model was added in Sprint 001. This sprint adds the UI and
library integration.

## Solution

1. Implement Group store CRUD (addGroup, removeGroup, getGroup) UI on top of
   the Sprint 001 data model.
2. Rectangular drag selection in 3D viewport.
3. Shift-click to add/remove individual nodes from the selection.
4. Group button: create a group from the current selection.
5. Group selection and movement in 3D (select a group, drag to move all
   members together).
6. Save current 2D plane drawing to the truss library.
7. Place from library into the current plane view as a group.
8. Adapt the existing truss templates (Pratt, Howe, Warren, Scissors) for the
   new workflow: they produce 2D shapes that are placed into plane views.
9. Integration tests.

## Success Criteria

- User can drag-select a rectangle in 3D to select multiple nodes
- Shift-click adds/removes individual nodes from selection
- Group button creates a named group from selected elements
- Selecting a group highlights all its members
- Dragging a group moves all its nodes and beams together
- In 2D focus mode, user can save current drawing as a library entry
- User can select a library shape and place it into the current plane view
- Placed library shapes become groups
- Built-in templates (Pratt, Howe, Warren, Scissors) are available in the
  library and work in the new plane-based workflow

## Scope

### In Scope

- Group CRUD UI (create, select, rename, delete)
- Rectangular drag selection in 3D
- Shift-click selection modification
- Group button
- Group selection and 3D movement
- Save-to-library from 2D plane view
- Place-from-library into 2D plane view
- Adapt truss templates for new workflow
- Integration tests

### Out of Scope

- Direct 3D coordinate entry (Sprint 006)
- CSV/text import (Sprint 006)
- Copy/paste groups (future sprint)

## Test Strategy

- **Unit tests**: Group creation, group node/member lookup, group movement
  (translate all nodes by delta)
- **Unit tests**: Truss template generation (verify output shape geometry)
- **Integration tests**: Full workflow: draw on plane, save to library, create
  new plane, place from library, verify group created, move group
- **Integration tests**: Drag-select, shift-click, create group, move group
- **Manual verification**: Visual check of selection rectangles, group
  highlighting, library panel UI

## Architecture Notes

- The Group model from Sprint 001 (id, name, nodeIds, memberIds) is used
  directly. No schema changes needed.
- Drag selection uses a 2D screen-space rectangle projected into the 3D scene
  via frustum testing (Three.js SelectionHelper or manual implementation).
- Group movement translates all node positions by a delta vector, reusing the
  NodeDragger pattern but for multiple nodes.
- The truss library stores Shape2D objects (2D node/member data). Placing from
  the library into a plane view maps Shape2D coordinates to the plane's
  tangentU/tangentV axes, creating real 3D nodes/members and a Group.
- The existing trussTemplates.ts generates Shape2D objects. These are adapted
  (minimal changes) to work as library entries.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [x] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

1. Group data model + store CRUD (addGroup, removeGroup, getGroup)
2. Rectangular drag selection in 3D viewport
3. Shift-click to add/remove from selection
4. Group button: create group from current selection
5. Group selection + move in 3D (select group, drag to move)
6. Save current 2D plane drawing to truss library
7. Place from library into current plane view as group
8. Adapt truss templates (Pratt, Howe, Warren, Scissors) for new workflow
9. Integration tests for grouping + library workflow
10. 2D editor undo/redo (command stack for draw/move/delete operations)
