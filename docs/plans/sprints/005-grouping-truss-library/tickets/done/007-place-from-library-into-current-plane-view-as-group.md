---
id: '007'
title: Place from library into current plane view as group
status: done
use-cases: []
depends-on:
- '006'
---

# Place from library into current plane view as group

## Description

Wire up the "Add to 3D" button in TrussCard/TrussLibraryPanel to place
a Shape2D from the library onto the active working plane. Uses
placeShapeOnPlane to create 3D nodes/members, wraps them in a group,
and selects the new group.

## Acceptance Criteria

- [x] "Add to 3D" button calls placeShapeOnPlane with the active plane
- [x] New nodes and members are added to the model store
- [x] A group is created containing the placed nodes and members
- [x] groupId is set on all placed nodes and members
- [x] The new group is selected after placement
- [x] All existing tests pass (307)

## Testing

- **Verification command**: `cd frontend && npx vitest run`
