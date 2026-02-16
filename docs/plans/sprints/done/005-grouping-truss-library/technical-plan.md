---
status: draft
---

# Sprint 005 Technical Plan

## Architecture Overview

This sprint adds selection, grouping, and library UI on top of the Group data
model from Sprint 001. The drag selection is a 3D viewport interaction; the
library save/place operations convert between 2D Shape coordinates and 3D plane
coordinates. Most of the truss template code from the existing codebase survives
with minor adaptation.

```
New Files:
  src/components/DragSelect.tsx      -- Rectangular drag selection overlay
  src/components/GroupPanel.tsx       -- Sidebar panel for group management
  src/components/LibrarySaveDialog.tsx -- Dialog for saving to library
  src/components/LibraryPlacement.tsx -- Preview and confirm library placement
  src/editor2d/shapeToPlane.ts       -- Map Shape2D coords to plane 3D coords

Modified Files:
  src/components/Viewport3D.tsx      -- Mount DragSelect
  src/components/KeyboardHandler.tsx  -- Group shortcut key
  src/components/TrussLibraryPanel.tsx -- Rebuild for plane-based workflow
  src/components/TemplatePicker.tsx   -- Adapt for plane placement
  src/editor2d/trussTemplates.ts     -- Minor: ensure Shape2D output is clean
  src/store/useEditorStore.ts        -- Add group selection tracking
  src/App.tsx                        -- Mount GroupPanel, library components
```

## Component Design

### Component: DragSelect (`components/DragSelect.tsx`)

**Use Cases**: SUC-005-01

A transparent overlay that captures mouse drag events and draws a selection
rectangle. On release, it projects the 2D screen rectangle into 3D using
frustum testing to determine which nodes are inside.

Implementation options:
- Three.js SelectionBox utility
- Manual: create a secondary frustum from the drag rectangle corners and test
  each node's screen-space position

Shift modifier: if Shift is held, add to existing selection rather than
replacing.

### Component: GroupPanel (`components/GroupPanel.tsx`)

**Use Cases**: SUC-005-03, SUC-005-04

Sidebar panel showing:
- List of existing groups with name and member count
- "Create Group" button (active when nodes are selected)
- Click a group to select all its members
- Delete button per group

### Component: Group Movement

**Use Cases**: SUC-005-04

When a group is selected (useEditorStore.selectedGroupId is set), dragging
uses a modified NodeDragger that translates all group nodes by the same
delta vector. The existing planeMove.ts can compute the drag delta; we just
apply it to multiple nodes.

```ts
function moveGroup(groupId: string, delta: Vec3): void {
  const group = useModelStore.getState().getGroup(groupId)
  for (const nodeId of group.nodeIds) {
    const node = useModelStore.getState().nodes.find(n => n.id === nodeId)
    useModelStore.getState().updateNode(nodeId, {
      position: { x: node.x + delta.x, y: node.y + delta.y, z: node.z + delta.z }
    })
  }
}
```

### Component: Shape-to-Plane Mapping (`editor2d/shapeToPlane.ts`)

**Use Cases**: SUC-005-06, SUC-005-07

Converts Shape2D (2D x,y coordinates) into 3D world coordinates on the active
plane.

```ts
function placeShapeOnPlane(
  shape: Shape2D,
  plane: WorkingPlane,
  offset: { u: number, v: number }  // placement offset in plane coords
): { nodes: Node[], members: Member[], groupName: string }
```

The function:
1. Maps each shape node's (x, y) to plane 3D via `planeLocalToWorld(x + offset.u, y + offset.v, plane)`
2. Checks for existing nodes within snap distance; reuses if found
3. Creates members referencing the (possibly reused) node IDs
4. Returns the created entities for the caller to add to useModelStore and
   create a Group

### Component: Library Save (`components/LibrarySaveDialog.tsx`)

**Use Cases**: SUC-005-05

Dialog with a text input for the shape name. On confirm:
1. Collect all nodes/beams currently on the active plane
2. Project them from 3D world coordinates to plane-local (u, v) coordinates
3. Create a Shape2D with these 2D coordinates
4. Call `useModelStore.addShape(shape)`

### Component: Library Placement (`components/LibraryPlacement.tsx`)

**Use Cases**: SUC-005-06

When a library shape is selected for placement:
1. Show a ghost preview of the shape on the current plane (follows mouse)
2. Click to confirm placement position
3. Call `placeShapeOnPlane()` to create nodes/members
4. Create a Group for the placed elements

### Component: Template Adaptation (`editor2d/trussTemplates.ts`)

**Use Cases**: SUC-005-07

The existing templates (createPrattTruss, createHoweTruss, createWarrenTruss,
createScissorsTruss) already generate Shape2D objects. They need minimal
changes:
- Ensure `placementPlane` field is set
- The TemplatePicker UI changes from "opens 2D canvas editor" to "places into
  current plane view" using the same `placeShapeOnPlane()` function

## Data Flow

```
Drag Select:
  Mouse drag -> DragSelect captures rectangle
  -> Frustum test against all nodes
  -> Set selectedNodeIds in useEditorStore

Create Group:
  Click "Create Group" button
  -> Prompt for name
  -> useModelStore.addGroup(name, selectedNodeIds, enclosedMemberIds)
  -> Clear selection, select group

Move Group:
  Drag selected group
  -> Compute delta from planeMove
  -> moveGroup(groupId, delta) updates all node positions
  -> SceneModel re-renders

Save to Library:
  Click "Save to Library"
  -> Collect plane nodes/beams
  -> Project to 2D plane-local coords
  -> useModelStore.addShape(newShape2D)

Place from Library:
  Select shape, click to place
  -> placeShapeOnPlane(shape, activePlane, clickOffset)
  -> useModelStore.addNode/addMember for each element
  -> useModelStore.addGroup for the placed set
```

## Open Questions

- Should the library panel be a sidebar tab or a floating panel?
  (Recommendation: sidebar tab, consistent with existing panels)
- Should group colors be user-configurable?
  (Recommendation: auto-assign colors from a palette, editable later)
