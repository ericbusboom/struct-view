import { nanoid } from 'nanoid'
import { usePlacementStore } from '../store/usePlacementStore'
import { useModelStore } from '../store/useModelStore'
import { placeShape } from '../editor2d/placeShape'
import { placeEqualSpacing } from '../editor2d/equalSpacing'

/**
 * Commit the current placement to the model store.
 * Stamps every placed node and member with a trussId for group selection.
 * Nodes are never merged — co-located nodes remain separate entities.
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

  // Stamp trussId on all placed entities.
  // For equal-spacing (count > 1), each copy gets its own trussId.
  if (count <= 1) {
    const trussId = nanoid()
    for (const node of placedNodes) {
      addNode({ ...node, trussId })
    }
    for (const member of placedMembers) {
      addMember({ ...member, trussId })
    }
  } else {
    // Group nodes/members by their placement index.
    // placeEqualSpacing returns all copies concatenated, so we chunk by shape size.
    const nodesPerCopy = shape.nodes.length
    const membersPerCopy = shape.members.length
    for (let i = 0; i < count; i++) {
      const trussId = nanoid()
      const nodeSlice = placedNodes.slice(i * nodesPerCopy, (i + 1) * nodesPerCopy)
      const memberSlice = placedMembers.slice(i * membersPerCopy, (i + 1) * membersPerCopy)
      for (const node of nodeSlice) {
        addNode({ ...node, trussId })
      }
      for (const member of memberSlice) {
        addMember({ ...member, trussId })
      }
    }
  }

  confirmPlacement()
}
