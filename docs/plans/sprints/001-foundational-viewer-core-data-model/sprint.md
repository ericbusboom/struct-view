---
id: "001"
title: Foundational Viewer and Core Data Model
status: planning
branch: sprint/001-foundational-viewer-core-data-model
use-cases: [SUC-001, SUC-002, SUC-003]
---

# Sprint 001

## Goal
Deliver the first visible, testable StructView increment: a browser-based 3D wireframe viewer with core structural model entities and basic node/member editing.

## Scope
- Project skeleton for frontend and backend with shared schema contracts
- 3D scene with rendering of nodes and members
- Core JSON data model for Node, Member, Panel, and Load entities
- Basic model editing operations for nodes and members (create, move, delete)
- Save/load project JSON in local workflow

## Non-Goals
- 2D drawing mode
- STL import/snapping
- Property assignment UI
- Load application UI
- FEA analysis execution and results
- MCP automation

## Architecture Review Notes
- Use a shared schema package to prevent frontend/backend drift.
- Keep editor operations command-oriented so undo/redo can be layered later.
- Define unit conversion boundaries now (store metric internally, format at UI edges).

## Exit Criteria
- User can create a small wireframe frame/truss directly in 3D.
- Model persists and reloads as canonical JSON.
- Core model invariants validated (member endpoints reference valid nodes).
- Basic automated tests pass in CI.
