---
id: '007'
title: Project JSON import and export
status: in-progress
use-cases:
- SUC-002
depends-on:
- '002'
---

# Project JSON import and export

## Description

Implement save and load for the project model as JSON files. Export serializes the current model state to a downloadable JSON file. Import reads a JSON file, validates it against the schema, and loads it into the model store. This is the project persistence mechanism for V1.

## Implementation Notes

- Export: serialize model store to JSON, trigger browser file download (`.structview.json` extension)
- Import: file input or drag-and-drop, read file, parse JSON, validate with `validateProject()`, load into store
- Validation on import: reject files that fail schema validation with user-facing error messages
- Include metadata in the JSON: version field (for future format migrations), project name, creation/modification timestamps
- JSON should be human-readable (pretty-printed with 2-space indent)
- UI: "Save Project" and "Load Project" buttons in a toolbar or menu

## Acceptance Criteria

- [ ] User can export current model to a downloadable JSON file
- [ ] User can import a JSON file and see the model rendered in the viewport
- [ ] Invalid JSON files produce a clear error message (not a crash)
- [ ] Round-trip: export then import produces identical model state
- [ ] Entity IDs and coordinates are preserved exactly across save/load
- [ ] Project metadata (name, version) is included in the JSON

## Testing

- **Existing tests to run**: Schema validation tests
- **New tests to write**: Round-trip test (create model, export, import, compare), invalid file rejection
- **Verification command**: `npm test`
