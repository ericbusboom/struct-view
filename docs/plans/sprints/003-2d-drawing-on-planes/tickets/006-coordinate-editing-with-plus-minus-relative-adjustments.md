---
id: '006'
title: Coordinate editing with plus/minus relative adjustments
status: done
use-cases:
- SUC-003-04
depends-on:
- '005'
---

# Coordinate editing with plus/minus relative adjustments

## Description

Make the coordinate fields in `PropertiesPanel` (Ticket 005) editable. The user
can type an absolute value or a relative adjustment (+/- prefix) to move the
selected node.

### Input parsing

Create a pure function `parseCoordinateInput(input: string, currentValue: number): number | null`:

- `"5.0"` → absolute: returns 5.0
- `"+2.5"` → relative: returns currentValue + 2.5
- `"-1"` → relative: returns currentValue - 1
- `""` or invalid → returns null (no change)

### Interaction

1. User clicks on a coordinate field (X, Y, or Z)
2. Field becomes editable (text input)
3. User types a value and presses Enter
4. Value is parsed; node position is updated via `useModelStore.updateNode()`
5. Field reverts to display mode showing the new absolute value

### Keyboard handling

The coordinate input fields must capture keyboard events and NOT propagate them
to the KeyboardHandler. Otherwise typing "n" in the X field would switch to
add-node mode. Use `e.stopPropagation()` on the input's `onKeyDown`.

## Acceptance Criteria

- [ ] Clicking a coordinate field makes it editable
- [ ] Typing an absolute value and pressing Enter updates the node position
- [ ] Typing `+5` adds 5 to the current value
- [ ] Typing `-2.5` subtracts 2.5 from the current value
- [ ] Field shows the resulting absolute value after edit
- [ ] Pressing Escape cancels the edit (restores original value)
- [ ] Typing in coordinate fields does NOT trigger keyboard shortcuts (n, m, etc.)
- [ ] Invalid input (non-numeric) is rejected gracefully

## Testing

- **Existing tests to run**: `npx vitest run` (all tests, verify no regressions)
- **New tests to write**: `src/components/__tests__/coordinateParsing.test.ts`
  - parseCoordinateInput with absolute values
  - parseCoordinateInput with +/- relative values
  - parseCoordinateInput with invalid input
  - parseCoordinateInput with empty string
- **Verification command**: `npx vitest run src/components/__tests__/coordinateParsing.test.ts`
