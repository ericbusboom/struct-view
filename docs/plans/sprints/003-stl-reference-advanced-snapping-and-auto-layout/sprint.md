---
id: "003"
title: STL Reference, Advanced Snapping, and Auto-Layout
status: planning
branch: sprint/003-stl-reference-advanced-snapping-and-auto-layout
use-cases: [SUC-007, SUC-008, SUC-009]
---

# Sprint 003: STL Reference, Advanced Snapping, and Auto-Layout

## Goals

Enable users to import STL reference geometry and use it as a snapping target for beam placement. Deliver the first auto-layout pattern for repetitive framing (studs/joists at user-specified spacing).

## Problem

Users often have a 3D envelope shape (from Tinkercad, Fusion 360, etc.) and need to fill it with structural framing. Manually placing each beam by coordinate is slow and error-prone. They need snap-to-surface placement and automated layout patterns.

## Solution

STL import with spatial indexing for fast snap queries, semi-transparent rendering as a reference shell, 3D beam drawing with STL snapping, and an auto-layout engine that generates beams on selected STL faces at user-specified spacing.

## Success Criteria

- User can import an STL and see it rendered semi-transparently.
- Beam endpoints snap to STL vertices, edges, and faces during 3D drawing.
- Auto-layout generates correctly spaced studs/joists on a selected STL face.
- Overly complex STL files are rejected with helpful guidance.

## Scope

### In Scope

- STL file import (binary and ASCII), parsing, vertex/edge extraction
- Mesh simplification and triangle count limit (100k)
- Spatial index (octree or BVH) for snap queries
- Semi-transparent Three.js mesh rendering with visibility toggle
- 3D beam drawing with snap-to-STL (vertex, edge, face, nearest-point)
- Snap priority: vertex > edge > face > grid
- Auto-layout: face selection, pattern choice (studs/joists), spacing input, beam generation
- Perimeter beams along face edges during auto-layout

### Out of Scope

- Panel creation
- Material/section assignment
- Load application or analysis
- MCP automation of auto-layout

## Test Strategy

- Unit tests: STL parser (binary and ASCII), vertex/edge extraction
- Unit tests: spatial index queries (nearest vertex, edge, face)
- Unit tests: auto-layout beam generation (spacing, boundary)
- Integration tests: import STL, draw beam with snapping, verify coordinates
- Integration tests: auto-layout on rectangular face, verify beam count/positions
- Performance tests: snap query < 16ms for meshes up to 100k triangles

## Architecture Notes

- STL processing in a web worker to avoid blocking UI.
- Spatial index rebuilt on project load (not serialized).
- Auto-layout outputs standard Node/Member entities.
- 100k triangle limit with clear error messaging.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [ ] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Planned Tickets (from TODOs)

These items should become tickets during the ticketing phase:

1. **STL import scale correction** — AABB display, user-editable dimension for uniform scale correction, stored scale factor. See `docs/plans/todo/done/stl-import-scale-correction.md`.
2. **Demonstration STL test fixtures** — Use `data/Cabinet.stl` and `data/cube.stl` as test fixtures and demo assets for STL import/rendering/snapping. See `docs/plans/todo/done/demonstration-stl-files-in-data-directory.md`.

## Tickets

(To be created after sprint approval.)
