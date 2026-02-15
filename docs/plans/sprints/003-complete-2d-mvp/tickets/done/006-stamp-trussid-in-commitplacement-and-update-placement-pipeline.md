---
id: '006'
title: Stamp trussId in commitPlacement and update placement pipeline
status: done
use-cases:
- SUC-004
- SUC-005
- SUC-006
depends-on:
- '001'
---

# Stamp trussId in commitPlacement and update placement pipeline

## Description

Update the placement pipeline so every placed truss is trackable:

1. In `commitPlacement()`, generate a `trussId` via `nanoid()`.
2. Stamp every node and member created during placement with that `trussId`.
3. Ensure the `trussId` survives JSON export/import (already handled by
   schema changes in ticket 001).
4. Update `placeShape()` and `placeEqualSpacing()` to accept and pass
   through the `trussId`.
5. Remove the existing `mergeCoincidentNodes()` call — nodes should not
   be merged (co-location only).

## Acceptance Criteria

- [ ] Every node created by placement has a `trussId`
- [ ] Every member created by placement has a `trussId`
- [ ] Multiple placements produce distinct `trussId` values
- [ ] Equal-spacing placements each get their own `trussId`
- [ ] No node merging occurs during placement
- [ ] `trussId` round-trips through JSON export/import

## Testing

- **Existing tests to run**: commitPlacement tests, placeShape tests
- **New tests to write**: Verify trussId stamping, verify no merge
- **Verification command**: `npm test`
