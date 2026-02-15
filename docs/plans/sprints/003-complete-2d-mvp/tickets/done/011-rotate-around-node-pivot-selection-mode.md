---
id: '011'
title: Rotate-around-node pivot selection mode
status: done
use-cases:
- SUC-006
depends-on:
- '010'
---

# Rotate-around-node pivot selection mode

## Description

Extend the rotate tool to support picking a specific node as the
rotation pivot:

1. When the rotate tool is active, add a "Set Pivot" toggle or
   modifier mode (e.g., toolbar button or Alt+click).
2. In pivot selection mode, clicking a node sets it as the rotation
   center.
3. Add `rotatePivotNodeId` state to `useEditorStore`.
4. The `RotateArc` widget repositions to the selected node.
5. Rotation math uses the selected node's position as the pivot
   instead of the truss centroid.
6. Reset pivot when changing trusses or deselecting.

## Acceptance Criteria

- [ ] User can designate any node as the rotation pivot
- [ ] Arc widget moves to the selected node's position
- [ ] Rotation occurs around the selected pivot, not the truss centroid
- [ ] Node snapping still works during pivot-based rotation
- [ ] Pivot resets when deselecting or selecting a different truss

## Testing

- **Existing tests to run**: RotateArc tests from ticket 010
- **New tests to write**: Pivot selection, rotation around non-centroid pivot
- **Verification command**: `npm test` + manual visual verification
