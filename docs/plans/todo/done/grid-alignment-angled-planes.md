---
status: done
sprint: '004'
---

# Grid pattern alignment on angled planes

When selecting a plane on an angled face (relative to world planes), the grid
pattern ends up angled arbitrarily. The grid should be aligned to meaningful
geometric references.

## Description

- If the plane has **two or more point constraints**, one axis of the grid should
  be parallel to the line through two of those points.
- If the plane has a **line constraint**, one of the two grid axes should be
  parallel to that constraining line.
- This ensures the grid is always oriented in a useful, predictable way rather
  than an arbitrary rotation based on the normal vector alone.

Currently the tangent vectors are computed from the normal using a default
up-vector cross product, which produces arbitrary grid orientations for tilted
planes.
