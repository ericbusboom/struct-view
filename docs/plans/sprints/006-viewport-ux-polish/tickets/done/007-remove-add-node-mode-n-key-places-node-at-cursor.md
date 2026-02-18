---
id: '007'
title: "Remove add-node mode \u2014 N key places node at cursor"
status: done
use-cases: []
depends-on: []
---

# Remove add-node mode — N key places node at cursor

## Description

Instead of a separate toolbar mode for placing nodes, pressing the N key
places a node at the current mouse position (projected onto the active work
plane or the ground plane). No mode switch required.

## Acceptance Criteria

- [ ] Pressing N creates a node at the current cursor position projected onto the active work plane (or ground plane if no work plane)
- [ ] The "add-node" mode is removed from EditorMode and the toolbar
- [ ] N key does nothing when cursor is not over the viewport (or focus is in a text input)
- [ ] New node snaps to grid if snap is enabled
- [ ] New node is automatically selected after placement
