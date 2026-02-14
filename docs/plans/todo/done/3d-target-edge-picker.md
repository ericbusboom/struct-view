---
status: done
sprint: '007'
---

# 3D target edge picker

The 2D-to-3D placement workflow requires the user to define a target edge in the 3D viewport. This does not exist yet.

- User clicks two points in 3D (or selects an existing member) to define the target edge
- Visual feedback showing the selected edge (highlighted line)
- The target edge is passed to placeShape as the TargetEdge parameter
- Should support snapping to existing nodes/members when picking edge endpoints
