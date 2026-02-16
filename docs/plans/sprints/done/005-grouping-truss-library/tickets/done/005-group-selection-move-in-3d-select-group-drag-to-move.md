---
id: "005"
title: Group selection + move in 3D (select group, drag to move)
status: done
use-cases: [SUC-005-04]
depends-on: ["004"]
---

# Group selection + move in 3D (select group, drag to move)

## Description

Clicking a node that belongs to a group selects the entire group (via
selectGroup in NodeMesh). TrussDragger handles dragging — when a group is
selected and mode is 'move', dragging translates all group nodes together
with plane-constrained movement and snap-on-release. Both components were
implemented in prior sprints.

## Acceptance Criteria

- [x] Clicking a grouped node selects the entire group
- [x] All group members highlight on selection (cyan)
- [x] Dragging in move mode moves all group nodes together
- [x] Movement is constrained to the active plane
- [x] Snap-on-release aligns group to nearby nodes
- [x] Existing tests cover group snap logic (snapGroup.test.ts)

## Testing

- **Existing tests**: `snapGroup.test.ts`, `editorCommands.test.ts`
- **Verification command**: `cd frontend && npx vitest run`
