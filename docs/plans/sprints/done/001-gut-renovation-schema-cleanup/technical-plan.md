---
status: draft
---

# Sprint 001 Technical Plan

## Architecture Overview

This sprint performs a schema migration and code deletion. No new components are
added. The existing 3D viewport (Viewport3D, SceneModel, NodeMesh, MemberLine)
survives intact. The old 2D editor stack and placement pipeline are fully
removed.

```
BEFORE                              AFTER
──────                              ─────
model/schemas.ts (Node.trussId)  →  model/schemas.ts (Node.groupId, Group)
model/schemas.ts (Node.connection) → Member.end_releases (expanded)
useModelStore (truss methods)    →  useModelStore (group CRUD)
useEditorStore (selectedTrussId) →  useEditorStore (selectedGroupId)
Canvas2DEditor                   →  DELETED
useCanvas2DStore                 →  DELETED
useEditor2DStore                 →  DELETED
usePlacementStore                →  DELETED
placeShape, mergeNodes, etc.     →  DELETED
PlacementPanel, PlacementPreview →  DELETED
TargetEdgePicker                 →  DELETED
commitPlacement                  →  DELETED
```

## Files to Delete

| File | Reason |
|------|--------|
| `src/components/Canvas2DEditor.tsx` | Old 2D editor, replaced by plane-based editing |
| `src/components/PlacementPanel.tsx` | Old placement workflow UI |
| `src/components/PlacementPreview.tsx` | Old 3D placement preview |
| `src/components/TargetEdgePicker.tsx` | Old snap-edge picker |
| `src/store/useCanvas2DStore.ts` | Old 2D canvas state |
| `src/store/useEditor2DStore.ts` | Old 2D editor state |
| `src/store/usePlacementStore.ts` | Old placement state machine |
| `src/editor2d/placeShape.ts` | Old placement algorithm |
| `src/editor2d/mergeNodes.ts` | Old node merge logic |
| `src/editor2d/equalSpacing.ts` | Old equal spacing algorithm |
| `src/editor3d/commitPlacement.ts` | Old commit-to-3D logic |
| `src/editor3d/snapGroup.ts` | Old truss-level snapping |
| `src/editor3d/trussMove.ts` | Old truss-level movement |

## Component Design

### Component: Model Schema Updates (`model/schemas.ts`)

**Use Cases**: SUC-001-01, SUC-001-03

Changes:
- Remove `trussId` from `NodeSchema` and `MemberSchema`
- Add optional `groupId: z.string().optional()` to `NodeSchema` and `MemberSchema`
- Add `GroupSchema`:
  ```ts
  const GroupSchema = z.object({
    id: z.string(),
    name: z.string(),
    nodeIds: z.array(z.string()),
    memberIds: z.array(z.string()),
  })
  ```
- Add `groups: z.array(GroupSchema)` to `ProjectSchema`
- Move `connection_type` and `connection_method` from Node into Member's
  `end_releases` structure (each end gets its own connection info)

### Component: useModelStore Updates (`store/useModelStore.ts`)

**Use Cases**: SUC-001-01, SUC-001-03

Changes:
- Remove: `getNodesByTrussId`, `getMembersByTrussId`
- Add: `addGroup(name, nodeIds, memberIds)`, `removeGroup(id)`,
  `getGroup(id)`, `updateGroup(id, updates)`
- Update `loadProject` to handle new Group field
- Update `addNode`/`addMember` signatures: no more trussId parameter

### Component: useEditorStore Updates (`store/useEditorStore.ts`)

**Use Cases**: SUC-001-01

Changes:
- Rename `selectedTrussId` → `selectedGroupId`
- Rename `selectTruss` → `selectGroup`
- Update any components that reference the old names

### Component: App.tsx and Component Tree

**Use Cases**: SUC-001-02

Changes:
- Remove imports and rendering of Canvas2DEditor, PlacementPanel,
  PlacementPreview, TargetEdgePicker, TrussDragger
- Remove TrussLibraryPanel (or keep as placeholder — it will be rebuilt in
  Sprint 005)
- ShapeLibrary and TemplatePicker may remain as dead code for now (Sprint 005
  will reuse them)

## Surviving Code

These files need no changes or only minor import cleanups:
- `Viewport3D.tsx`, `SceneModel.tsx`, `NodeMesh.tsx`, `MemberLine.tsx`
- `NodeDragger.tsx` (may need trussId reference cleanup)
- `GroundPlane.tsx`, `RotateArc.tsx`, `SnapIndicators.tsx`
- `editor3d/snap3d.ts`, `editor3d/planeMove.ts`, `editor3d/planeRotate.ts`
- `io/projectFile.ts` (update for new schema)
- `model/defaults.ts`, `model/validation.ts` (update for Group)

## Open Questions

- Should ShapeLibrary/TemplatePicker be deleted now or kept as dead code for
  Sprint 005? (Recommendation: keep, they'll be adapted not rewritten)
- Should trussTemplates.ts be kept? (Recommendation: keep, Sprint 005 adapts
  them for the new workflow)
