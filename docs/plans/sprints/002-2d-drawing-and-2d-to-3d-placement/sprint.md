---
id: "002"
title: 2D Drawing and 2D-to-3D Placement
status: planning
branch: sprint/002-2d-drawing-and-2d-to-3d-placement
use-cases: [SUC-004, SUC-005, SUC-006]
---

# Sprint 002: 2D Drawing and 2D-to-3D Placement

## Goals

Deliver the 2D truss/frame drawing editor and the workflow for placing 2D shapes into the 3D scene as rigid units with node merging at coincidences.

## Problem

Users need a fast way to design 2D truss and frame cross-sections (which are inherently 2D problems) and then stamp them into 3D space at multiple locations. Doing this directly in 3D is tedious and error-prone.

## Solution

A dedicated 2D canvas editor with aggressive snapping, a named shape library with snap-edge designation, and a 3D placement engine that snaps shapes to existing geometry and merges coincident nodes.

## Success Criteria

- User can draw and save a custom 2D truss with snapping assistance.
- User can load and modify standard truss templates.
- User can place 2D shapes into 3D with snap-edge alignment.
- Coincident nodes merge correctly on placement.
- Equal-spacing placement produces correctly spaced copies.

## Scope

### In Scope

- 2D canvas drawing tool with snap-to-grid, snap-to-node, snap-to-midpoint, perpendicular/parallel alignment guides
- Named 2D shape library: save, rename, delete shapes
- Snap edge designation on 2D shapes
- Standard truss templates (Pratt, Howe, Warren, scissors) as starting points
- 2D-to-3D placement: drag shape into 3D scene, snap edge locks to existing geometry
- Node merge on coincident placement (1mm tolerance)
- Equal-spacing placement mode

### Out of Scope

- STL import or STL-based snapping
- Auto-layout from reference geometry
- Material/section property assignment
- Load application
- Analysis

## Test Strategy

- Unit tests: snap calculations (grid, midpoint, perpendicular/parallel detection)
- Unit tests: node merge logic (tolerance boundary, ID consolidation)
- Unit tests: coordinate transform from shape-local to world space
- Integration tests: draw shape in 2D, place in 3D, verify model nodes/members
- Integration tests: equal-spacing placement count and positions
- UI smoke tests: 2D canvas loads, drawing tools work, placement preview renders

## Architecture Notes

- 2D editor is a self-contained component with its own coordinate space.
- Shape library persists in project JSON under a `shapes` key.
- Placement produces standard Node/Member entities — no "shape instance" at the model layer.
- Snap edge metadata lives on the shape definition, not on placed members.
- Operations should be command-oriented for future undo/redo.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [ ] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

(To be created after sprint approval.)
