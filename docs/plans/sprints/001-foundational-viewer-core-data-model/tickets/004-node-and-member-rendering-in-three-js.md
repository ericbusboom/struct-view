---
id: "004"
title: Node and member rendering in Three.js
status: todo
use-cases: [SUC-003]
depends-on: ["002", "003"]
---

# Node and member rendering in Three.js

## Description

Render the structural model (nodes and members) in the 3D viewport. Nodes display as small spheres at their 3D coordinates. Members display as lines or thin cylinders connecting their start and end nodes. The rendering should reactively update when the model state changes.

## Implementation Notes

- Nodes: small spheres (e.g., radius 0.05m) colored distinctly (e.g., blue)
- Members: line segments or thin cylinders connecting node positions, colored distinctly (e.g., white or gray)
- Model state should live in a React context or state management (e.g., Zustand store)
- Rendering reads from model state — when nodes/members change, scene updates
- Consider instanced meshes for performance if node/member count gets large (optimize later if needed)
- Start with a hardcoded sample model for visual verification (e.g., a simple portal frame: 4 nodes, 3 members)

## Acceptance Criteria

- [ ] Nodes render as visible spheres at correct 3D positions
- [ ] Members render as lines/cylinders between their start and end nodes
- [ ] Sample model displays correctly (portal frame or simple truss)
- [ ] Adding/removing nodes or members in state causes the scene to update
- [ ] Rendering performs smoothly for up to ~100 nodes/members

## Testing

- **Existing tests to run**: Schema validation tests, viewport smoke test
- **New tests to write**: Model store CRUD operations update state correctly
- **Verification command**: `npm test`
