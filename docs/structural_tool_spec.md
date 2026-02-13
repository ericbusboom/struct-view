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

### 3.1 2D Drawing Mode (Trusses and Frames)

A 2D canvas where the user draws line segments that represent beams. This is the primary way to create trusses and frame cross-sections.

**Behavior:**
- Draw lines by clicking start and end points
- Aggressive snapping: endpoints snap to existing nodes, to grid intersections, to midpoints of existing beams, and to perpendicular/parallel alignments
- When a new line endpoint is near an existing node, it connects to that node automatically
- Standard truss templates available (Pratt, Howe, Warren, scissors, etc.) as starting points
- The 2D drawing lives in its own coordinate space and can be named (e.g., "Roof Truss A")

**Output:** A named 2D shape consisting of nodes and members, with one or more members optionally tagged as "snap edges" (see Section 3.3).

### 3.2 3D Reference Shape (STL Import)

The user imports an STL file representing the outer envelope of the structure. This shape is not part of the structural model — it is a reference surface that beams snap to.

**Behavior:**
- Import STL from file upload (exported from Tinkercad, Fusion 360, FreeCAD, etc.)
- The STL renders as a semi-transparent shell in the 3D viewport
- When the user is placing or moving beams in 3D mode, the cursor and beam endpoints snap to:
  - Vertices of the STL mesh
  - Edges of the STL mesh
  - The surface of STL faces
  - Other beams that are already placed
- The STL shape can also be used to auto-generate beam layouts (see Section 5)

**Example:** User creates a rectangular box in Tinkercad (the walls of a garage), exports STL, imports into StructView. The box edges become snap targets for placing wall studs and top/bottom plates.

### 3.3 2D-to-3D Placement

The user takes a 2D shape (from Section 3.1) and places it into the 3D scene, constrained to snap to existing geometry.

**Workflow:**
1. User selects a 2D shape (e.g., "Roof Truss A")
2. User clicks on one member of that shape to designate it as the **snap edge** — the edge that will align with existing 3D geometry
3. User drags the shape into the 3D viewport
4. The snap edge locks onto compatible geometry: top edges of the STL reference shape, existing beams, or defined snap lines
5. The shape orients perpendicular to the surface it snaps to
6. The user can slide the shape along the snap line to position it, with snapping to grid intervals or to other placed shapes

**Constraints on placement:**
- The 2D shape is placed as a rigid unit (internal geometry does not deform)
- The snap edge must align with an existing edge or beam
- Placement can be constrained to equal spacing (e.g., "place trusses every 24 inches along this edge")
- Once placed, the shape's nodes merge with any coincident existing nodes

### 3.4 Direct 3D Beam Drawing

For adding individual beams that don't belong to a pre-drawn 2D shape.

**Behavior:**
- Click two points in the 3D viewport to create a beam between them
- Endpoints snap to: existing nodes, STL vertices/edges/surfaces, grid intersections, other beam midpoints
- Useful for adding bracing, purlins, connecting members between trusses, etc.

### 3.5 Auto-Layout on Reference Shape

The user selects a face or set of edges on the STL reference shape and requests an automatic beam layout.

**Examples:**
- "Put studs on 16-inch centers along this wall face" → generates vertical beams at 16" spacing between the top and bottom edges of the selected face, plus top plate and bottom plate beams along the edges
- "Add joists at 12-inch spacing across this floor" → generates parallel beams spanning the selected rectangular region

This can be triggered via the UI (select face → choose layout pattern → set spacing) or via the AI/MCP interface (see Section 5).

---

## 4. Panels

Panels represent sheet materials (plywood, sheet metal, drywall, etc.) that span between beams. They contribute to structural behavior (shear walls, diaphragms, load distribution).

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
