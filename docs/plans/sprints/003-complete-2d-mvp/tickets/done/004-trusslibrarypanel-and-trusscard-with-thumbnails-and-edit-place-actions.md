---
id: '004'
title: TrussLibraryPanel and TrussCard with thumbnails and edit/place actions
status: done
use-cases:
- SUC-002
depends-on: []
---

# TrussLibraryPanel and TrussCard with thumbnails and edit/place actions

## Description

Create a persistent right-side panel showing all saved trusses as visual cards:

1. Create `TrussLibraryPanel.tsx` — docked on the right side of the main
   layout, ~240px wide, vertically scrollable.
2. Create `TrussCard.tsx` — renders a thumbnail of the truss shape, its
   name, and Edit / Add-to-3D action buttons.
3. Thumbnail rendering: compute bounding box of shape nodes, scale to fit
   a ~200x120 canvas/SVG area, draw nodes and members.
4. Edit button opens the 2D editor pop-up with the shape loaded.
5. Add-to-3D button starts the existing placement workflow.
6. Empty state message when no trusses exist.

## Acceptance Criteria

- [ ] Panel docked on right side, always visible
- [ ] One card per saved shape in the model store
- [ ] Each card shows a recognizable thumbnail of the truss geometry
- [ ] Edit button opens 2D editor with shape loaded for editing
- [ ] Add-to-3D button initiates the placement workflow
- [ ] Panel scrolls when many trusses are present
- [ ] Empty state shows helpful message

## Testing

- **Existing tests to run**: Shape library tests
- **New tests to write**: TrussCard rendering, action button callbacks, empty state
- **Verification command**: `npm test` + manual visual verification
