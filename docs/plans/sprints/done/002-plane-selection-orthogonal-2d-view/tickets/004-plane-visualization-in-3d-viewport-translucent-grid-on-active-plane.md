---
id: '004'
title: Plane visualization in 3D viewport (translucent grid on active plane)
status: done
use-cases: []
depends-on:
- '002'
---

# Plane visualization in 3D viewport (translucent grid on active plane)

## Description

Create a `PlaneGrid` component that renders the active working plane as a
translucent colored grid in the 3D viewport. The grid is oriented to match the
plane's normal and centered on the plane's anchor point.

The grid color indicates the plane's axis alignment:
- **Yellow** for general (non-axis-aligned) planes
- **Red** for planes containing the XY axes (normal along Z)
- **Blue** for planes containing the YZ axes (normal along X)
- **Green** for planes containing the XZ axes (normal along Y)

## Acceptance Criteria

- [ ] `PlaneGrid` component renders when `usePlaneStore.activePlane` is not null
- [ ] Grid is oriented to match the plane's normal vector
- [ ] Grid is centered on the plane's anchor point
- [ ] Grid is semi-transparent so it doesn't obscure the model
- [ ] Grid color is yellow for non-axis-aligned planes
- [ ] Grid color is red when the plane contains the X and Y axes (XY plane)
- [ ] Grid color is blue when the plane contains the Y and Z axes (YZ plane)
- [ ] Grid color is green when the plane contains the X and Z axes (XZ plane)
- [ ] Grid is large enough to be useful (e.g., 20m x 20m)
- [ ] Grid lines are visible at typical zoom levels
- [ ] Component is mounted inside Viewport3D

## Testing

- **Existing tests to run**: `npx vitest run`
- **New tests to write**: Unit test for the axis-alignment color logic: given a
  plane normal, verify the correct color is returned. Test edge cases (plane
  nearly but not exactly axis-aligned).
- **Verification command**: `npx vitest run`
