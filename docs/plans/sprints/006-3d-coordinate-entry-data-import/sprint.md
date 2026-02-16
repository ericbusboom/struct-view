---
id: "006"
title: 3D Coordinate Entry + Data Import
status: planning
branch: sprint/006-3d-coordinate-entry-data-import
use-cases: []
---

# Sprint 006: 3D Coordinate Entry + Data Import

## Goals

Add direct coordinate entry and bulk data import capabilities. After this sprint
the user can create nodes by typing x, y, z coordinates in the sidebar, edit
existing node positions via the sidebar, and import point clouds from CSV or
text files.

This completes the geometry input methods defined in the spec, giving users
three complementary ways to create geometry: 2D plane drawing (Sprints 002-004),
library placement (Sprint 005), and direct coordinate entry / import (this
sprint).

## Problem

Some workflows are more efficient with direct coordinate input than mouse-based
drawing:
- Importing surveyed points from a CSV file
- Entering precise coordinates from engineering drawings
- Adjusting node positions by exact amounts (+/- relative offsets)

Sprint 003 added basic coordinate display and editing for selected nodes. This
sprint extends that into a full coordinate entry system with node creation and
file import.

## Solution

1. Sidebar coordinate entry box with x, y, z fields.
2. Pressing Return after entering coordinates creates a new node and clears
   the fields for the next entry.
3. Selecting a node populates the entry box with its coordinates; editing
   updates the node in place.
4. +/- relative adjustment expressions (type `+5` to shift by 5).
5. CSV file import (with or without header row).
6. Text file import (space or comma separated x y z per line).
7. Integration tests.

## Success Criteria

- User can type x, y, z values and press Return to create a node
- Entry box clears after creation for rapid sequential entry
- Selecting a node fills the entry box; editing updates the node
- Typing `+5` in the x field adds 5 to the current x value
- Typing `-2.5` in the y field subtracts 2.5 from y
- User can import a CSV file with x, y, z columns (header or headerless)
- User can import a text file with space/comma-separated x y z per line
- Imported points appear as nodes in the 3D viewport

## Scope

### In Scope

- Coordinate entry box in sidebar (x, y, z fields)
- Node creation via Return key
- Node editing via selection + field editing
- +/- relative adjustment parsing
- CSV file import
- Text file import
- Integration tests

### Out of Scope

- Beam creation from coordinate entry (user creates nodes, then connects
  with `b` key in a plane view or via MCP tools)
- Coordinate units conversion (imperial/metric switching — Sprint 007)
- Batch node editing (select multiple nodes and shift all by same amount)

## Test Strategy

- **Unit tests**: Coordinate parsing (+5, -3.2, absolute values), CSV parsing,
  text file parsing
- **Unit tests**: Import validation (handle malformed rows, missing values,
  non-numeric data)
- **Integration tests**: Enter coordinates, verify node created at correct
  position. Import a CSV, verify correct number of nodes at correct positions.
- **Manual verification**: Rapid sequential entry (Return, type, Return),
  node selection fills sidebar, +/- adjustment works visually

## Architecture Notes

- The CoordinatePanel from Sprint 003 is extended with "create" mode (no node
  selected = entry mode, Return creates a node) vs "edit" mode (node selected =
  editing mode, changes update the node).
- File import uses the browser's File API (input type="file"). Parsing is done
  client-side. No backend needed.
- CSV parsing handles: with/without header, comma-separated, quoted values.
  A lightweight parser (no external dependency) handles the common cases.
- Text file parsing: split lines, split each line by comma or whitespace,
  parse three numbers, skip malformed lines with a warning.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [x] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

1. Sidebar coordinate entry box (x, y, z fields)
2. Create new node via coordinate entry (Return to add)
3. Select node, populate entry box, edit in place
4. +/- relative adjustment expressions
5. CSV file import (with or without header)
6. Text file import (space/comma separated x y z per line)
7. Integration tests for coordinate entry + import
8. Sidebar property editor with beam length setting
