---
id: '006'
title: Unify select and move modes
status: done
use-cases: []
depends-on:
- '005'
---

# Unify select and move modes

## Description

Remove the distinction between "select mode" and "move mode." If the user
selects something and then drags it, they're moving it. A single interaction
mode handles both selection and dragging.

## Acceptance Criteria

- [ ] Clicking an entity selects it (same as today's select mode)
- [ ] Dragging a selected entity moves it (same as today's move mode)
- [ ] The "move" mode is removed from EditorMode and the toolbar
- [ ] Shift+click still toggles multi-select
- [ ] Drag-select (rectangle) still works for multi-selection
- [ ] Group selection and group dragging still work
