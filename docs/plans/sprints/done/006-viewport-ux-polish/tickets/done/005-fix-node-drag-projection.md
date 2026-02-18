---
id: '005'
title: Fix node drag projection
status: done
use-cases: []
depends-on: []
---

# Fix node drag projection

## Description

Dragging a node currently causes it to wander away from the mouse pointer. The
projection from screen-space mouse position onto the work plane is broken. Fix
so the node stays locked under the cursor throughout the drag.

## Acceptance Criteria

- [ ] When dragging a node, it stays directly under the mouse cursor at all times
- [ ] Works correctly on the ground plane and on custom work planes
- [ ] No drift or jump when starting a drag
- [ ] No drift accumulation during long drags
