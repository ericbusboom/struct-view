# StructView Project Overview

## Project Name
StructView: AI-Powered Structural Analysis Tool

## Problem Statement
Existing structural analysis tools are hard for non-experts to use and have a steep workflow burden for early-stage design. Students, makers, and small contractors need a simpler way to model common structures, assign realistic properties and loads, and run structural checks without full professional CAD/FEA complexity.

StructView addresses this by combining constrained geometry workflows (2D drawing + snap-guided 3D placement + STL reference snapping), practical structural inputs, and an AI/MCP interface for repetitive modeling tasks.

## Target Users
- Students learning structural engineering fundamentals
- Makers and DIY builders designing sheds, garages, decks, and similar structures
- Small contractors doing preliminary structural checks
- Educators teaching beam/truss/frame analysis

## Key Constraints
- Web-based, free-to-use first release
- Single-user editing only (no real-time collaboration)
- Primary analysis scope: linear static + basic P-delta
- No building-code compliance automation and no stamped drawing workflow
- Panels may use simplified behavior depending on native solver support
- Metric storage internally; UI must support both metric and imperial input/display with stable round-tripping

## High-Level Requirements
1. Users can build structural wireframes using 2D drawing, direct 3D member drawing, and STL-assisted snapping.
2. Users can define member material/section and node support/connection behavior.
3. Users can create panels from closed loops or boundary beam selections.
4. Users can apply point, distributed, area, and self-weight loads with load cases/combinations.
5. Users can run server-side analysis (PyNite backend) and view deflection/force/reaction results.
6. Users can define deflection limits and identify over-limit members.
7. Users can automate model changes via per-project MCP server tools.
8. All model mutations are undoable/redoable.
9. Project data is JSON import/export friendly.

## Technology Stack
- Frontend: React + Three.js
- 2D Editor: HTML Canvas or SVG-based editor
- Backend API: Python (FastAPI preferred)
- Solver: PyNite
- Section calculations: `sectionproperties` (Python)
- Material/section data: JSON or SQLite
- AI tooling: Python MCP server (per-project endpoint)
- Hosting target: static frontend + serverless Python backend

## Sprint Roadmap
The roadmap is intentionally phased so each sprint delivers visible, testable capability while increasing complexity.

### Sprint 001: Foundational Viewer + Core Data Model
- Establish project skeleton (frontend + backend services + shared model schema)
- Implement 3D viewport baseline with node/member rendering
- Implement canonical JSON model format for Node/Member/Panel/Load
- Add basic create/move/delete for nodes and members
- Deliverable: user can build and inspect a simple wireframe in browser and persist model JSON

### Sprint 002: 2D Drawing + 2D-to-3D Placement
- Build 2D truss/frame drawing tool with aggressive snapping
- Save named 2D shapes and designate snap edge
- Place 2D shapes into 3D scene as rigid units with node merge at coincidences
- Deliverable: user can draft reusable truss in 2D and place repeated instances in 3D

### Sprint 003: STL Reference + Advanced Snapping + Auto-Layout
- Implement STL import/render as non-structural reference shell
- Build snap targets (vertex/edge/face nearest-point)
- Add direct 3D beam draw snapping against STL and existing model
- Implement first auto-layout pattern (studs or joists with user spacing)
- Deliverable: user can scaffold framing directly from reference geometry

### Sprint 004: Properties, Supports, Loads, and Load Cases
- Material/section assignment UI and backing data store
- Node support and connection assignment
- Point/distributed/area load tools + self-weight toggle
- Load case and combination management
- Deliverable: user can produce an analyzable structural model with realistic assignments

### Sprint 005: Analysis Pipeline + Results Visualization
- Backend model-to-PyNite translation and analysis execution
- Return/store result envelopes by case/combination
- Visualizations: deflected shape, moment/shear/axial diagrams, reactions
- Deflection limit checks with highlighting
- Deliverable: user can run analysis and inspect key engineering outputs

### Sprint 006: MCP/AI Automation + Workflow Hardening
- Expose MCP tools for geometry edits, bulk property assignment, load operations, and analysis queries
- Implement undo/redo command stack for all model mutations
- Add guardrails for invalid/non-planar panels and overly complex STL imports
- Improve reliability, test coverage, and docs for reproducible iterative usage
- Deliverable: user can drive repetitive modeling and analysis tasks through natural-language AI clients

## Out of Scope (V1)
- Building code compliance automation
- Permit-ready documentation and stamped engineering output
- Full BIM workflows/interoperability
- Multi-user real-time collaboration
- Dynamic/modal/seismic/frequency-response analysis
- Advanced nonlinear material behavior
- Robust result export/report generation beyond basic in-app views
