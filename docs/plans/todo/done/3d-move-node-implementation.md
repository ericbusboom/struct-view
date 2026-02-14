---
status: done
sprint: '007'
---

# 3D move node implementation

Sprint 001 added a "Move" mode (G key) to the toolbar but it does nothing. The mode exists in the editor store but no drag/transform functionality is implemented.

- Add TransformControls (from @react-three/drei) or custom drag handlers
- When in move mode, clicking a node enables dragging it in 3D
- Connected members should update in real-time during drag
- Snap to grid while dragging
- Constrain to axis with shift key
