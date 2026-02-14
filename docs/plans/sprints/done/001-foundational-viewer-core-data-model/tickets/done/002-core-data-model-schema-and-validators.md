---
id: '002'
title: Core data model schema and validators
status: done
use-cases:
- SUC-001
- SUC-002
depends-on:
- '001'
---

# Core data model schema and validators

## Description

Define the canonical data model for the structural project: Node, Member, Panel, Load, and Project (top-level container). Implement TypeScript interfaces/types and runtime validation functions. All internal units are metric (meters, Newtons, Pascals). This schema is the single source of truth used by both frontend and backend.

## Implementation Notes

- TypeScript interfaces matching the spec's data model (Section 9):
  - `Node`: id, position {x,y,z}, support, connection_type, connection_method, tags
  - `Member`: id, start_node, end_node, material, section, end_releases, tags
  - `Panel`: id, node_ids, material, side, tags
  - `Load`: id, case, type, target, magnitude, direction, position, start/end_magnitude
  - `Project`: id, name, nodes[], members[], panels[], loads[], load_cases[], combinations[]
- Validation functions:
  - Node IDs unique
  - Member endpoints reference existing node IDs
  - Panel node_ids reference existing node IDs (minimum 3)
  - Load targets reference existing member/panel IDs
  - All numeric fields are finite numbers
- Consider using Zod for runtime validation with TypeScript type inference

## Acceptance Criteria

- [ ] All entity types have TypeScript interfaces
- [ ] `validateProject(project)` returns errors for invalid models
- [ ] Invalid member references (non-existent node IDs) are caught
- [ ] Duplicate node IDs are caught
- [ ] Empty/minimal valid project passes validation

## Testing

- **Existing tests to run**: None
- **New tests to write**: Unit tests for each validation rule — valid cases pass, invalid cases return specific errors
- **Verification command**: `npm test`
