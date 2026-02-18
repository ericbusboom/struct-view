---
id: '010'
title: B+click beam shortcut
status: done
use-cases: []
depends-on: []
---

# B+click beam shortcut

## Description

In select mode, holding B and clicking a node creates a beam from the currently
selected node to the clicked node. This avoids switching to add-member mode for
quick beam placement.

## Acceptance Criteria

- [ ] With exactly one node selected, holding B and clicking another node creates a beam between them
- [ ] Selection advances to the clicked node after beam creation (enables chaining)
- [ ] Chaining works: select A → B+click B → B+click C creates beams A–B and B–C
- [ ] Does nothing if zero or multiple nodes are selected
- [ ] Does not interfere with other B key behavior (currently none)
- [ ] Does not create duplicate beams between the same two nodes
