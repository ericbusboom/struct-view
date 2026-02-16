---
status: done
sprint: '005'
---

# 2D editor undo/redo

The 2D drawing canvas has no undo/redo. Every drawing action (add node, add segment, move node, delete) should be undoable.

- Command stack pattern for 2D editor operations
- Ctrl+Z / Cmd+Z to undo, Ctrl+Shift+Z / Cmd+Shift+Z to redo
- Track: node add/remove/move, member add/remove, snap edge toggle
- Clear stack when loading a new shape
