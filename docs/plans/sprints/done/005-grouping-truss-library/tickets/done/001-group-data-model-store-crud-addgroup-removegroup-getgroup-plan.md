---
id: '001'
title: "Group data model + store CRUD \u2014 Plan"
status: done
---

# Ticket 001 Plan: Group data model + store CRUD

## Approach

The Group data model and CRUD operations already exist from Sprint 001.
This ticket adds:

1. A `getGroup(id)` convenience getter on useModelStore (returns `Group | undefined`)
2. Comprehensive unit tests for all group operations

## Files to Modify

- `frontend/src/store/useModelStore.ts` — Add `getGroup` to interface and implementation
- `frontend/src/store/__tests__/useModelStore.test.ts` — Add group CRUD test section

## Testing Plan

Add a `// --- Groups ---` section to the existing useModelStore test file with tests for:

1. `addGroup` — appends a group to the array
2. `removeGroup` — removes the group and clears groupId on associated nodes/members
3. `updateGroup` — merges partial updates
4. `getGroup` — returns the group by ID, or undefined for missing ID
5. `getNodesByGroupId` — returns nodes whose groupId matches
6. `getMembersByGroupId` — returns members whose groupId matches

Verification: `cd frontend && npx vitest run`

## Documentation Updates

None — this is a store-level implementation detail.
