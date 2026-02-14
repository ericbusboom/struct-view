---
id: "002"
title: 2D canvas editor with pan and zoom
status: todo
use-cases: [SUC-004]
depends-on: ["001"]
---

# 2D canvas editor with pan and zoom

## Description

Implement a 2D HTML Canvas drawing surface that can be opened as a panel or modal from the main application toolbar. The canvas provides the viewport for all 2D shape drawing operations. It must support pan (middle-mouse drag or space+drag), zoom (scroll wheel with configurable sensitivity), and rendering of a configurable grid overlay. This component is the container for all subsequent 2D drawing tools.

## Implementation Notes

- Create a `Canvas2DEditor` React component wrapping an HTML `<canvas>` element.
- Maintain camera state (offsetX, offsetY, zoom level) in component state or a dedicated Zustand slice.
- Render grid lines that scale and reposition with the camera. Grid spacing should adapt to zoom level (e.g., show finer subdivisions when zoomed in).
- Mouse/wheel event handlers:
  - Middle-mouse drag or space+left-drag: pan (translate camera offset).
  - Scroll wheel: zoom centered on cursor position.
- The canvas should fill its container and resize responsively (listen for `ResizeObserver` or window resize).
- Add a toolbar button in the main UI to open the 2D editor panel.
- Expose a coordinate transform utility: `screenToWorld(screenX, screenY)` and `worldToScreen(worldX, worldY)` for use by drawing tools.

## Acceptance Criteria

- [ ] 2D canvas renders with a visible grid overlay.
- [ ] Pan via middle-mouse drag works smoothly without jitter.
- [ ] Pan via space+left-drag works as an alternative.
- [ ] Scroll-wheel zoom works, centered on the cursor position.
- [ ] Grid lines scale appropriately with zoom level.
- [ ] Canvas resizes correctly when its container changes size.
- [ ] A toolbar button opens the 2D editor panel.
- [ ] `screenToWorld` and `worldToScreen` transforms are accurate after pan/zoom.

## Testing

- **Existing tests to run**: Existing UI component tests to verify no regressions.
- **New tests to write**:
  - Build smoke test: component renders without errors.
  - Unit test: `screenToWorld` / `worldToScreen` produce correct coordinates after known pan/zoom state.
  - Unit test: zoom centered on cursor maintains the world-space position under the cursor.
- **Verification command**: `npx vitest run`
