---
id: '002'
title: Relative expression editing in coordinate fields
status: done
use-cases: []
depends-on:
- '001'
---

# Relative expression editing in coordinate fields

## Description

Extend the coordinate input fields (sidebar and dimension overlay) so that
users can make relative adjustments by appending `+` or `-` expressions to
the current value.

## Acceptance Criteria

- [ ] Clicking a field selects/highlights the entire number for immediate overwrite
- [ ] Pressing left arrow un-highlights and moves the cursor to the end of the number
- [ ] User can then type `+3` or `-1.5` to append a relative adjustment
- [ ] On Return or Tab, the expression is evaluated (e.g., `12.5+3` → `15.5`) and the result is applied
- [ ] Supports basic `+` and `-` operations (no need for `*` / `/`)
- [ ] Works in both the sidebar properties panel and the dimension overlay inline editors
