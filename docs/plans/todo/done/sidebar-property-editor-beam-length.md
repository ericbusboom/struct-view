---
status: done
sprint: '006'
---

# Sidebar Property Editor with Beam Length Setting

When you click on elements (nodes, beams), the sidebar should show a contextual
editing pane for that element's properties.

## Beam Length Editing

For beams specifically, the sidebar should display and allow editing of the beam
length. To set the length:

1. Select a beam **and** one of its endpoint nodes.
2. The selected node is the one that will move when the length is changed.
3. Editing the length field repositions the selected node along the beam's
   direction to achieve the desired length. The other endpoint stays fixed.

This gives the user explicit control over which end moves, avoiding ambiguity.

## General Sidebar Behavior

- Clicking a node: show node properties (position, support type, etc.)
- Clicking a beam: show beam properties (length, section, material, etc.)
- Clicking a beam + a node: show beam properties with the length field editable
  (the selected node is the movable end)
