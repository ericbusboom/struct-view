---
status: draft
---

# Sprint 002 Technical Plan

## Architecture Overview

This sprint adds three new pieces to the system: a pure data model for working
planes, a Zustand store to manage them, and Three.js components to visualize
them. The existing 3D viewport (Viewport3D) gains two new child components
(PlaneGrid and FocusCamera) and the KeyboardHandler gains two new key bindings
(`p` and `f`).

```
New Files:
  src/model/WorkingPlane.ts       -- Pure data model + factory functions
  src/store/usePlaneStore.ts      -- Zustand store for active plane
  src/components/PlaneGrid.tsx    -- Translucent grid rendered on active plane
  src/components/FocusCamera.tsx  -- Camera controller for 2D focus mode

Modified Files:
  src/components/KeyboardHandler.tsx -- Add `p` and `f` key handlers
  src/components/Viewport3D.tsx     -- Mount PlaneGrid and FocusCamera
```

## Component Design

### Component: WorkingPlane (`model/WorkingPlane.ts`)

**Use Cases**: SUC-002-01, SUC-002-02, SUC-002-03

A pure TypeScript type and set of factory functions. No Zustand, no React.

```ts
type ConstraintType = 'point' | 'line' | 'plane'

interface WorkingPlane {
  id: string
  normal: Vec3           // unit normal to the plane
  point: Vec3            // anchor point on the plane
  constraintType: ConstraintType
  constraintPoints: Vec3[]  // 1, 2, or 3 points
  tangentU: Vec3         // first tangent vector (lies in plane)
  tangentV: Vec3         // second tangent vector (lies in plane)
}
```

Factory functions:
- `createPlaneFromPoints(points: Vec3[]): WorkingPlane` dispatches on
  point count (0 = origin XY, 1 = XY at point, 2 = line constraint, 3 = plane
  constraint)
- `createPlaneFromBeam(startNode: Vec3, endNode: Vec3): WorkingPlane`
  equivalent to two-point
- `createPlaneFromBeamAndPoint(start: Vec3, end: Vec3, point: Vec3): WorkingPlane`
  equivalent to three-point

For the two-point case, the initial normal is chosen by finding the world axis
most perpendicular to the line direction. Tangent vectors are seeded from the
cross product of the normal and the line direction.

### Component: usePlaneStore (`store/usePlaneStore.ts`)

**Use Cases**: SUC-002-01, SUC-002-02, SUC-002-03, SUC-002-04

```ts
interface PlaneStoreState {
  activePlane: WorkingPlane | null
  isFocused: boolean             // true when in 2D focus mode
  savedCameraState: CameraState | null  // for restoring on unfocus

  setActivePlane: (plane: WorkingPlane) => void
  clearActivePlane: () => void
  toggleFocus: () => void
  saveCameraState: (state: CameraState) => void
}
```

`CameraState` captures position, rotation (quaternion), and whether the camera
is orthographic or perspective, so that `f` can restore the exact view.

### Component: PlaneGrid (`components/PlaneGrid.tsx`)

**Use Cases**: SUC-002-01, SUC-002-02, SUC-002-03

Renders the active plane as a translucent grid in the 3D viewport. Uses a
Three.js PlaneGeometry rotated to match the plane's normal, with a grid
material (either a custom shader or GridHelper approach). The grid is
semi-transparent so it doesn't obscure the model.

Props: reads `activePlane` from usePlaneStore via hook.

Sizing: The grid extends far enough to be useful (e.g., 20m x 20m) and is
centered on the plane's anchor point. Grid lines at 1" (imperial) or 1cm
(metric). At 3D zoom levels, only major grid lines are visible.

### Component: FocusCamera (`components/FocusCamera.tsx`)

**Use Cases**: SUC-002-04

Controls the camera based on focus state. When `isFocused` transitions to true:
1. Saves current camera state (position, quaternion, projection)
2. Switches to OrthographicCamera
3. Positions camera above the plane, looking along the negative normal
4. Aligns camera up vector with plane's tangentV

When `isFocused` transitions to false:
1. Restores saved camera state
2. Switches back to PerspectiveCamera

Implementation: Uses `useThree()` to access the R3F camera and
`useFrame()` for smooth transitions if desired (or instant snap).

### Component: KeyboardHandler Updates

**Use Cases**: SUC-002-01, SUC-002-02, SUC-002-03, SUC-002-04

Add two key bindings:

**`p` key**: Read current selection from useEditorStore (selectedNodeIds,
selectedMemberIds). Determine the point set:
- No selection = empty array = `createPlaneFromPoints([])`
- Selected nodes only = `createPlaneFromPoints(nodePositions)`
- Selected beam (1 member, 0 nodes) = `createPlaneFromBeam(start, end)`
- Selected beam + 1 node = `createPlaneFromBeamAndPoint(start, end, point)`
- More than 3 points = use first 3 (or reject with warning)

**`f` key**: Call `usePlaneStore.toggleFocus()`. No-op if no active plane.

### Component: 2D Focus Mode Overlay

**Use Cases**: SUC-002-04

When in focus mode, render:
- Grid overlay on top of the plane (denser grid lines visible at 2D zoom)
- Axis labels at the edges of the viewport showing the tangentU and tangentV
  directions (e.g., "X" and "Z" for an XZ plane)
- A "2D" indicator badge so the user knows they're in focus mode

This can be a simple HTML overlay (CSS positioned) or a Three.js HUD.

## Data Flow

```
User selects nodes, presses 'p'
  KeyboardHandler reads selection from useEditorStore
  Calls createPlaneFromPoints() or createPlaneFromBeam()
  Calls usePlaneStore.setActivePlane(plane)
  PlaneGrid reads activePlane and renders grid

User presses 'f'
  KeyboardHandler calls usePlaneStore.toggleFocus()
  FocusCamera reads isFocused, saves/restores camera
  2D overlay appears/disappears
```

## Open Questions

- Should there be a smooth camera animation when toggling focus, or instant
  snap? (Recommendation: instant snap for now, can add animation later)
- Should the grid scale adapt to zoom level? (Recommendation: yes, show
  major lines at all zooms, minor lines only when zoomed in)
