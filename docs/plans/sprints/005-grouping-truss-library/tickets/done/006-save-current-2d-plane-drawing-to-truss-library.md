---
id: '006'
title: Save current 2D plane drawing to truss library
status: done
use-cases: []
depends-on: []
---

# Save current 2D plane drawing to truss library

## Description

Add coordinate conversion utilities (worldToPlane2D, plane2DToWorld,
saveToShape2D, placeShapeOnPlane) and a "Save to Library" button in
the 2D focus overlay that saves all nodes on the active plane as a
Shape2D entry in the truss library.

## Acceptance Criteria

- [x] worldToPlane2D projects 3D positions to plane-local (u,v)
- [x] plane2DToWorld converts (u,v) back to 3D
- [x] saveToShape2D normalizes node positions and filters members
- [x] placeShapeOnPlane creates new 3D nodes/members from a Shape2D
- [x] "Save to Library" button appears in FocusOverlay during 2D mode
- [x] Button collects all nodes on the active plane and saves as Shape2D
- [x] 7 unit tests for shapeToPlane utilities pass

## Testing

- **Existing tests**: `shapeToPlane.test.ts` (7 tests)
- **Verification command**: `cd frontend && npx vitest run`
