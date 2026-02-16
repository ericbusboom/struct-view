---
id: '008'
title: Adapt truss templates (Pratt, Howe, Warren, Scissors) for new workflow
status: done
use-cases: []
depends-on: ["007"]
---

# Adapt truss templates (Pratt, Howe, Warren, Scissors) for new workflow

## Description

Integrate the existing TemplatePicker component into the TrussLibraryPanel
sidebar via a "+ Template" button. When clicked, the inline picker shows
type/span/depth/panels controls. Generate adds the Shape2D to the library,
making it available for the "Add to 3D" plane-based placement workflow.

## Acceptance Criteria

- [x] "+ Template" button in TrussLibraryPanel header
- [x] TemplatePicker renders inline in the sidebar
- [x] All four template types (Pratt, Howe, Warren, Scissors) available
- [x] Generated templates added to shapes library via addShape
- [x] Inline picker styled for sidebar context
- [x] All existing tests pass (307)

## Testing

- **Existing tests**: `trussTemplates.test.ts` (15 tests)
- **Verification command**: `cd frontend && npx vitest run`
