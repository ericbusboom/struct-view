---
id: 008
title: Node merge on coincident placement
status: done
use-cases:
- SUC-006
depends-on:
- '007'
---

# Node merge on coincident placement

## Description

After placing a shape in 3D (ticket 007), scan the newly created nodes against all existing model nodes. Any new node within 1mm (0.001m) Euclidean distance of an existing node is considered coincident: discard the new node and remap all member references from the new node's id to the existing node's id. This ensures that repeated shape placements along a shared edge produce a connected structure rather than overlapping disconnected geometry. The earlier-created (existing) node always wins.

## Implementation Notes

- Implement a pure function: `mergeCoincidentNodes(existingNodes: Node[], newNodes: Node[], tolerance: number): {mergedNodes: Node[], remapTable: Map<string, string>}`.
  - For each new node, find the closest existing node. If distance <= tolerance, add an entry to the remap table mapping new node id to existing node id and discard the new node.
  - If no existing node is within tolerance, the new node is kept as-is and added to the merged result.
- Implement a companion function: `applyNodeRemap(members: Member[], remapTable: Map<string, string>): Member[]`.
  - For each member, replace `startNode` and `endNode` with the remapped id if present in the table.
- Integration point: after `placeShape` returns nodes and members, run `mergeCoincidentNodes`, then `applyNodeRemap`, then add the results to the model store.
- Tolerance is hardcoded at 0.001m (1mm) but should be a named constant for easy adjustment.

## Acceptance Criteria

- [ ] Nodes within 1mm of an existing node are merged (new node discarded, existing node kept).
- [ ] Nodes beyond 1mm tolerance remain as separate entities.
- [ ] Member `startNode` and `endNode` references are updated to use the existing node id after merge.
- [ ] The earlier-created (existing) node always takes precedence.
- [ ] Merging does not create duplicate members (same start and end node).
- [ ] The merge function is a testable pure function.

## Testing

- **Existing tests to run**: Model schema tests, placement tests from ticket 007.
- **New tests to write**:
  - Unit test: two nodes at distance 0.0005m are merged; remap table has one entry.
  - Unit test: two nodes at distance 0.002m are NOT merged; both appear in output.
  - Unit test: boundary case at exactly 0.001m -- node is merged (tolerance is inclusive).
  - Unit test: `applyNodeRemap` correctly updates member start/end references.
  - Unit test: member that would become degenerate (start == end after remap) is handled (removed or flagged).
  - Unit test: multiple new nodes merging to the same existing node all remap correctly.
  - Unit test: merge with zero existing nodes returns all new nodes unchanged.
- **Verification command**: `npx vitest run`
