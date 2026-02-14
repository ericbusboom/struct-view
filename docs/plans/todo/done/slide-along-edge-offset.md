---
status: done
sprint: '007'
---

# Slide-along-edge offset control

The spec says: "The user can slide the shape along the snap line to position it, with snapping to grid intervals or to other placed shapes."

The `placeShape` function accepts an `offset` parameter (0..1) but there is no UI to control it.

- Slider or drag handle to slide the shape along the target edge
- Snap offset to grid intervals
- Snap offset to positions of other placed shapes
- Visual feedback showing current offset position
