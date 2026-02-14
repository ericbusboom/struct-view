---
id: "007"
title: 2D-to-3D Workflow Completion and 3D Viewport Fixes
status: planning
branch: sprint/007-2d-to-3d-workflow-completion-and-3d-viewport-fixes
use-cases: [SUC-004, SUC-005, SUC-006]
---

# Sprint 007 (002A): 2D-to-3D Workflow Completion and 3D Viewport Fixes

This sprint fills the gaps left by Sprint 002. The pure logic for 2D-to-3D placement exists (placeShape, mergeNodes, equalSpacing) but there is no UI to drive it. The 3D viewport also lacks move and snap functionality from Sprint 001.

## Goals

Complete the end-to-end workflow: user draws a truss in 2D, saves it, places it into the 3D scene at a chosen target edge, and sees the result in the 3D viewport. Also fix 3D viewport interaction gaps.

## Problem

Sprint 002 delivered store logic, pure functions, and tests but the user cannot actually place a 2D shape into 3D — there is no target edge picker, no store integration, no preview, and no equal-spacing UI. The 3D viewport's Move mode does nothing, and there is no snapping in 3D.

## Solution

Build the missing UI layer that connects the 2D editor's shape output to the 3D placement engine, and add the missing 3D viewport interactions.

## Success Criteria

- User can draw a truss in 2D, save it, and place it into the 3D viewport at a chosen edge
- User can place multiple copies at equal spacing along an edge
- User can preview placement before committing
- User can slide a shape along the target edge
- User can move nodes in the 3D viewport via drag
- 3D node/beam creation snaps to existing geometry

## Scope

### In Scope

- 2D editor multi-shape management (switch between shapes, create new, load from library)
- Place shape into 3D: full UI workflow
- 3D target edge picker (click two points or select a member)
- Store integration for placement (placeShape + mergeNodes → model store)
- Placement preview (ghost wireframe before commit)
- Equal-spacing placement UI (count input, preview)
- Slide-along-edge offset control
- 3D move node (drag with TransformControls or custom handlers)
- 3D snap system (node, midpoint, grid snapping in the 3D viewport)

### Out of Scope

- 2D editor undo/redo (deferred to Sprint 006)
- Unit display: imperial/metric (deferred to Sprint 004)
- STL import and snapping (Sprint 003)
- Property/load assignment (Sprint 004)

## Test Strategy

- Unit tests for any new pure functions (3D snap, offset calculation)
- Store-level integration tests for the full place-and-merge workflow
- Component tests where feasible (snapshot/interaction tests for the placement UI)
- Manual verification: draw truss → save → place → verify in 3D

## Architecture Notes

- The placement workflow is a multi-step modal interaction: user enters "place mode," picks target edge, adjusts offset/count, previews, commits or cancels.
- 3D snap reuses the same priority pattern as 2D snap (node > midpoint > grid) adapted for Three.js raycasting.
- Preview rendering uses a separate Three.js group with transparent materials, not added to the model until commit.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [ ] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

(To be created after sprint approval.)
