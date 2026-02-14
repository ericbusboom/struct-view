---
status: pending
---

# STL Import Scale Correction

STL files do not carry unit information, so imported geometry may come in at
the wrong scale. We need an interface that lets the user verify and correct
the dimensions of an imported STL before it becomes a reference shell.

## Proposed Approach

1. **Compute the axis-aligned bounding box** (AABB) of the imported mesh
   immediately after load.
2. **Display the bounding-box dimensions** (X, Y, Z extents) in an overlay
   or side panel, using the project's current display units.
3. **Allow the user to edit any single dimension** to its known real-world
   value (e.g., "this side should be 20 ft"). The system computes a uniform
   scale factor from that correction and applies it to all three axes,
   preserving proportions.
4. Optionally allow **non-uniform scaling** if the user edits more than one
   dimension, with a warning that this distorts the geometry.
5. Store the final scale factor in the project model so re-opening the
   project reproduces the same result without re-prompting.

## Notes

- The three-dimensional analog of a rectangle is a **rectangular
  parallelepiped** (or informally, a "box" / "cuboid").
- This workflow fits naturally into the STL import flow planned for
  Sprint 003.
