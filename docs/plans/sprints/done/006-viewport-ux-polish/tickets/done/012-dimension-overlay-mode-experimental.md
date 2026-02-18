---
id: '012'
title: Dimension overlay mode (experimental)
status: done
use-cases: []
depends-on:
- '001'
---

# Dimension overlay mode (experimental)

## Description

A toggleable mode that annotates the 3D viewport with measurements. This is
experimental — the goal is to get a working prototype and iterate.

## Acceptance Criteria

- [ ] Toggle button (or keyboard shortcut) enables/disables the dimension overlay
- [ ] Beam lengths are displayed near the center of each beam
- [ ] Node positions are displayed as `(x, y, z)` triplets near each node
- [ ] Labels are readable at various zoom levels (billboard text facing camera)
- [ ] Clicking a label makes it editable inline in the viewport
- [ ] Editing a node position label updates the node's actual position
- [ ] Editing a beam length is a stretch goal (would need to decide which node moves)
