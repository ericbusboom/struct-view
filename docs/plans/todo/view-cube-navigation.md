---
status: pending
---

# View cube for setting specific camera views

Add a traditional view cube to the 3D viewport that allows users to set specific
camera views by clicking on it.

## Description

The view cube should display face labels ("Front", "Back", "Left", "Right",
"Top", "Bottom") and allow interaction on:

- **Faces**: Click to snap camera to that orthogonal view
- **Edges**: Click to snap to a view that's between two adjacent faces
- **Corners**: Click to snap to an isometric-like view from that corner

The cube should be rendered as a small overlay in a corner of the viewport
(typical placement: top-right) and rotate to reflect the current camera
orientation. Clicking any face, edge, or corner animates the camera to that
view.
