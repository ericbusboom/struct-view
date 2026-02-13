---
id: "006"
title: MCP AI Automation and Workflow Hardening
status: planning
branch: sprint/006-mcp-ai-automation-and-workflow-hardening
use-cases: [SUC-018, SUC-019, SUC-020, SUC-021]
---

# Sprint 006: MCP AI Automation and Workflow Hardening

## Goals

Expose the full model manipulation and analysis API as MCP server tools for AI-driven automation, implement the undo/redo command stack for all model mutations, and harden the workflow with validation guardrails and improved test coverage.

## Problem

Repetitive modeling tasks (laying out studs, assigning properties to many members, adjusting spacing) are tedious via manual UI. An AI/MCP interface lets users describe these operations in natural language. Additionally, the lack of undo/redo makes experimentation risky, and edge cases around invalid model states need guardrails.

## Solution

A Python MCP server wrapping the same model mutation functions used by the UI. A command stack pattern recording every mutation for undo/redo. Validation guards rejecting invalid states (non-planar panels, STL over-complexity, incomplete models).

## Success Criteria

- AI client connects to MCP server and drives geometry edits, property assignments, load application, and analysis queries.
- All model mutations (UI and MCP) are undoable/redoable.
- Non-planar panels and overly complex STL imports are rejected.
- End-to-end test coverage for all major workflows.

## Scope

### In Scope

- Python MCP server with per-project endpoint
- MCP tools: geometry (list/add/remove/move/place/auto-layout/mirror/copy/array)
- MCP tools: properties (set material, section, support, connection)
- MCP tools: loads (apply point/distributed/area, self-weight, define cases/combinations)
- MCP tools: analysis (trigger, query results, check limits)
- Undo/redo command stack (bounded to 100 operations)
- Command objects with execute() and undo() for every mutation type
- Validation guards: non-planar panel rejection, STL complexity limit, pre-analysis validation
- Test coverage improvements
- MCP tool documentation

### Out of Scope

- Multi-user collaboration
- Building code compliance
- Result export/report generation
- Dynamic/seismic/modal analysis

## Test Strategy

- Unit tests: each Command type execute/undo
- Unit tests: command stack ordering, boundary behavior
- Unit tests: each MCP tool — valid/invalid inputs
- Unit tests: validation guards
- Integration tests: MCP client builds model, runs analysis, queries results
- Integration tests: UI mutation + undo + redo state verification
- End-to-end: replicate spec Section 5 example MCP interaction

## Architecture Notes

- MCP server is a thin wrapper over shared model mutation functions.
- Command stack is shared between UI and MCP.
- MCP tools return `{success, data?, error?}` JSON.
- Per-project MCP endpoint.
- Tool schemas auto-documented from Python type annotations.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [ ] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

(To be created after sprint approval.)
