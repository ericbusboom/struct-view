---
id: '001'
title: Editable coordinate fields in properties panel
status: done
use-cases: []
depends-on: []
---

# Editable coordinate fields in properties panel

## Description

When a node is selected, the X/Y/Z coordinate fields in the sidebar properties
panel should be directly editable text inputs. Currently they display values but
don't support inline editing with a natural keyboard flow.

## Acceptance Criteria

- [ ] Clicking a coordinate field selects its entire contents (full text selected on focus)
- [ ] Typing a number overwrites the current value
- [ ] Pressing Return accepts the value, updates the node position, and advances focus to the next field (X → Y → Z)
- [ ] Pressing Tab also accepts and advances focus
- [ ] Workflow: click X field, type `0`, Return, `0`, Return, `0`, Return — moves the node to the origin
- [ ] Invalid input (non-numeric) is rejected or ignored gracefully
