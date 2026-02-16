---
status: draft
---

# Sprint 004 Technical Plan

## Architecture Overview

This sprint adds rotation logic to the WorkingPlane model and extends the 2D
view to show cross-plane nodes. The core rotation math is pure functions; the
acceleration and key-hold behavior is handled by the KeyboardHandler with a
timer. Cross-plane node visibility is a reactive filter on useModelStore.

```
New Files:
  src/model/planeRotation.ts       -- Pure rotation math (apply rotation,
                                      snap, axis alignment, tangent update)
  src/model/planeNodeFilter.ts     -- Filter nodes by distance to plane

Modified Files:
  src/model/WorkingPlane.ts        -- Add rotatePlane(), alignToAxis() functions
  src/store/usePlaneStore.ts       -- Add updatePlane() for rotation results
  src/components/KeyboardHandler.tsx -- Arrow key hold/acceleration, x/y/z keys
  src/components/NodeHighlight.tsx  -- Show cross-plane nodes in 2D view
  src/components/BeamPlacer.tsx     -- Allow snapping to cross-plane nodes
```

## Component Design

### Component: Plane Rotation Math (`model/planeRotation.ts`)

**Use Cases**: SUC-004-01, SUC-004-02, SUC-004-03, SUC-004-04

Pure functions for rotation operations:

```ts
// Rotate plane around a tangent vector by an angle (radians)
function rotatePlaneAroundAxis(
  plane: WorkingPlane,
  axis: Vec3,       // tangentU or tangentV or constraint line direction
  angle: number
): WorkingPlane

// Check if plane is near a 15-degree snap angle, return snapped plane if so
function snapPlaneAngle(
  plane: WorkingPlane,
  snapThreshold: number  // radians, e.g., 1 degree
): WorkingPlane

// Align plane so a world axis lies in the plane through the constraint point
function alignPlaneToAxis(
  plane: WorkingPlane,
  axis: 'x' | 'y' | 'z'
): WorkingPlane | null  // null if alignment is impossible (line constraint
                        // not perpendicular to axis)

// Update tangent vectors after rotation (incremental, not from-scratch)
function updateTangentVectors(
  oldTangentU: Vec3,
  oldTangentV: Vec3,
  oldNormal: Vec3,
  newNormal: Vec3
): { tangentU: Vec3, tangentV: Vec3 }
```

The `updateTangentVectors` function applies the same rotation that transformed
oldNormal into newNormal to the tangent vectors. This preserves continuity and
prevents gimbal-lock-style discontinuities.

### Component: Arrow Key Acceleration (in KeyboardHandler)

**Use Cases**: SUC-004-01, SUC-004-02

The acceleration model:
- `keydown` event starts a repeating timer (e.g., 60Hz via requestAnimationFrame)
- Each tick applies `currentStepSize` rotation
- `currentStepSize` starts at ~0.1 degrees, increases linearly to ~5 deg/sec
  over ~1 second of holding
- `keyup` clears the timer and resets `currentStepSize`

State tracked in a ref (not React state, to avoid re-renders on every tick):
```ts
const rotationState = useRef({
  activeKey: null as string | null,
  startTime: 0,
  animationFrameId: 0,
})
```

After each rotation step:
1. Call `rotatePlaneAroundAxis()` with the appropriate axis
2. Call `snapPlaneAngle()` to check for 15-degree snap
3. Call `usePlaneStore.updatePlane()` with the result

### Component: Axis Alignment Keys

**Use Cases**: SUC-004-03

`x`, `y`, `z` keydown handlers call `alignPlaneToAxis()`. For a
point-constrained plane, this always succeeds. For a line-constrained plane,
it only succeeds if the requested axis is perpendicular to the constraining
line direction. For a fully-constrained plane (3 points), it's a no-op.

### Component: Line Constraint Rotation

**Use Cases**: SUC-004-04

When `plane.constraintType === 'line'`, the rotation axis is fixed to the
direction of the constraining line (vector from constraintPoints[0] to
constraintPoints[1]). Only up/down arrow keys are active; left/right are
ignored. The acceleration and snap behavior are identical.

### Component: Cross-Plane Node Filter (`model/planeNodeFilter.ts`)

**Use Cases**: SUC-004-05

```ts
function getNodesNearPlane(
  nodes: Node[],
  plane: WorkingPlane,
  snapDistance: number  // meters
): Node[]
```

Returns all nodes whose distance to the plane surface is less than
snapDistance. Distance is computed as `|dot(nodePos - planePoint, planeNormal)|`.

This is called reactively (useMemo or derived store selector) whenever the
active plane or node list changes.

### Component: Cross-Plane Node Rendering

**Use Cases**: SUC-004-05

In 2D focus mode, NodeHighlight and SceneModel are updated to show cross-plane
nodes with a different visual treatment (e.g., dimmer color, dashed outline)
to distinguish them from nodes that were created on this plane.

BeamPlacer is updated to allow snapping to these cross-plane nodes when
placing beams, reusing the existing node rather than creating a new one.

## Data Flow

```
Arrow Key Rotation:
  keydown -> start animation timer
  Each tick:
    -> rotatePlaneAroundAxis(plane, tangent, stepSize)
    -> snapPlaneAngle(rotatedPlane)
    -> updateTangentVectors()
    -> usePlaneStore.updatePlane(result)
    -> PlaneGrid re-renders
  keyup -> stop timer, reset step size

Axis Alignment:
  x/y/z keydown
    -> alignPlaneToAxis(plane, axis)
    -> usePlaneStore.updatePlane(result)

Cross-Plane Nodes:
  On plane change or node change:
    -> getNodesNearPlane(allNodes, activePlane, snapDistance)
    -> SceneModel renders these nodes in 2D view
    -> BeamPlacer includes them in snap candidates
```

## Open Questions

- What should the acceleration curve be? Linear, ease-in, or step-function?
  (Recommendation: linear ramp over 1 second from 0.1 deg to 5 deg/sec)
- Should cross-plane nodes be selectable for editing in the 2D view, or only
  available as beam endpoints? (Recommendation: selectable and editable, same
  as on-plane nodes)
