---
id: '005'
title: Editor commands - create, move, delete nodes and members
status: in-progress
use-cases:
- SUC-001
depends-on:
- '002'
- '004'
---

# Editor commands - create, move, delete nodes and members

## Description

Implement the core editing operations that let users build and modify wireframe models. Each operation should be structured as a command (function that mutates the model store) so that undo/redo can be layered on later. Operations include: add node, move node, delete node, add member (between two nodes), delete member.

## Implementation Notes

- Command-oriented design: each operation is a named function that takes the model store and parameters, performs validation, and applies the mutation
  - `addNode(position)` — generates unique ID, adds to store
  - `moveNode(nodeId, newPosition)` — updates position
  - `deleteNode(nodeId)` — removes node and any members referencing it
  - `addMember(startNodeId, endNodeId)` — validates both nodes exist, generates unique ID
  - `deleteMember(memberId)` — removes member (does not remove orphaned nodes)
- UI interaction for this ticket:
  - Toolbar or keyboard shortcut to enter "add node" mode — click in viewport places a node (on the ground plane or at a snapped position)
  - "Add member" mode — click two existing nodes to create a member between them
  - "Move" mode — drag a selected node to a new position
  - "Delete" — press Delete key to remove selected entity
- ID generation: use nanoid or UUID for unique, stable IDs

## Acceptance Criteria

- [ ] User can click in the viewport to place new nodes
- [ ] User can click two nodes to create a member between them
- [ ] User can drag a node to move it; connected members update
- [ ] User can delete a selected node (members connected to it are also removed)
- [ ] User can delete a selected member (nodes remain)
- [ ] Invalid operations (e.g., member with non-existent node) are prevented
- [ ] All operations validate model integrity after mutation

## Testing

- **Existing tests to run**: Schema validation, store CRUD
- **New tests to write**: Each command function — valid inputs succeed, invalid inputs rejected, model integrity maintained
- **Verification command**: `npm test`
