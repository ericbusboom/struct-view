---
id: '006'
title: Selection system - click to select nodes and members
status: in-progress
use-cases:
- SUC-003
depends-on:
- '004'
---

# Selection system - click to select nodes and members

## Description

Implement click-to-select for nodes and members in the 3D viewport. Selected entities should be visually highlighted. Selection state drives the properties panel (future sprints) and editing operations (delete, move).

## Implementation Notes

- Use Three.js raycasting to detect which node or member the user clicked
- Selection state in the model store: `selectedNodeIds: string[]`, `selectedMemberIds: string[]`
- Visual feedback: selected nodes change color (e.g., yellow), selected members change color or thicken
- Click on empty space deselects all
- Shift+click to add to selection (multi-select)
- Selection priority: nodes over members (if a click hits both, prefer the node)
- Expose selection state so other components can read it (e.g., properties panel, editor commands)

## Acceptance Criteria

- [ ] Clicking a node selects it (highlighted visually)
- [ ] Clicking a member selects it (highlighted visually)
- [ ] Clicking empty space deselects all
- [ ] Shift+click adds to current selection
- [ ] Selection state is accessible from other components
- [ ] Delete key works on selected entities (integrates with ticket 005)

## Testing

- **Existing tests to run**: Store tests, rendering smoke test
- **New tests to write**: Selection store operations — select, deselect, multi-select, clear
- **Verification command**: `npm test`
