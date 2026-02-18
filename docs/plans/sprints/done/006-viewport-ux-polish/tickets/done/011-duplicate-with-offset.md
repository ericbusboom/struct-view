---
id: '011'
title: Duplicate with offset
status: done
use-cases: []
depends-on:
- '006'
---

# Duplicate with offset

## Description

Select one or more items, then activate a "Duplicate" action that opens a
dialog to specify an X/Y/Z offset. The selected items are duplicated at the
offset position.

Primary use case: lay out stud base nodes, select all, duplicate with Z offset
of 8 ft to create the top-of-wall nodes. Then connect top to bottom with beams.

## Acceptance Criteria

- [ ] Toolbar button (or keyboard shortcut) opens a duplicate-with-offset dialog
- [ ] Dialog has X, Y, Z offset fields
- [ ] Works with individually selected nodes
- [ ] Works with individually selected beams (duplicates both the beam and its end nodes)
- [ ] Works with grouped objects
- [ ] If both nodes of a beam are selected, the beam is implicitly duplicated too
- [ ] Duplicated items are selected after creation (original items deselected)
