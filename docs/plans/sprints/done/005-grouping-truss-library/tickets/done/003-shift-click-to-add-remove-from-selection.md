---
id: "003"
title: Shift-click to add/remove from selection
status: done
use-cases: [SUC-005-02]
depends-on: []
---

# Shift-click to add/remove from selection

## Description

Shift-click allows toggling individual nodes/members in/out of the current
selection. This was already implemented in prior sprints via `toggleSelect`
in useEditorStore, called from NodeMesh and MemberLine on shift+click.

## Acceptance Criteria

- [x] Shift-click on unselected node adds it to selection
- [x] Shift-click on selected node removes it from selection
- [x] Regular click (no Shift) replaces the entire selection
- [x] Works for both nodes and members
- [x] Existing tests cover all cases

## Testing

- **Existing tests to run**: `cd frontend && npx vitest run`
- **Existing test coverage**: `editorCommands.test.ts` — toggleSelect tests
- **Verification command**: `cd frontend && npx vitest run`
