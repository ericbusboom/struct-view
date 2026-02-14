---
id: '003'
title: 2D snap system
status: done
use-cases:
- SUC-004
depends-on:
- '002'
---

# 2D snap system

## Description

Implement the snapping calculation engine for the 2D editor. Given a cursor position and the current drawing state, the snap system returns the best snap target point and its type. Snap types in priority order: snap-to-node (highest), snap-to-midpoint, snap-to-grid (lowest). Additionally, the system detects perpendicular and parallel alignment conditions relative to existing segments and provides visual guide lines.

This is a pure computation module -- it calculates snap targets but does not handle rendering or input. Drawing tools call into it and the canvas renderer draws the resulting guides.

## Implementation Notes

- Implement a pure function: `snapPoint(cursor: {x, y}, existingNodes: Shape2DNode[], existingMembers: Shape2DMember[], gridSize: number, options?: SnapOptions): SnapResult`.
- `SnapResult` type: `{point: {x, y}, type: 'node' | 'midpoint' | 'grid' | 'none', sourceId?: string, guides: GuideLines[]}`.
- `GuideLines` type: `{type: 'perpendicular' | 'parallel', from: {x, y}, to: {x, y}}`.
- Snap-to-node: if cursor is within a configurable radius (in screen pixels, converted to world units) of any existing node, snap to that node.
- Snap-to-midpoint: if cursor is within radius of the midpoint of any existing member, snap to that midpoint.
- Snap-to-grid: round cursor coordinates to the nearest grid intersection at the current grid spacing.
- Perpendicular/parallel detection: for each existing segment, check if the line from the last-placed node to the cursor is perpendicular or parallel (within angular tolerance). Return guide line data for rendering.
- Snap radius should be configurable and expressed in screen pixels (transformed to world space based on current zoom).

## Acceptance Criteria

- [ ] Cursor snaps to the nearest existing node when within the snap radius.
- [ ] Cursor snaps to segment midpoints when within the snap radius.
- [ ] Cursor snaps to grid intersections at the configured grid spacing.
- [ ] Priority ordering is respected: node > midpoint > grid.
- [ ] Perpendicular alignment guides are detected and returned.
- [ ] Parallel alignment guides are detected and returned.
- [ ] Snap radius scales correctly with zoom level (consistent screen-pixel feel).
- [ ] When no snap target is in range, the raw cursor position is returned with type `'none'`.

## Testing

- **Existing tests to run**: Any existing geometry utility tests.
- **New tests to write**:
  - Unit test: cursor near an existing node returns snap type `'node'` with correct coordinates.
  - Unit test: cursor near a segment midpoint (but not near a node) returns snap type `'midpoint'`.
  - Unit test: cursor not near any node or midpoint returns snap type `'grid'` at the nearest grid intersection.
  - Unit test: when cursor is equidistant between a node and a midpoint, node wins (priority).
  - Unit test: perpendicular guide is detected when the cursor-to-last-node line is 90 degrees from an existing segment.
  - Unit test: parallel guide is detected when the cursor-to-last-node line is 0/180 degrees from an existing segment.
  - Edge case: no existing nodes or members -- snap-to-grid is the only option.
  - Edge case: multiple nodes within snap radius -- closest one wins.
- **Verification command**: `npx vitest run`
