---
id: '003'
title: Settings store (units, snap grid, grid spacing, plane size)
status: done
use-cases: []
depends-on: []
---

# Settings store (units, snap grid, grid spacing, plane size)

## Description

Create a persisted Zustand settings store (or extend an existing store) to hold
project-level settings. These values are consumed by the grid renderer, snap
logic, plane creation, and unit display formatting.

Scale context: structural engineering. Smallest objects ~3 ft / 1 m. Drawn
dimensions never smaller than 1/8 inch.

## Acceptance Criteria

- [ ] Store holds: unit system (`imperial` | `metric`), snap grid size, grid line spacing, work plane size
- [ ] Defaults are sensible for structural engineering (e.g., 1 ft snap for imperial, 0.25 m for metric)
- [ ] Store is persisted to localStorage (same pattern as useModelStore)
- [ ] Existing grid/snap logic reads from this store instead of hardcoded values
- [ ] Changing unit system updates display formatting throughout the app
