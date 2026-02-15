---
id: "007"
title: Node and beam rendering in 2D focus view (project 3D model onto plane)
status: todo
use-cases:
  - SUC-003-01
  - SUC-003-02
depends-on: []
---

# Node and beam rendering in 2D focus view (project 3D model onto plane)

## Description

**This ticket is largely complete** from Sprint 002 late-stage work. The
following features are already implemented:

### Already done (Sprint 002)

- **Orthographic camera** in focus mode (`FocusCameraController.tsx`): creates a
  `THREE.OrthographicCamera` with frustum matched to the perspective FOV,
  eliminating vanishing point distortion.
- **Ghost rendering** for off-plane elements (`NodeMesh.tsx`, `MemberLine.tsx`):
  off-plane nodes and members render as transparent gray (opacity 0.15) with
  `depthWrite: false` and `renderOrder: 0`.
- **On-plane element priority** (`NodeMesh.tsx`, `MemberLine.tsx`): on-plane
  elements render with `renderOrder: 10`, always appearing on top of ghosted
  elements even at coincident screen positions.
- **`isOnPlane()` utility** (`WorkingPlane.ts`): signed distance test with
  configurable threshold (default 0.01).

### Remaining work (this ticket)

Verify that the existing rendering is sufficient and make any minor adjustments:

1. **Confirm grid alignment**: The PlaneGrid overlay and the snap grid should
   align visually. If the PlaneGrid cell size doesn't match the snap grid size
   (1.0), adjust PlaneGrid to use the same gridSize.
2. **Axis labels** (optional): Consider adding U/V axis indicators in the focus
   view corners so the user knows orientation. Defer if not needed now.
3. **Verify camera zoom behavior**: Scroll-wheel zoom in ortho mode should adjust
   the camera's zoom property (which OrbitControls handles for orthographic
   cameras). Verify this works with `zoomToCursor`.

## Acceptance Criteria

- [ ] Orthographic camera shows no perspective distortion in focus mode
- [ ] Off-plane elements are ghosted (transparent gray)
- [ ] On-plane elements render on top of ghosted elements
- [ ] PlaneGrid cell size matches the snap grid size
- [ ] Scroll-wheel zoom works correctly in focus mode
- [ ] Toggling focus off (`f` key) restores 3D perspective view cleanly

## Testing

- **Existing tests to run**: `npx vitest run` (188 tests including isOnPlane tests)
- **New tests to write**: None expected (existing tests cover the rendering logic)
- **Verification command**: `npx vitest run`
