---
status: done
sprint: '007'
---

# Place shape into 3D: UI workflow

The `placeShape` pure function exists but there is no UI to drive it. Users need:

- A "Place in 3D" action from the shape library or 2D editor
- A target edge picker in the 3D viewport (click two points or select an existing member)
- Preview of the placed shape before committing
- The placed nodes/members should appear in the 3D model store
