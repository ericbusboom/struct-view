import { usePlacementStore } from '../store/usePlacementStore'
import { useModelStore } from '../store/useModelStore'
import { placeShape } from '../editor2d/placeShape'
import { placeEqualSpacing } from '../editor2d/equalSpacing'
import { mergeCoincidentNodes, applyNodeRemap } from '../editor2d/mergeNodes'

/**
 * Commit the current placement to the model store.
 * Computes placement, merges coincident nodes with existing model, and adds results.
 * Resets placement store to idle.
 */
export function commitPlacement(): void {
  const { shape, targetEdge, offset, count, confirmPlacement } =
    usePlacementStore.getState()

  if (!shape || !targetEdge) return

  const { nodes: existingNodes, addNode, addMember } = useModelStore.getState()

  let placedNodes
  let placedMembers

  if (count <= 1) {
    const result = placeShape(shape, targetEdge, offset)
    placedNodes = result.nodes
    placedMembers = result.members
  } else {
    const result = placeEqualSpacing(shape, targetEdge, count, existingNodes)
    placedNodes = result.nodes
    placedMembers = result.members
  }

  // For single placement, merge against existing model nodes
  if (count <= 1) {
    const { mergedNodes, remapTable } = mergeCoincidentNodes(
      existingNodes,
      placedNodes,
    )
    const remappedMembers = applyNodeRemap(placedMembers, remapTable)

    for (const node of mergedNodes) {
      addNode(node)
    }
    for (const member of remappedMembers) {
      addMember(member)
    }
  } else {
    // placeEqualSpacing already does incremental merging internally
    for (const node of placedNodes) {
      addNode(node)
    }
    for (const member of placedMembers) {
      addMember(member)
    }
  }

  confirmPlacement()
}
