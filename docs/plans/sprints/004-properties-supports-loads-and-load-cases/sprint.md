---
id: "004"
title: Properties, Supports, Loads, and Load Cases
status: planning
branch: sprint/004-properties-supports-loads-and-load-cases
use-cases: [SUC-010, SUC-011, SUC-012, SUC-013, SUC-014]
---

# Sprint 004: Properties, Supports, Loads, and Load Cases

## Goals

Enable users to fully define a structural model ready for analysis: assign materials and sections to members, set supports and connections at nodes, create panels, apply loads, and organize loads into cases and combinations.

## Problem

After Sprint 003, users can build geometry but cannot assign the engineering properties needed for analysis. Without materials, sections, supports, and loads, the model is just a wireframe with no physical meaning.

## Solution

Built-in material and section databases, property assignment UI, node support/connection configuration, panel creation tools, load application tools, and load case/combination management. Imperial/metric dual-value storage for round-trip fidelity.

## Success Criteria

- User can assign materials and sections from built-in databases or custom definitions.
- User can set support types and connection types on nodes.
- User can create panels via closed-loop and select-and-sheet methods.
- User can apply point, distributed, and area loads.
- User can define load cases and combinations with factors.
- Imperial/metric toggle works without conversion drift.

## Scope

### In Scope

- Material database (steel grades, lumber species/grades, aluminum, concrete)
- Section database (W-shapes, HSS, channels, angles, lumber nominal, pipe)
- Material/section assignment UI with search and custom entry
- Node support assignment (fixed, pinned, roller, spring)
- Node connection types (rigid, pinned, semi-rigid) and connection method metadata
- Panel creation: closed-loop tool and select-and-sheet method
- Panel properties: material, thickness, orientation
- Point loads, distributed loads, area loads, self-weight toggle
- Load case and combination management
- Imperial/metric dual-value storage and display toggle

### Out of Scope

- Running analysis or displaying results
- MCP automation of property/load assignment
- Building code compliance checks
- Custom section calculations via `sectionproperties`

## Test Strategy

- Unit tests: material/section database validation, unit conversion round-trip
- Unit tests: coplanarity check, end release computation, self-weight calculation
- Integration tests: assign properties, save/reload, verify persistence
- Integration tests: create panels, apply loads, define cases/combinations
- UI tests: property panel renders, load visualization displays

## Architecture Notes

- Material and section databases are static JSON bundled with the frontend.
- Member end releases derived from node connection types at analysis time.
- Imperial values stored as `{value, unit, metric}` for round-trip fidelity.
- Panel boundary nodes must be coplanar within 10mm tolerance.
- Load combinations store factor references to load cases, not duplicated loads.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [ ] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

(To be created after sprint approval.)
