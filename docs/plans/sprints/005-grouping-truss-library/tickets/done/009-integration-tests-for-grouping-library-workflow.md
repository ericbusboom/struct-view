---
id: '009'
title: Integration tests for grouping + library workflow
status: done
use-cases: []
depends-on: ["006", "007", "008"]
---

# Integration tests for grouping + library workflow

## Description

End-to-end integration tests covering the full Sprint 005 workflow:
group creation, save to library, place from library as group,
template generation, and the complete draw-save-place pipeline.

## Acceptance Criteria

- [x] Group creation workflow tested (create group, set groupId, remove group)
- [x] Save to library workflow tested (plane filtering, Shape2D creation)
- [x] Place from library workflow tested (plane placement, unique IDs, offset)
- [x] End-to-end draw-save-place test across two planes
- [x] Template generation to library tested
- [x] All 317 tests pass (307 existing + 10 new)

## Testing

- **New tests**: `sprint-005-grouping/workflow.test.ts` (10 tests)
- **Verification command**: `cd frontend && npx vitest run`
