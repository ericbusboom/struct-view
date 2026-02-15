---
id: '006'
title: Plane rendering in 2D focus mode (grid overlay, axis labels)
status: done
use-cases: []
depends-on:
- '004'
- '005'
---

# Plane rendering in 2D focus mode (grid overlay, axis labels)

## Description

When in 2D focus mode, enhance the visual presentation with a denser grid
overlay and axis labels. The grid should show finer divisions than the 3D view,
and labels should indicate the plane's tangent directions so the user knows
which axes they're drawing on.

## Acceptance Criteria

- [ ] In focus mode, grid shows finer divisions appropriate for 2D drawing
  (major + minor grid lines)
- [ ] Grid density adapts to zoom level (more lines visible when zoomed in)
- [ ] Axis labels appear at viewport edges showing tangent directions (e.g.,
  "X" and "Z" for an XZ plane)
- [ ] A "2D" indicator badge is visible so the user knows they're in focus mode
- [ ] Grid uses the same color scheme as the 3D grid (yellow, red, blue, or
  green based on axis alignment)
- [ ] Labels and badge disappear when exiting focus mode

## Testing

- **Existing tests to run**: `npx vitest run`
- **New tests to write**: Unit test for axis label text derivation from plane
  tangent vectors. Verify correct labels for XY, XZ, YZ, and arbitrary planes.
- **Verification command**: `npx vitest run`
