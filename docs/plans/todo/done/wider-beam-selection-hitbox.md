---
status: done
sprint: '004'
---

# Wider beam/member selection hitbox

Beams (members) are very hard to click-select in the 3D viewport because
their visual width is narrow and the raycaster hit area matches the geometry
exactly. Increase the selection hit area to at least 2x the rendered width
so users can click near a beam without needing pixel-perfect aim.

## Approach ideas

- Increase the `Line2` or tube geometry raycaster threshold
  (`raycaster.params.Line.threshold` or a custom `raycast` override).
- Alternatively, use invisible wider cylinders/boxes as pick targets
  that are co-located with each member.
- Ensure the wider hit area doesn't cause false positives when members
  are close together.
