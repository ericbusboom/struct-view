---
status: done
sprint: '007'
---

# 3D snap system for node/beam creation

The 2D editor has a sophisticated snap system (node > midpoint > grid with guide detection), but the 3D viewport has no snapping at all. Nodes are placed on the ground plane at click position with no snapping.

- Snap to existing nodes when creating/moving nodes in 3D
- Snap to grid intersections
- Snap to member midpoints
- Snap to member endpoints
- Visual snap indicator in 3D (highlight target)
- This is a prerequisite for effective 3D beam drawing
