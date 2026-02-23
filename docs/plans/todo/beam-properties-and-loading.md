---
status: pending
---

# Beam Properties and Loading

Two related features needed before structural analysis can work, and before
the MCP server can be fully useful.

## 1. Beam Material / Section Properties

Beams need editable structural properties so we can calculate deflections:

- **Cross-section**: shape and dimensions (e.g., rectangular W x H, circular
  diameter, I-beam dimensions)
- **Moment of inertia (I)**: derived from cross-section, or manually entered
- **Young's modulus (E)**: material stiffness (steel ~200 GPa, wood ~12 GPa,
  aluminum ~70 GPa)
- **Cross-sectional area (A)**: for axial calculations

At minimum, E and I are required for beam bending analysis. A UI for editing
these per-beam (or per-group) is needed in the properties panel.

## 2. Loading (Forces on Beams and Nodes)

Support for defining loads:

- **Point loads on nodes**: force vector (Fx, Fy, Fz) applied at a node
- **Point loads on beams**: force at a specific position along a beam
- **Uniform distributed loads on beams**: force per unit length over the
  full beam span, with a direction vector

Loads should be visualizable in the viewport (arrows for point loads, series
of arrows for distributed loads).

## Relationship to MCP Server

A primary use case for the MCP server is AI-assisted load assignment. A user
describes loading conditions in natural language ("put a 10kN downward load
on all the top chord beams") and the AI uses MCP tools to apply them. The
MCP server needs tools for:

- Setting beam material/section properties
- Adding/editing/removing point loads on nodes
- Adding/editing/removing point and distributed loads on beams
- Querying current loads and properties
