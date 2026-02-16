---
id: '003'
title: Tangent vector tracking (gimbal-lock-free incremental updates)
status: in-progress
use-cases: []
depends-on:
- '001'
---

# Tangent vector tracking (gimbal-lock-free incremental updates)

## Description

When the plane normal is rotated, the tangent vectors (tangentU, tangentV) must
be rotated by the same rotation. This maintains their relative orientation and
avoids singularities that would occur from recomputing tangents from scratch.

## Acceptance Criteria

- [ ] Tangent vectors rotate incrementally with the normal
- [ ] The frame stays orthonormal after any rotation
- [ ] No discontinuous jumps during continuous rotation
- [ ] 360-degree rotation returns to the original orientation

## Testing

- **Existing tests to run**: `npx vitest run` (especially workingPlane.test.ts)
- **New tests to write**: Tests verifying orthonormality after rotation and 360-degree
  round-trip
- **Verification command**: `npx vitest run`
