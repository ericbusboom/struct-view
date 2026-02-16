---
id: "007"
title: Unit Display: Imperial and Metric
status: planning
branch: sprint/007-unit-display-imperial-and-metric
use-cases: []
---

# Sprint 007: Unit Display: Imperial and Metric

## Goals

Add unit awareness throughout the application. After this sprint the user can
choose between metric and imperial display, enter values in either system, and
round-trip between them without precision loss.

## Problem

All values are currently raw numbers with no unit awareness. The spec (Section
12.2) requires: "The UI supports both imperial and metric input/display. When
the user enters imperial values, the original imperial value is stored alongside
the metric conversion so that round-tripping is exact."

## Solution

1. Per-project display unit preference (metric or imperial).
2. Input fields accept both unit systems (auto-detect or explicit suffix).
3. Store original imperial value alongside metric conversion for exact
   round-tripping.
4. Display coordinates, lengths, and properties in the chosen unit system.
5. Coordinate display in 2D and 3D editors respects this setting.

## Success Criteria

- User can toggle between metric and imperial display
- Entering an imperial value (e.g., `6'2"`) stores both imperial and metric
- Switching back to imperial shows the original value without rounding artifacts
- All coordinate displays, sidebar fields, and property panels use the chosen unit

## Scope

### In Scope

- Unit preference setting (per-project)
- Dual-storage model for round-trip fidelity
- Input parsing for imperial notation (feet-inches, decimal feet)
- Display formatting for both unit systems
- Coordinate display integration (sidebar, 2D overlay, properties panel)

### Out of Scope

- Unit-aware structural analysis (loads, stresses — future sprint)
- Building code unit requirements
- Batch unit conversion of existing projects

## Test Strategy

- **Unit tests**: Imperial/metric parsing, conversion, round-trip fidelity
- **Unit tests**: Display formatting (significant digits, unit suffixes)
- **Integration tests**: Change unit preference, verify all displays update
- **Manual verification**: Enter imperial values, switch to metric and back,
  verify no precision loss

## Architecture Notes

- The dual-storage model stores `{ metric: number, imperial?: string }` so
  that imperial values preserve the original user input exactly.
- A `UnitContext` or Zustand store holds the active unit preference.
- All display components read from the unit store and format accordingly.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [ ] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

(To be created after sprint approval.)
