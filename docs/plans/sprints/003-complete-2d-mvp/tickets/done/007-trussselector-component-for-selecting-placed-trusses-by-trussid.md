---
id: '007'
title: TrussSelector component for selecting placed trusses by trussId
status: done
use-cases:
- SUC-004
- SUC-005
- SUC-006
depends-on:
- '001'
- '006'
---

# TrussSelector component for selecting placed trusses by trussId

## Description

Create a `TrussSelector` component for the 3D viewport that lets users
click on any node or member to select its entire truss:

1. On click, check if the clicked node/member has a `trussId`.
2. If yes, set `useEditorStore.selectedTrussId` to that value.
3. Highlight all nodes and members sharing that `trussId` (e.g.,
   different color or outline).
4. Add `selectedTrussId` state to `useEditorStore`.
5. Clicking empty space or pressing Escape deselects.

## Acceptance Criteria

- [ ] Clicking a truss node/member selects the entire truss
- [ ] All nodes and members of the selected truss are visually highlighted
- [ ] `selectedTrussId` is set in the editor store
- [ ] Clicking non-truss geometry (nodes without trussId) does not crash
- [ ] Escape or clicking empty space deselects the truss

## Testing

- **Existing tests to run**: NodeMesh/MemberLine click handler tests
- **New tests to write**: TrussSelector selection logic, highlight rendering
- **Verification command**: `npm test`
