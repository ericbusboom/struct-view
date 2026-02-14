---
id: "007"
title: 3D placement engine
status: todo
use-cases: [SUC-006]
depends-on: ["001", "006"]
---

# 3D placement engine

## Description

Transform a `Shape2D` from its local 2D coordinate space to 3D world coordinates, aligning the shape's designated snap edge to a target member or edge in the 3D scene. During placement, show a translucent preview of the shape in the 3D viewport so the user can see the result before confirming. On confirmation, convert the shape's nodes and members into standard 3D model `Node` and `Member` entities and add them to the model store.

## Implementation Notes

- Coordinate transform pipeline:
  1. Identify the snap edge on the Shape2D (the member with `isSnapEdge: true`; if multiple, use the first or let user pick).
  2. Compute the snap edge direction vector in local 2D space.
  3. Given the target 3D edge (two world-space endpoints), compute the rotation matrix that aligns the snap edge direction to the target edge direction, with the shape plane oriented perpendicular to the target surface/edge.
  4. Translate so that the snap edge start node maps to the target edge start point.
  5. Apply the transform to all shape nodes: local (x, y) maps to world (X, Y, Z).
- Preview rendering: create a Three.js group with translucent line segments representing the transformed shape. Update position as the user slides along the target edge.
- Confirm action: convert transformed coordinates into model `Node` objects (with new unique ids) and `Member` objects referencing those nodes. Add to the model store.
- The placement engine should expose a function like `placeShape(shape: Shape2D, targetEdge: {start: Vec3, end: Vec3}): {nodes: Node[], members: Member[]}` for the core transform logic, separate from the UI preview.

## Acceptance Criteria

- [ ] Shape preview appears in the 3D viewport as a translucent wireframe aligned to the target edge.
- [ ] Shape orientation is perpendicular to the target edge/surface.
- [ ] User can slide the preview along the target edge before confirming.
- [ ] On confirmation, new nodes and members are added to the 3D model store.
- [ ] Placed nodes have correct world-space coordinates matching the preview position.
- [ ] Placed members reference the correct newly-created node ids.
- [ ] The `placeShape` transform function is a testable pure function separate from UI.

## Testing

- **Existing tests to run**: Model schema tests, shape schema tests from ticket 001.
- **New tests to write**:
  - Unit test: `placeShape` with a simple 2-node snap edge aligned to a known target edge produces correct world coordinates.
  - Unit test: shape plane is perpendicular to the target edge direction.
  - Unit test: sliding along the target edge translates all nodes uniformly.
  - Unit test: generated nodes and members have unique ids and valid references.
  - Build smoke test: preview renders in the 3D viewport without errors.
- **Verification command**: `npx vitest run`
