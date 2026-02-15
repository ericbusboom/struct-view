---
status: draft
---

# Sprint 003 Technical Plan

## Architecture Overview

This sprint modifies the frontend layout, replaces the full-screen 2D
editor with a pop-up modal, adds a persistent truss library panel, and
introduces 3D manipulation tools (plane-constrained move, rotate, and
rotate-around-node). No backend changes are required.

```
App.tsx
├── Header
│   ├── EditorToolbar (existing + new move/rotate tools)
│   ├── "Add a Truss" button (replaces "2D Editor")
│   ├── PlaneSelector (new: XY / XZ / YZ toggle)
│   └── FileToolbar
├── Main (flex row)
│   ├── Viewport3D (existing, flex-grow)
│   │   ├── SceneModel (existing)
│   │   ├── TrussSelector (new: click to select placed truss group)
│   │   ├── MoveGizmo (new: plane-constrained drag handle)
│   │   ├── RotateArc (new: on-screen rotation arc widget)
│   │   └── SnapIndicators (new: highlight nearby snap candidates)
│   └── TrussLibraryPanel (new: right-side docked panel)
│       └── TrussCard[] (thumbnail + edit/place actions)
├── Canvas2DEditorPopup (refactored from Canvas2DEditor)
│   ├── Plane selector (XZ / XY / YZ)
│   └── Canvas (repositioned origin)
└── PlacementPanel (existing, activated from truss card)
```

## Data Model Changes

### Shape2D schema extension

Add a `placementPlane` field to `Shape2D`:

```typescript
// model/schemas.ts
type PlacementPlane = "XZ" | "XY" | "YZ";

interface Shape2D {
  id: string;
  name: string;
  nodes: Shape2DNode[];
  members: Shape2DMember[];
  placementPlane: PlacementPlane; // NEW — default "XZ"
}
```

### Truss instance tracking

After placement, a truss's nodes and members are currently dissolved into
the flat model arrays and their truss origin is lost. To enable selecting
and moving/rotating a placed truss as a unit — and to survive
export/import — each node and member needs to know which truss (if any)
it belongs to.

Approach: add an optional `trussId` field to `Node` and `Member`:

```typescript
// model/schemas.ts
interface Node {
  id: string;
  x: number; y: number; z: number;
  trussId?: string;          // NEW — which truss placed this node
}

interface Member {
  id: string;
  startNode: string;
  endNode: string;
  trussId?: string;          // NEW — which truss placed this member
}
```

This is lightweight, survives JSON round-trips, and allows us to select
all nodes/members sharing a `trussId` to treat them as a group for
move/rotate without a separate `TrussGroup` array.

`commitPlacement()` generates a `trussId` (nanoid) and stamps it on every
node and member it creates.

### Node co-location (no auto-merge)

Nodes are **never** automatically merged, even when coincident. Multiple
nodes can occupy the same position, each belonging to different trusses
or having different connection behaviors. For example, four coincident
nodes might form two independent pin connections.

During move/rotate, snap indicators show when a truss node is near an
existing model node, and the truss snaps to align positions — but the
nodes remain separate entities. Connection behavior between co-located
nodes is a separate concept (out of scope for this sprint; belongs to
the connections/supports sprint).

## Component Design

### Component: Canvas2DEditorPopup (refactor of Canvas2DEditor)

**Use Cases**: SUC-001, SUC-003

Refactor the existing `Canvas2DEditor` from a full-screen fixed overlay
into a pop-up modal:

- **CSS**: Change from `position: fixed; inset: 0` to a fixed-size
  modal that takes up most of the screen (e.g., 80% width, 85% height),
  centered, with a semi-transparent backdrop. Not resizable.
- **Origin positioning**: On open, compute initial camera offset so the
  canvas origin (0, 0) appears in the lower-left region. Target: origin
  is at roughly (10% from left, 10% from bottom) of the canvas area.
  This means `camera.offsetX` and `camera.offsetY` are set so that the
  world origin maps to that screen position.
- **Plane selector**: Add a 3-button toggle (XZ / XY / YZ) in the
  editor toolbar. Default is XZ. The selected value is saved to
  `Shape2D.placementPlane`.

Key changes to `useCanvas2DStore`:
- `open()` → compute initial camera offset for lower-left origin.
- Store dimensions so the offset calculation is responsive.

### Component: TrussLibraryPanel (new)

**Use Cases**: SUC-002

A new component docked on the right side of the main layout:

- **Width**: Fixed ~240px, scrollable vertically.
- **Content**: One `TrussCard` per saved shape in `useModelStore.shapes[]`.
- **Empty state**: "No trusses yet. Click Add a Truss to get started."

### Component: TrussCard (new)

**Use Cases**: SUC-002

Each card shows:
- **Thumbnail**: A small canvas (or SVG) rendering of the shape's nodes
  and members, auto-fitted to the card bounds.
- **Name**: The shape name, editable on click.
- **Actions**: "Edit" button (re-opens pop-up editor with this shape
  loaded) and "Add to 3D" button (starts placement workflow).

Thumbnail rendering: Use a small off-screen canvas or inline SVG. Compute
bounding box of all shape nodes, apply uniform scale + center to fit a
~200x120 area.

### Component: PlaneSelector (new)

**Use Cases**: SUC-003, SUC-004, SUC-005, SUC-006

A 3-button toggle group (XY, XZ, YZ) usable in two contexts:
1. Inside the 2D editor (sets `placementPlane` on the shape).
2. In the 3D toolbar (sets the active manipulation plane for move/rotate).

