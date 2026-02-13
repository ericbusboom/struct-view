---
id: "005"
title: Analysis Pipeline and Results Visualization
status: planning
branch: sprint/005-analysis-pipeline-and-results-visualization
use-cases: [SUC-015, SUC-016, SUC-017]
---

# Sprint 005: Analysis Pipeline and Results Visualization

## Goals

Connect the frontend model to the PyNite backend solver, run linear static and P-delta analyses, and deliver interactive results visualization including deflected shapes, force diagrams, reactions, and deflection limit checks.

## Problem

Users have a fully defined structural model (geometry + properties + loads) but cannot yet determine whether the structure is adequate. They need FEA results to identify deflection issues and understand force flow.

## Solution

A stateless FastAPI backend that receives model JSON, translates it to a PyNite FEModel3D, runs analysis, and returns sampled results. The frontend renders results as 3D overlays with interactive controls for result type, scale, and load case filtering.

## Success Criteria

- Analysis completes and returns results for valid models.
- Invalid models produce clear, actionable error messages.
- Deflected shape, moment/shear/axial diagrams, and reactions display correctly.
- Deflection limit checks highlight over-limit members.
- Results filter by load case/combination.

## Scope

### In Scope

- FastAPI backend endpoint: model JSON in, results JSON out
- Model-to-PyNite translation (all entity types)
- Linear static analysis
- P-delta (second-order) analysis with convergence error handling
- Result sampling: 21 stations per member
- Envelope results across combinations (server-side)
- Deflected shape overlay with exaggeration scale and color gradient
- Bending moment, shear force, and axial force diagrams
- Reaction force arrows at supports with magnitude labels
- Deflection limit configuration and over-limit highlighting
- Result filtering by load case/combination

### Out of Scope

- Dynamic, modal, seismic, or frequency-response analysis
- Result export/report generation
- MCP query of results
- Streaming results

## Test Strategy

- Unit tests: model-to-PyNite translator for all entity types
- Unit tests: result extractor — station sampling, envelope computation
- Unit tests: deflection limit checker — L/N calculation, threshold comparison
- Integration tests: simple beam with known analytical solution
- Integration tests: simple truss — axial forces match hand calculation
- Integration tests: invalid model returns proper error
- UI tests: each visualization renders without errors
- Performance: 100-member model analysis + round-trip < 5 seconds

## Architecture Notes

- Backend is stateless: no server-side model persistence.
- PyNite model construction validates inputs; clear errors for invalid models.
- 21 stations per member for smooth diagram rendering.
- Frontend caches results keyed by model hash; invalidated on edit.
- P-delta convergence failure returns explicit error, no silent fallback.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [ ] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

(To be created after sprint approval.)
