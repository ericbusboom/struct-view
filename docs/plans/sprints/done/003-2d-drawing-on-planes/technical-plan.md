---
status: draft
---

# Sprint 003 Technical Plan

## Architecture Overview

This sprint adds drawing capabilities to the plane-based workflow. New
components handle mouse interaction (raycasting onto planes), grid snapping, and
a sidebar coordinate editor. The existing SceneModel renders new geometry
automatically since it subscribes to useModelStore.

```
New Files:
  src/editor2d/gridSnap.ts          -- Grid snap pure functions
  src/editor2d/planeRaycast.ts      -- Raycast mouse onto active plane
  src/components/NodePlacer.tsx      -- Handles node placement clicks in focus mode
  src/components/BeamPlacer.tsx      -- Handles beam two-click workflow in focus mode
  src/components/NodeHighlight.tsx   -- Highlights nearest node when cursor is close
  src/components/CoordinatePanel.tsx -- Sidebar coordinate entry/editing

Modified Files:
  src/components/KeyboardHandler.tsx -- Add `n` and `b` key handlers
  src/components/Viewport3D.tsx      -- Mount NodePlacer, BeamPlacer, NodeHighlight
  src/App.tsx                        -- Mount CoordinatePanel in sidebar
```

## Component Design

### Component: Grid Snap Engine (`editor2d/gridSnap.ts`)

**Use Cases**: SUC-003-01, SUC-003-02

Pure functions for snapping points to a grid aligned with the active plane.

```ts
// Snap a 3D point to the nearest grid intersection on the plane
function snapToPlaneGrid(
  point: Vec3,
  plane: WorkingPlane,
  gridSize: number  // meters (0.0254 for 1", 0.01 for 1cm)
): Vec3

// Convert between plane-local 2D coords and world 3D coords
function worldToPlaneLocal(point: Vec3, plane: WorkingPlane): { u: number, v: number }
function planeLocalToWorld(u: number, v: number, plane: WorkingPlane): Vec3
```

The snap operates in the plane's local coordinate system (tangentU, tangentV),
rounds to the nearest gridSize increment, then converts back to world 3D.

### Component: Plane Raycast (`editor2d/planeRaycast.ts`)

**Use Cases**: SUC-003-01, SUC-003-02

Utility that takes a mouse event and the R3F camera/raycaster and returns the
intersection point on the active plane.

```ts
function raycastOntoPlane(
  raycaster: THREE.Raycaster,
  plane: WorkingPlane
): Vec3 | null
```

Uses THREE.Plane constructed from the WorkingPlane's normal and point.

### Component: NodePlacer (`components/NodePlacer.tsx`)

**Use Cases**: SUC-003-01

Active only when mode is 'add-node' and isFocused is true. Listens for click
events on the R3F canvas, raycasts onto the plane, snaps to grid, and calls
`useModelStore.addNode()`.

### Component: BeamPlacer (`components/BeamPlacer.tsx`)

**Use Cases**: SUC-003-02, SUC-003-03

Active only when mode is 'add-member' and isFocused is true. Implements the
two-click workflow:
1. First click: find nearest existing node within snap distance, or create a
   new node at the snapped position. Store as `memberStartNode`.
2. Render a preview line from start to current cursor position.
3. Second click: find or create end node, call `useModelStore.addMember()`.

### Component: NodeHighlight (`components/NodeHighlight.tsx`)

**Use Cases**: SUC-003-03

Renders a glow/ring around the nearest node when the cursor is within snap
distance. Uses the plane raycast to get cursor position, then searches
useModelStore nodes for the nearest one within threshold.

### Component: CoordinatePanel (`components/CoordinatePanel.tsx`)

**Use Cases**: SUC-003-04

Sidebar panel showing x, y, z fields for the selected node. Subscribes to
useEditorStore.selectedNodeIds and useModelStore.

Input handling:
- Direct value: parse as number, update node position
- Relative: if input starts with `+` or `-`, parse the offset, add to current
  value, update node, then replace input with the resulting absolute value

### Component: Model Rendering in 2D Focus View

**Use Cases**: SUC-003-01, SUC-003-02

No new rendering component needed. The existing SceneModel renders all nodes and
members. In 2D focus mode, the orthogonal camera from Sprint 002 naturally
clips/shows only geometry near the plane. The camera's near/far planes and
zoom level determine what's visible.

If needed, we can filter rendering to only show nodes within snap distance of
the active plane, but the simpler approach (let the camera handle it) should
work first.

## Data Flow

```
Node Placement:
  Click in focus mode
  -> NodePlacer catches click
  -> raycastOntoPlane() gets 3D point
  -> snapToPlaneGrid() snaps to grid
  -> useModelStore.addNode(snappedPoint)
  -> SceneModel re-renders with new node

Beam Placement:
  First click -> find/create start node, store in editor state
  Second click -> find/create end node
  -> useModelStore.addMember(startId, endId)
  -> SceneModel re-renders with new beam

Coordinate Editing:
  Select node -> CoordinatePanel shows x, y, z
  Edit field -> parse value or +/- expression
  -> useModelStore.updateNode(id, newPosition)
  -> SceneModel re-renders
```

## Open Questions

- Should we disable OrbitControls in focus mode to prevent accidental camera
  rotation? (Recommendation: yes, disable rotation but keep pan and zoom)
- Should nodes placed in 2D automatically get added to the active plane's
  group? (Recommendation: defer grouping to Sprint 005)
