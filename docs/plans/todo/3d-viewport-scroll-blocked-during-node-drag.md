---
status: pending
---

# 3D viewport scroll blocked during node drag

When dragging a node in 3D move mode, the viewport cannot be scrolled (orbited/zoomed). The NodeDragger component captures all pointer events on a large invisible sphere, which prevents OrbitControls from receiving scroll/wheel events.

The fix likely involves either:
- Allowing wheel events to pass through the NodeDragger sphere
- Temporarily disabling OrbitControls only for pointer move/up (not wheel)
- Using a different event capture strategy that doesn't block scroll
