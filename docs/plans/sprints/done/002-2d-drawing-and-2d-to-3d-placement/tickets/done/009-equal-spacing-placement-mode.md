---
id: 009
title: Equal-spacing placement mode
status: done
use-cases:
- SUC-006
depends-on:
- '007'
- 008
---

# Equal-spacing placement mode

## Description

Extend the 3D placement workflow so users can specify a count N and the engine distributes N copies of a shape at equal spacing along a target edge. Each copy undergoes the same snap-edge alignment transform as a single placement (ticket 007) and independent node merging (ticket 008). This mode is used for repetitive structural patterns like placing multiple truss frames at regular intervals along a ridge beam.

## Implementation Notes

- Given: target edge (start and end points in world space), shape, count N.
- Compute N evenly-spaced positions along the target edge. Position `i` is at parameter `t = i / (N - 1)` for N >= 2, or at the midpoint for N == 1. The shape's snap edge start aligns to each computed position.
- For each position, call `placeShape` to generate transformed nodes and members.
- After each copy, run `mergeCoincidentNodes` against the accumulated model (existing nodes plus all previously placed copies in this batch). This ensures adjacent copies share nodes where they meet.
- UI addition: when in placement mode, a numeric input or spinner allows the user to set the copy count. Preview shows all N copies as translucent wireframes before confirmation.
- Expose a pure function: `computeEqualSpacingPositions(edgeStart: Vec3, edgeEnd: Vec3, count: number): Vec3[]` for testability.

## Acceptance Criteria

- [ ] User can specify a count N for equal-spacing placement.
- [ ] N copies of the shape appear at evenly-spaced intervals along the target edge.
- [ ] Spacing between copies is uniform (equal edge parameter increments).
- [ ] Each copy undergoes node merge independently against the accumulating model.
- [ ] Preview shows all N copies before confirmation.
- [ ] A single copy (N=1) places at the midpoint of the target edge.
- [ ] Total node and member counts are correct after placement and merging.

## Testing

- **Existing tests to run**: Placement tests from ticket 007, merge tests from ticket 008.
- **New tests to write**:
  - Unit test: `computeEqualSpacingPositions` with count=3 on a 10m edge returns positions at 0m, 5m, and 10m.
  - Unit test: `computeEqualSpacingPositions` with count=1 returns the midpoint.
  - Unit test: `computeEqualSpacingPositions` with count=2 returns start and end.
  - Integration test: place 3 copies of a simple triangle shape along an edge, verify 3 sets of nodes/members exist with correct spacing.
  - Integration test: adjacent copies share merged nodes where their boundaries coincide.
  - Integration test: total node count accounts for merges (fewer than 3 * shape_nodes if copies share endpoints).
- **Verification command**: `npx vitest run`
