# StructView: AI-Powered Structural Analysis Tool

## Software Specification Document
**Version 0.1 — February 2026**

---

## 1. Overview

StructView is a free, web-based structural analysis tool that lets users build 3D wireframe models of buildings and structures, assign material properties and joint types, apply loads, and run finite element analysis to determine deflections, internal forces, and structural adequacy.

The tool is designed to be dramatically easier to use than existing structural analysis software by constraining the modeling workflow: instead of placing nodes freely in 3D space, users draw 2D shapes, import 3D reference geometry, and snap beams to surfaces and edges. An AI layer (via MCP server) allows users to automate repetitive tasks like laying out studs or assigning material properties in bulk.

### Target Users

- Students learning structural engineering
- Makers and DIY builders designing sheds, garages, decks
- Small contractors doing preliminary structural checks
- Educators teaching beam/truss/frame analysis

### What It Is Not

- Not a replacement for professional engineering software (no code compliance checks, no stamped drawings)
- Not a general-purpose 3D modeler
- Not a BIM tool

---

## 2. Core Workflow

The user workflow has four phases:

### Phase 1: Build the Geometry
Construct a wireframe model of beams and nodes arranged in 3D space. Multiple input methods are available (see Section 3).

### Phase 2: Assign Properties
Click on beams to assign cross-section shape and material (which determines Young's modulus, moment of inertia, cross-sectional area). Click on nodes/joints to assign connection type (pinned, fixed, roller, etc.) and optionally specify connection method (welded, bolted, screwed).

### Phase 3: Apply Loads
Select beams or panels and apply forces: point loads at specific locations, uniformly distributed loads across a member, or area loads on panels. Specify load direction (gravity, lateral, custom vector). Optionally define load cases and combinations.

### Phase 4: Analyze
Run FEA solver (PyNite backend). View results: deflections, bending moment diagrams, shear force diagrams, axial forces, reaction forces. Check whether deflections are within user-specified limits.

---

## 3. Geometry Input Methods

The editor supports several complementary ways to create the wireframe model. All methods produce the same underlying data: a set of nodes (3D coordinates) and members (pairs of nodes).

There is exactly one node per point in space. Nodes are shared across all beams
and planes that reference them. Connection/attachment information (pinned,
fixed, semi-rigid) is stored on the beam ends, not on the node itself.

Drawing is primarily on 2D slices of the 3D space. The user selects a plane from
the 3D space, focuses on the plane, and can add nodes and beams. The user
selects a combination of points and/or beams and then hits the `p` key to create
a plane through the selected objects.

After selecting a plane, the user can place nodes and beams on that plane. Nodes
are points in space, and beams are lines that connect nodes. The user can place
nodes with the mouse, or can select nodes in 2D or 3D to directly edit their
coordinates.

The `f` key toggles between focusing on the 2D plane (if one has been created)
and the 3D space. When focusing on the 2D plane, the camera snaps to a straight
top-down orthogonal view of the plane. All nodes within snap distance of the
plane are visible and editable in this view, including nodes created from other
planes, as long as the plane passes through them. Only the plane's constraint
points are guaranteed to be in the plane; other nodes appear if they fall within
snap distance.

### Selecting Planes

#### Selecting No Points

Pressing `p` with nothing selected creates a plane through the origin. The
initial plane is the XY plane with a point constraint at the origin.

#### Selecting One Point

If the user selects a single point, that point will be included in the selected
plane instead of the origin. The initial plane is the XY plane, with a point
constraint at the selected point.

#### Selecting Two Points

Selecting two points sets a line constraint. The initial plane will be created
in an orientation that minimizes the angle between the plane normal and one of
the three world axes.

#### Selecting Three Points

Selecting three points sets a plane constraint. The initial plane will be
oriented to include all three points.

#### Selecting a Beam

Selecting a beam creates a line constraint. It is equivalent to selecting the
two endpoint nodes of the beam.

#### Selecting a Beam and One Point

Selecting a beam and one point is equivalent to selecting three points: the one
solitary point and the two ends of the beam.

### Modifying a Plane

The selections above may be constrained by a point, a line, or a plane, and the
user can adjust the plane through unconstrained dimensions.

For point constraints, the plane can be rotated freely around the constrained
point using the arrow keys (see Plane Rotation Controls below).

For line constraints, the plane can only be rotated around the constraining
line. The up/down arrow keys rotate the plane around the line.

No rotation controls operate when the plane has a full plane constraint (three points).

#### Plane Rotation Controls

When a plane has a point constraint, the arrow keys rotate the plane around two
tangent vectors that lie within the plane itself. These tangent vectors are
orthogonal to each other and to the plane's normal. On initial placement, the
tangent vectors are seeded from the world axes most perpendicular to the normal.
As the user rotates the plane, the tangent vectors are updated incrementally to
remain consistent with the new orientation, avoiding discontinuous jumps.
Because the rotation axes are always derived from the plane's current
orientation rather than fixed world axes, gimbal lock cannot occur.

Arrow key rotation uses acceleration: a single tap rotates a fraction of a
degree (~0.1°). Holding the key down accelerates up to approximately 5° per
second. Rotation snaps to 15° increments when near a snap angle.

#### Axis Alignment Keys

The <kbd>x</kbd>, <kbd>y</kbd>, and <kbd>z</kbd> keys rotate the plane so that a
line parallel to the corresponding world axis passes through the constrained
point and lies within the plane. In other words, pressing <kbd>x</kbd> orients
the plane so that the plane's normal is perpendicular to the X axis, meaning you
can draw lines parallel to X on the plane. The plane still passes through the
constrained point.

When there is a line constraint, the plane can only be aligned with an axis if the axis direction is perpendicular to the constraining line.

### Editing in 3D

Users cannot place points in 3D space with the mouse, but they can select points, edit them, and create points through direct data entry.

The sidebar has a coordinate entry box where the user can enter x, y, and z
coordinates. Hitting Return after entering the coordinates clears the entry box
and adds the point to the space. There is also a menu option for loading a data
file of x, y, and z points. 

The data file can be either:
- A text file with x, y, z values on each line, separated by spaces or commas
- A CSV file with an x, y, z header row (or headerless, with columns assumed to
  be x, y, z)

If the user selects a point, the coordinate entry box shows that point's x, y,
and z values. Deselecting the point or hitting Escape clears the values. Users
can edit the values directly, or apply relative adjustments by typing `+` or `-`
followed by a number to shift the coordinate along that axis. After the
adjustment, the resulting value replaces the expression in the entry box.

### Editing in 2D

In 2D, the user can place points on the grid with the mouse. By default, the
grid snaps to one-inch increments when working in imperial units, or one
centimeter increments when working in metric. The user can change the snap
distance and grid increment

The `n` key activates node placement mode. The `b` key activates beam placement
mode. In beam mode, the first click sets the start node and the second click
sets the end node. If the cursor is over an existing node, that node highlights
and is reused as the beam endpoint (the node is shared, not duplicated). To
place a beam, the user can either place the nodes first and then connect them
with `b`, or create nodes on the fly as part of beam placement.

When a point is selected in 2D, the sidebar shows the full 3D world coordinates
of the node (not just the 2D plane coordinates). As in 3D, the user can edit
coordinates directly or apply +/- adjustments.

### Node Visibility Across Planes

If a plane passes through an existing node (i.e., the node is within snap
distance of the plane), that node is visible and editable in the 2D view. This
means beams from different planes can share the same node by connecting to it
from their respective 2D views. Nodes that are constraint points for the plane
are always included; other nodes are included if they fall within snap distance
of the plane surface.

### Grouping

When placing a truss from the library (see Section 3.1), the placed nodes and beams form a group. Groups can also be created manually: drag a rectangular selection box to select nodes, shift-click to add or remove individual nodes from the selection, then click a Group button to create a group from the selection. Grouped elements can be moved together as a unit.

### 3.1 Truss Library

The truss library provides reusable 2D shapes (Pratt, Howe, Warren, Scissors,
and user-created shapes). All shapes are stored in 2D regardless of the
orientation of the plane they were originally drawn on.

To save to the library, the user draws a truss on any 2D plane view and saves
the current drawing as a named library entry.

To place from the library, the user selects a shape from the library panel while
in a 2D plane view. The shape is placed into the current plane and its nodes and
beams become a group that can be selected and moved as a unit.

## 4. Panels

Panels represent sheet materials (plywood, sheet metal, drywall, etc.) that span
between beams. They contribute to structural behavior (shear walls, diaphragms,
load distribution).

### Creating Panels

**Method 1: Closed Loop Tool**
- Activate the closed loop tool
- Click on a sequence of nodes (minimum 3)
- Close the loop (click the first node again, or press Enter)
- A panel is created spanning those nodes
- The panel is a planar surface; if the selected nodes are not coplanar, the tool warns and projects to best-fit plane

**Method 2: Select-and-Sheet**
- Select a set of beams that form a closed boundary (e.g., a rectangular frame of studs with top and bottom plates)
- Choose "Create Panel" from the context menu
- A panel is generated covering the outer boundary of the selected beams
- The panel's edges attach to the beams

### Panel Properties

- Material (plywood, OSB, steel sheet, etc.)
- Thickness
- Orientation (which side of the beams the panel sits on)
- The tool calculates shear stiffness and membrane properties from material + thickness

---

## 5. AI Integration (MCP Server)

When a user creates a project, the tool generates an MCP server endpoint that can be added to any MCP-compatible AI client (Claude, etc.). This allows the user to issue natural language commands to modify the structural model.

### MCP Server Capabilities

The MCP server exposes tools for:

**Geometry manipulation:**
- List all nodes, members, panels, and their properties
- Add/remove/move nodes and members
- Place 2D shapes into the 3D scene at specified positions
- Auto-layout beams on reference shape faces (studs, joists, rafters)
- Mirror, copy, and array operations

**Property assignment:**
- Set material for selected members (e.g., "make all wall studs 2×4 SPF lumber")
- Set cross-section for selected members (e.g., "make the ridge beam a W8×31 steel I-beam")
- The AI looks up standard material properties (Young's modulus, yield strength) and section properties (moment of inertia, section modulus, cross-sectional area) from a built-in database
- Set joint types for selected nodes

**Load application:**
- Apply point loads or distributed loads to members
- Apply area loads to panels
- Define load cases (dead, live, wind, snow) and combinations

**Analysis:**
- Trigger analysis run
- Query results (max deflection, critical members, reaction forces)
- Check results against user-specified limits

### Example MCP Interaction

```
User (via Claude): "Take all the vertical members on the north wall 
and make them 2×4 Douglas Fir studs on 16-inch centers. Then make the 
top and bottom plates 2×4 as well."

AI calls MCP tools:
  1. list_members(filter={wall: "north", orientation: "vertical"})
  2. set_member_properties(member_ids=[...], material="douglas_fir", 
     section="2x4_nominal")
  3. list_members(filter={wall: "north", role: "plate"})
  4. set_member_properties(member_ids=[...], material="douglas_fir", 
     section="2x4_nominal")
```

---

## 6. Property Assignment (Manual)

### 6.1 Beam/Member Properties

Click a beam (or select multiple beams) and set:

- **Material**: Choose from database (structural steel grades, lumber species/grades, aluminum alloys, concrete, custom). Each material provides: Young's modulus (E), shear modulus (G), yield strength, density.
- **Cross-section**: Choose from standard sections (W-shapes, HSS, C-channels, angles, lumber nominal sizes, pipe, custom). Each section provides: area (A), moment of inertia (Ix, Iy), section modulus (Sx, Sy), shear area, torsional constant.
- **Length**: Auto-calculated from node positions, displayed for reference.

### 6.2 Joint/Node Properties

Click a node and set:

- **Support type** (if the node is a support): Fixed (no translation, no rotation), Pinned (no translation, free rotation), Roller (free translation in one axis, free rotation), Spring (with stiffness value)
- **Connection type** (how members connect at this node): Rigid (moment-carrying, like a welded connection), Pinned (no moment transfer, like a bolted gusset plate), Semi-rigid (partial fixity, with stiffness specified)
- **Connection method** (informational/metadata): Welded, bolted, screwed, nailed, glued — this doesn't directly affect analysis but is stored for documentation

---

## 7. Load Specification

### 7.1 Point Loads

Select a beam and place a point load at a specific location along it. Specify magnitude and direction (dropdown for common directions: gravity, lateral, uplift; or custom 3D vector).

### 7.2 Distributed Loads

Select a beam and apply a uniform or linearly varying load along its length. Specify magnitude (force per unit length) and direction.

### 7.3 Area Loads

Select a panel and apply a uniform pressure load. The tool automatically distributes this to the supporting beams based on tributary area.

### 7.4 Self-Weight

Toggle to automatically apply gravity loads based on member/panel material densities and cross-sections.

### 7.5 Load Cases and Combinations

- Define named load cases (Dead, Live, Snow, Wind, etc.)
- Assign loads to cases
- Define combinations with factors (e.g., 1.2D + 1.6L)
- Analysis runs all combinations and reports envelope results

---

## 8. Analysis and Results

### 8.1 Solver

Backend: PyNite (Python 3D FEA library) running server-side.

The web frontend sends the model (nodes, members, properties, supports, loads) as a JSON payload to a Python backend, which constructs a PyNite model, runs the analysis, and returns results.

Analysis types supported:
- Linear static analysis
- P-delta (second-order) analysis for stability-sensitive structures

### 8.2 Results Display

- **Deflected shape**: 3D wireframe overlay showing exaggerated deflections with color scale
- **Bending moment diagrams**: Displayed along each member
- **Shear force diagrams**: Displayed along each member
- **Axial force diagrams**: Color-coded (red = compression, blue = tension)
- **Reaction forces**: Shown as arrows at support nodes with magnitude labels
- **Member stress**: Max stress in each member, highlighted if exceeding yield

### 8.3 Limit Checks

User specifies allowable deflection limits (e.g., L/240 for floor beams, L/360 for beams supporting plaster). The tool highlights members exceeding limits in red.

---

## 9. Data Model

### Node
```
{
  id: string,
  position: {x: number, y: number, z: number},  // meters
  support: {
    type: "free" | "pinned" | "fixed" | "roller_x" | "roller_y" | "roller_z" | "spring",
    spring_stiffness?: {kx, ky, kz, krx, kry, krz}
  },
  connection_type: "rigid" | "pinned" | "semi_rigid",
  connection_method?: "welded" | "bolted" | "screwed" | "nailed" | "glued",
  tags: string[]  // e.g., ["north_wall", "ground_floor"]
}
```

### Member
```
{
  id: string,
  start_node: string,  // node id
  end_node: string,     // node id
  material: {
    name: string,
    E: number,          // Young's modulus (Pa)
    G: number,          // Shear modulus (Pa)
    density: number,    // kg/m³
    yield_strength: number  // Pa
  },
  section: {
    name: string,
    A: number,          // Cross-sectional area (m²)
    Ix: number,         // Moment of inertia, strong axis (m⁴)
    Iy: number,         // Moment of inertia, weak axis (m⁴)
    Sx: number,         // Section modulus, strong axis (m³)
    Sy: number,         // Section modulus, weak axis (m³)
    J: number,          // Torsional constant (m⁴)
  },
  end_releases: {
    start: {fx, fy, fz, mx, my, mz},  // boolean: true = released
    end:   {fx, fy, fz, mx, my, mz}
  },
  tags: string[]
}
```

### Panel
```
{
  id: string,
  node_ids: string[],   // ordered list of boundary nodes (≥3)
  material: {
    name: string,
    E: number,
    G: number,
    thickness: number,  // meters
    density: number
  },
  side: "positive" | "negative",  // which side of the beams
  tags: string[]
}
```

### Load
```
{
  id: string,
  case: string,        // load case name
  type: "point" | "distributed" | "area" | "self_weight",
  target: string,      // member or panel id
  magnitude: number,   // N, N/m, or N/m²
  direction: {x, y, z},  // unit vector
  position?: number,   // 0-1 along member for point loads
  start_magnitude?: number,  // for linearly varying loads
  end_magnitude?: number
}
```

---

## 10. Technology Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Frontend | React + Three.js | 3D viewport, 2D drawing canvas, property panels |
| 3D Rendering | Three.js | Wireframe display, STL import, snapping engine |
| 2D Drawing | HTML Canvas or SVG | Truss/frame editor with snap-to-grid |
| Backend API | Python (FastAPI or Flask) | Receives model JSON, runs analysis, returns results |
| FEA Solver | PyNite | 3D structural FEA |
| Section Properties | sectionproperties (Python) | Cross-section calculations |
| Material Database | JSON/SQLite | Standard materials and sections |
| MCP Server | Python (MCP SDK) | Per-project MCP endpoint for AI integration |
| Hosting | Static frontend + serverless Python backend | Frontend on CDN, backend on AWS Lambda or similar |
| File Format | JSON | Project files are JSON, importable/exportable |

---

## 11. STL Reference Shape Handling

The imported STL is used purely as a snapping reference. It is not meshed or analyzed.

**Processing on import:**
1. Parse STL triangles
2. Extract unique vertices and edges
3. Build spatial index for fast snap queries (octree or BVH)
4. Render as semi-transparent mesh in the 3D viewport

**Snap targets derived from STL:**
- Vertices (corner points)
- Edge midpoints
- Points along edges (at grid intervals)
- Face centers
- Nearest point on face surface (for freeform placement)

**Auto-layout from STL faces:**
- User selects a face (or set of coplanar faces)
- Tool identifies the bounding rectangle of the face
- Generates parallel beams at specified spacing within that rectangle
- Adds perimeter beams along the face edges

---

## 12. Design Decisions

1. **Panel analysis fidelity**: Out of scope for detailed modeling. Panels use whatever representation the solver library (PyNite) natively supports. If PyNite supports plate elements, use them; otherwise panels serve as load distribution surfaces and metadata only. The primary analysis focus is beam deflections and member forces.

2. **Units**: The underlying data model stores everything in metric (meters, Newtons, Pascals). The UI supports both imperial and metric input/display. When the user enters imperial values, the original imperial value is stored alongside the metric conversion so that round-tripping is exact — if a user types "8 ft" they always see "8 ft", never "2.4384 m converted back to 7.99999 ft." The display unit preference is a per-project setting.

3. **Undo/redo**: Yes. Every model mutation (add/remove/move node, add/remove member, change property, apply load, etc.) is an undoable operation. Implementation via a command stack pattern.

4. **Collaboration**: Single-user only. No multi-user editing, no shared sessions.

5. **Result export**: Deferred. Not in initial scope.

6. **Non-planar panels**: The tools are designed to make non-planar panels hard to create in the first place (closed-loop tool warns if nodes are not coplanar, select-and-sheet only works on planar beam sets). If a user somehow creates one, warn and refuse rather than trying to handle it.

7. **STL complexity**: Apply a reasonable mesh simplification on import (vertex merging, edge collapse to a target count). If the result is still too complex or the import fails, the user gets an error message telling them to simplify the STL before importing. No heroic recovery attempts.

8. **Solver scope**: Linear static analysis and basic P-delta only. The goal is beam deflections, member forces, and reaction forces. No dynamic/modal analysis, no seismic, no frequency response. Keep it simple.