State: `useEditorStore.activePlane: PlacementPlane` (default "XZ").

### Component: TrussSelector (new)

**Use Cases**: SUC-004, SUC-005, SUC-006

Handles clicking on nodes/members in the 3D viewport and resolving which
truss they belong to (via `trussId`). When a truss is selected:
- All nodes and members sharing that `trussId` are highlighted.
- Move/rotate tools become available.

State: `useEditorStore.selectedTrussId: string | null`.

### Component: MoveGizmo (new)

**Use Cases**: SUC-004

A Three.js overlay that appears when a truss group is selected and the
move tool is active:

- Renders a translucent plane quad at the truss centroid, oriented to the
  active plane, as a visual indicator.
- On pointer down + drag: raycast against the constraint plane, compute
  delta from drag start, translate all group nodes by delta.
- Arrow keys: translate by grid increment (e.g., 0.1 units) along the
  two axes of the selected plane.
- During drag, run snap detection against all nodes not in the same
  truss. If any truss node is within snap threshold of a model node,
  show snap indicator and apply positional snap (no merge).

### Component: RotateArc (new)

**Use Cases**: SUC-005, SUC-006

A Three.js overlay for rotation:

- Renders a torus arc (partial ring) around the pivot point, oriented in
  the active plane.
- Default pivot: centroid of the truss group's nodes.
- On pointer down + drag along the arc: compute angle delta, snap to
  nearest 15-degree increment, rotate all group nodes around the pivot.
- Arrow keys: rotate ±15 degrees per press.
- Snap detection runs during rotation.

### Rotate-Around-Node mode

**Use Cases**: SUC-006

When the rotate tool is active, a toolbar toggle or modifier (e.g., hold
Alt) switches to "pick pivot" mode. User clicks a node → that node becomes
the rotation pivot. The `RotateArc` repositions to the new pivot.

State: `useEditorStore.rotatePivotNodeId: string | null`.

## Math Utilities

### Plane-constrained movement

```typescript
// editor3d/planeMove.ts
function projectToPlane(
  ray: Ray,
  plane: PlacementPlane,
  throughPoint: Vec3
): Vec3 | null;
```

Given a camera ray and a constraint plane passing through `throughPoint`,
return the intersection point. Used by `MoveGizmo` for drag.

### Plane-constrained rotation

```typescript
// editor3d/planeRotate.ts
function rotateNodesAroundPivot(
  nodes: Vec3[],
  pivot: Vec3,
  plane: PlacementPlane,
  angleDeg: number
): Vec3[];
```

Rotates a set of positions around `pivot` in the given plane by
`angleDeg` degrees.

### Snap detection (positional only — no merge)

```typescript
// editor3d/snapGroup.ts
function findGroupSnap(
  groupNodePositions: Vec3[],
  modelNodes: Node[],
  excludeTrussId: string,
  threshold: number
): { groupNodeId: string; modelNodeId: string; offset: Vec3 } | null;
```

Checks if any node in the moving truss is within `threshold` of any
model node not belonging to the same truss. Returns the closest snap
candidate and the offset to align positions. **No nodes are merged** —
this only adjusts the truss position so nodes become co-located.
Connection semantics between co-located nodes are handled separately.

## Key Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `components/Canvas2DEditor.tsx` | Modify | Refactor to pop-up modal, reposition origin |
| `components/TrussLibraryPanel.tsx` | Create | Right-side docked truss card panel |
| `components/TrussCard.tsx` | Create | Individual truss thumbnail + actions |
| `components/PlaneSelector.tsx` | Create | 3-button plane toggle (XY/XZ/YZ) |
| `components/TrussSelector.tsx` | Create | Click-to-select truss group in 3D |
| `components/MoveGizmo.tsx` | Create | Plane-constrained move overlay |
| `components/RotateArc.tsx` | Create | Rotation arc widget overlay |
| `components/SnapIndicators.tsx` | Create | Visual snap proximity indicators |
| `model/schemas.ts` | Modify | Add PlacementPlane, trussId to Node/Member |
| `store/useModelStore.ts` | Modify | Helper to query nodes/members by trussId |
| `store/useEditorStore.ts` | Modify | Add activePlane, selectedTrussId, rotatePivotNodeId |
| `store/useCanvas2DStore.ts` | Modify | Adjust open() for origin positioning |
| `editor3d/planeMove.ts` | Create | Plane-constrained projection math |
| `editor3d/planeRotate.ts` | Create | Rotation math around pivot in plane |
| `editor3d/snapGroup.ts` | Create | Group snap detection |
| `editor3d/commitPlacement.ts` | Modify | Create TrussGroup on commit |
| `App.tsx` | Modify | Layout: add TrussLibraryPanel, update button text |
| `App.css` | Modify | Pop-up modal styles, library panel styles |

## Resolved Questions

1. **Pop-up size**: Fixed size, large (takes up most of the screen). Not
   user-resizable.
2. **Node behavior on snap**: No merge. Nodes are never auto-merged.
   Coincident nodes remain separate entities — multiple nodes can occupy
   the same position with different connection semantics. Snap only
   adjusts position to co-locate; connections are a separate concept.
3. **Truss persistence**: Yes — truss membership is stored via `trussId`
   on each Node and Member. This survives JSON export/import with zero
   extra bookkeeping.
4. **Keyboard nudge step size**: TBD — will be tuned experimentally.
   Start with a reasonable default and adjust based on feel.
