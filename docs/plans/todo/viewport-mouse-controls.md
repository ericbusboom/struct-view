# Viewport Mouse Controls

## Desired Behavior

| Input | Action |
|-------|--------|
| Left click | Selection (not handled by camera controls) |
| Right click + drag | Orbit — globe-style rotation, like grabbing the surface of a sphere |
| Shift + right click + drag | Pan — translate the camera laterally |
| Middle mouse scroll | Zoom (dolly) toward cursor |

## Globe-style orbit

The orbit should feel like grabbing a point on the surface of a sphere and dragging it. The camera rotates freely around the target point in all axes — there is no "up" constraint or turntable behavior. This is TrackballControls, not OrbitControls.

Here is an example with the proper benavior, although with different assignement to the mouse buttons. 

https://raw.githubusercontent.com/mrdoob/three.js/refs/heads/master/examples/webgl_geometry_teapot.html

## Current state

Switched from OrbitControls to TrackballControls but the mouse button mapping is wrong. TrackballControls' `mouseButtons` has different semantics — the property names (LEFT/MIDDLE/RIGHT) map to hardcoded actions (ROTATE/ZOOM/PAN), and the values are `event.button` numbers that trigger each action. The ShiftPanModifier swaps which action owns the right-click button number.

## 2D focus mode

When in 2D focus mode (orthographic camera on a working plane), rotation is disabled via `noRotate = true`. Shift + right-click pan still works.

## Files involved

- `frontend/src/components/Viewport3D.tsx` — TrackballControls config and ShiftPanModifier
- `frontend/src/components/FocusCameraController.tsx` — disables rotation in focus mode
- `frontend/src/components/CameraActionExecutor.tsx` — disables controls during camera animation
- `frontend/src/components/DragSelect.tsx` — disables controls during drag selection
