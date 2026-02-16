---
id: '001'
title: Group data model + store CRUD (addGroup, removeGroup, getGroup)
status: done
use-cases:
- SUC-005-03
depends-on: []
---

# Group data model + store CRUD (addGroup, removeGroup, getGroup)

## Description

The Group data model and basic store CRUD (addGroup, removeGroup, updateGroup,
getNodesByGroupId, getMembersByGroupId) were added in Sprint 001. This ticket
adds the missing `getGroup(id)` convenience getter and writes comprehensive
tests for all group CRUD operations, which currently have zero test coverage.

## Acceptance Criteria

- [ ] `getGroup(id)` method exists on useModelStore and returns the Group or undefined
- [ ] Unit tests cover addGroup, removeGroup, updateGroup, getGroup
- [ ] Unit tests verify removeGroup clears groupId from associated nodes and members
- [ ] Unit tests verify getNodesByGroupId and getMembersByGroupId
- [ ] All existing tests still pass (no regressions)

## Testing

- **Existing tests to run**: `cd frontend && npx vitest run`
- **New tests to write**: Add group CRUD tests to `frontend/src/store/__tests__/useModelStore.test.ts`
- **Verification command**: `cd frontend && npx vitest run`
