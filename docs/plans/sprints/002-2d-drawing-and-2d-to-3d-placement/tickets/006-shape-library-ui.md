---
id: "006"
title: Shape library UI
status: todo
use-cases: [SUC-004, SUC-005]
depends-on: ["001", "004"]
---

# Shape library UI

## Description

Implement a UI panel that displays all saved shapes in the current project. Users can save the current 2D editor drawing as a named shape, load an existing shape back into the 2D editor for modification, rename shapes, and delete shapes. The panel also supports designating snap edges by clicking on members within the 2D editor while in a snap-edge toggle mode. All shape CRUD operations persist through the project's `shapes` array.

## Implementation Notes

- Create a `ShapeLibrary` side panel component that lists shapes from `project.shapes[]`.
- Each shape entry shows: name, node/member count summary, thumbnail (optional -- can be deferred).
- **Save**: button captures the current `useEditor2DStore` shape state, prompts for a name, and adds it to the project store's `shapes` array.
- **Load**: clicking a shape in the library populates the 2D editor store with a deep copy of that shape for editing.
- **Rename**: inline edit or dialog to update the shape name in the project store.
- **Delete**: remove the shape from the project store's `shapes` array with a confirmation prompt.
- **Snap edge toggle**: while editing a shape in the 2D editor, a toggle mode allows clicking on members to flip their `isSnapEdge` flag. Snap-edge members should be visually distinguished (e.g., thicker line, different color).
- Shape library panel should be accessible from both the main UI and the 2D editor.

## Acceptance Criteria

- [ ] Shape library panel lists all shapes in the project by name.
- [ ] Save button creates a new named shape from the current 2D editor state.
- [ ] Load button populates the 2D editor with the selected shape's geometry.
- [ ] Rename updates the shape name in the project store and UI.
- [ ] Delete removes the shape from the project after confirmation.
- [ ] Snap edge toggle mode allows clicking members to set/unset `isSnapEdge`.
- [ ] Snap-edge members are visually distinguished in the 2D editor.
- [ ] All shape changes persist in the project JSON (verified via export/import).

## Testing

- **Existing tests to run**: Schema tests from ticket 001, editor store tests from ticket 004.
- **New tests to write**:
  - Store unit test: saving a shape adds it to the project shapes array.
  - Store unit test: loading a shape returns a deep copy (modifying the loaded shape does not alter the stored one).
  - Store unit test: renaming a shape updates the name field.
  - Store unit test: deleting a shape removes it from the array.
  - Store unit test: toggling snap edge flips `isSnapEdge` on the targeted member.
  - Unit test: saved shape passes `Shape2DSchema` validation.
- **Verification command**: `npx vitest run`
