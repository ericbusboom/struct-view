---
id: '005'
title: Truss templates
status: done
use-cases:
- SUC-005
depends-on:
- '001'
---

# Truss templates

## Description

Implement built-in truss template generators for four common truss types: Pratt, Howe, Warren, and scissors. Each generator is a pure function that accepts span, depth, and panel count parameters and returns a fully-formed `Shape2D`. Templates can be loaded into the 2D editor for further customization, and then saved as named shapes. A template picker UI allows the user to select a template and configure its parameters before generating.

## Implementation Notes

- Implement generator functions:
  - `generatePrattTruss(span: number, depth: number, panels: number): Shape2D` -- top and bottom chords with verticals and diagonals sloping toward the center.
  - `generateHoweTruss(span: number, depth: number, panels: number): Shape2D` -- top and bottom chords with verticals and diagonals sloping away from the center.
  - `generateWarrenTruss(span: number, depth: number, panels: number): Shape2D` -- top and bottom chords with alternating diagonals, no verticals.
  - `generateScissorsTruss(span: number, depth: number, panels: number): Shape2D` -- crossed diagonal pattern between top and bottom chords.
- Each function generates unique node/member ids and sets `isSnapEdge: true` on the bottom chord members by default.
- Template picker UI component: dropdown or card grid showing the four templates with input fields for span, depth, and panel count. A "Generate" button loads the result into the 2D editor canvas.
- Templates should generate in the shape's local coordinate space with the bottom-left corner at origin (0, 0).

## Acceptance Criteria

- [ ] Four truss templates are available: Pratt, Howe, Warren, scissors.
- [ ] Each template generates geometrically correct node and member arrangements.
- [ ] Span, depth, and panel count are configurable per template.
- [ ] Generated shapes pass `Shape2DSchema` validation.
- [ ] Bottom chord members are marked as snap edges by default.
- [ ] Template can be loaded into the 2D editor for customization.
- [ ] Template picker UI is accessible from the 2D editor.

## Testing

- **Existing tests to run**: Shape schema validation tests from ticket 001.
- **New tests to write**:
  - Unit test: `generatePrattTruss(10, 2, 4)` returns a shape with expected node count (2*(4+1) = 10 nodes) and correct member count.
  - Unit test: `generateHoweTruss` returns correct node/member topology.
  - Unit test: `generateWarrenTruss` returns correct alternating diagonal pattern with no verticals.
  - Unit test: `generateScissorsTruss` returns correct crossed diagonal pattern.
  - Unit test: all templates produce shapes that pass `Shape2DSchema.parse()`.
  - Unit test: bottom chord members have `isSnapEdge: true`.
  - Unit test: varying panel count changes the number of internal divisions.
- **Verification command**: `npx vitest run`
