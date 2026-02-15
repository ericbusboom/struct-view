---
id: '003'
title: Add PlaneSelector component to 2D editor and save to Shape2D
status: done
use-cases:
- SUC-003
depends-on:
- '001'
---

# Add PlaneSelector component to 2D editor and save to Shape2D

## Description

Create a reusable `PlaneSelector` component (3-button toggle: XZ, XY, YZ)
and integrate it into the 2D truss editor toolbar:

1. Create `PlaneSelector.tsx` — a 3-button toggle group.
2. Add it to the Canvas2DEditor toolbar area.
3. Default selection is XZ.
4. When the user changes the plane, update the current shape's
   `placementPlane` field in `useEditor2DStore`.
5. On save, the `placementPlane` persists with the `Shape2D` in the
   model store.

## Acceptance Criteria

- [ ] PlaneSelector renders three buttons: XZ, XY, YZ
- [ ] Default is XZ when creating a new truss
- [ ] Changing the plane updates the shape's `placementPlane`
- [ ] Saved shapes retain their `placementPlane` value
- [ ] When editing an existing shape, PlaneSelector reflects its saved plane

## Testing

- **Existing tests to run**: Editor2D store tests
- **New tests to write**: PlaneSelector toggle behavior, plane persistence on save
- **Verification command**: `npm test`
