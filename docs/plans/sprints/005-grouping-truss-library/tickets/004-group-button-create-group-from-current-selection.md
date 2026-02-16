---
id: "004"
title: Group button — create group from current selection
status: done
use-cases: [SUC-005-03]
depends-on: ["001", "002"]
---

# Group button — create group from current selection

## Description

Add a GroupPanel sidebar component that shows existing groups and provides
a "+ Group" button to create a group from the current node selection. The
panel lists groups with name and member count, highlights the selected group,
and provides a delete button per group.

## Acceptance Criteria

- [x] GroupPanel appears in the sidebar between PropertiesPanel and TrussLibraryPanel
- [x] "+ Group" button is enabled when nodes are selected
- [x] Creating a group captures selected nodeIds and enclosed memberIds
- [x] Group nodes and members get their groupId set
- [x] Click a group in the list to select it (highlights all members)
- [x] Delete button removes the group and clears groupIds
- [x] All existing tests still pass

## Testing

- **Existing tests to run**: `cd frontend && npx vitest run`
- **Verification command**: `cd frontend && npx vitest run`
