---
id: "001"
title: Shape data model and project integration
status: todo
use-cases: [SUC-004, SUC-005, SUC-006]
depends-on: []
---

# Shape data model and project integration

## Description

Add the `Shape2D` type to the shared model schema. A shape is a named collection of local-space 2D nodes (`{id, x, y}`) and members (`{id, startNode, endNode, isSnapEdge}`). Shape nodes use 2D coordinates (x, y), not 3D -- they live in the shape's own local coordinate space and are transformed to world space only during 3D placement.

Extend the `Project` schema with an optional `shapes` array so shapes persist alongside the rest of the project data. Add Zod validation schemas for each sub-type and a `createShape2D` factory function that produces a blank shape with sensible defaults.

This ticket is foundational -- every other Sprint 002 ticket depends directly or indirectly on the types defined here.

## Implementation Notes

- Define `Shape2DNodeSchema` with fields: `id` (string), `x` (number), `y` (number).
- Define `Shape2DMemberSchema` with fields: `id` (string), `startNode` (string ref), `endNode` (string ref), `isSnapEdge` (boolean, default `false`).
- Define `Shape2DSchema` with fields: `id` (string), `name` (string), `nodes` (array of Shape2DNode), `members` (array of Shape2DMember).
- Extend `ProjectSchema` to include `shapes: z.array(Shape2DSchema).optional().default([])`.
- Add `createShape2D(name?: string): Shape2D` factory that generates a unique id and empty node/member arrays.
- Ensure all schemas compose correctly with the existing project validation pipeline.

## Acceptance Criteria

- [ ] `Shape2D`, `Shape2DNode`, and `Shape2DMember` TypeScript types exist with Zod schemas.
- [ ] `ProjectSchema` includes an optional `shapes` array that defaults to `[]`.
- [ ] JSON round-trip (serialize then parse) preserves all shape data including snap edge flags.
- [ ] `isSnapEdge` boolean flag is present on shape members and defaults to `false`.
- [ ] `createShape2D` factory produces a valid shape with a unique id.
- [ ] Existing project JSON without `shapes` key still validates (backward compatible).

## Testing

- **Existing tests to run**: All current schema/validation tests to verify no regressions.
- **New tests to write**:
  - Unit test: `Shape2DSchema` validates a well-formed shape and rejects missing required fields.
  - Unit test: `Shape2DMemberSchema` defaults `isSnapEdge` to `false` when omitted.
  - Unit test: `ProjectSchema` round-trip with shapes array -- serialize to JSON, parse back, assert deep equality.
  - Unit test: `ProjectSchema` accepts legacy JSON without `shapes` key and fills default.
  - Unit test: `createShape2D` returns a shape that passes schema validation.
- **Verification command**: `npx vitest run`
