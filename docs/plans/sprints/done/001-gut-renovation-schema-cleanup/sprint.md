---
id: '001'
title: "Gut Renovation \u2014 Schema + Cleanup"
status: done
branch: sprint/001-gut-renovation-schema-cleanup
use-cases: []
---

# Sprint 001: Gut Renovation — Schema + Cleanup

## Goals

Prepare the codebase for the new plane-based editing workflow by deleting
obsolete code, updating data schemas, and getting the build and tests green.
After this sprint the app still renders the 3D viewport with nodes and members,
but the old 2D Canvas editor, placement pipeline, and truss-ID grouping are
gone.

## Problem

The spec (Section 3) has been rewritten to replace the old 2D Canvas truss
editor + snap-edge placement pipeline with a plane-based workflow: select planes
in 3D, focus on them as orthogonal 2D views, and draw directly on them. Nodes
are now shared (one per point in space), connection info moves to beam ends, and
trussId is replaced by groups.

Roughly 25% of the current code is obsolete under the new spec and needs to be
deleted. Another 30% needs schema changes (removing trussId, adding groupId,
adding Group entity, moving connection info). The build must be clean before any
new features land.

## Solution

1. Delete obsolete files: Canvas2DEditor, placement pipeline (placeShape,
   mergeNodes, equalSpacing, commitPlacement), PlacementPanel,
   PlacementPreview, TargetEdgePicker, usePlacementStore, useCanvas2DStore,
   useEditor2DStore.
2. Remove `trussId` from Node and Member schemas; add optional `groupId`.
3. Add a `Group` type to the model (id, name, nodeIds, memberIds).
4. Move connection info (connection_type, connection_method) from Node to
   Member end_releases.
5. Update useModelStore: remove truss methods (getNodesByTrussId,
   getMembersByTrussId), add group CRUD (addGroup, removeGroup, getGroup).
6. Update useEditorStore: selectedTrussId → selectedGroupId.
7. Delete obsolete tests, update remaining tests for the new schema.
8. Verify clean `tsc` build and all tests pass.

## Success Criteria

- `tsc -b` produces zero errors
- `npx vitest run` passes all tests
- 3D viewport renders a sample model (nodes as spheres, members as tubes)
- No references to trussId, Canvas2DEditor, placeShape, mergeNodes,
  equalSpacing, commitPlacement, PlacementPanel, or usePlacementStore remain
- Group CRUD works in useModelStore (unit tested)

## Scope

### In Scope

- Deleting obsolete files and dead imports
- Schema changes (Node, Member, Group, Project)
- Store refactoring (useModelStore, useEditorStore)
- Test cleanup and updates
- Build verification

### Out of Scope

- New UI features (plane selection, 2D drawing, etc.)
- New components — this sprint only deletes and modifies
- Backend/solver changes
- Truss library changes (deferred to Sprint 005)

## Test Strategy

- **Unit tests**: Group CRUD on useModelStore, schema validation with new
  fields, end_releases on Member
- **Build verification**: `tsc -b` and `vite build` must pass clean
- **Regression**: 3D viewport still renders nodes and members after all
  deletions

## Architecture Notes

- Shape2D type survives (truss library still uses it) but gains `placementPlane`
  field already added in prior work.
- The `Group` type is a lightweight reference container (nodeIds, memberIds) —
  it does not own the entities, just references them.
- Connection info on Node (connection_type, connection_method) moves to Member's
  existing end_releases structure.

## Definition of Ready

Before tickets can be created, all of the following must be true:

- [x] Sprint planning documents are complete (sprint.md, use cases, technical plan)
- [ ] Architecture review passed
- [ ] Stakeholder has approved the sprint plan

## Tickets

1. Delete obsolete files (placement pipeline, mergeNodes, equalSpacing, commitPlacement, old placement components)
2. Remove trussId from Node/Member schemas; add groupId field
3. Add Group schema to model (id, name, nodeIds, memberIds)
4. Move connection info from Node to Member end_releases
5. Update useModelStore (remove truss methods, add group CRUD)
6. Update useEditorStore (selectedTrussId → selectedGroupId)
7. Delete obsolete tests; update remaining tests for new schema
8. Verify clean tsc build + all tests pass
