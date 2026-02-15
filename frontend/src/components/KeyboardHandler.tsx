import { useEffect } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { usePlaneStore } from '../store/usePlaneStore'
import type { EditorMode } from '../store/useEditorStore'
import { computeNudgeDelta, computeGroupCentroid } from '../editor3d/groupMove'
import { rotatePositionsAroundPivot } from '../editor3d/planeRotate'
import { createPlaneFromPoints } from '../model'
import type { Vec3 } from '../model'

const MODE_KEYS: Record<string, EditorMode> = {
  v: 'select',
  n: 'add-node',
  m: 'add-member',
  g: 'move',
  r: 'rotate',
}

export default function KeyboardHandler() {
  const setMode = useEditorStore((s) => s.setMode)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      const newMode = MODE_KEYS[e.key.toLowerCase()]
      if (newMode) {
        setMode(newMode)
        return
      }

      // Delete / Backspace — remove all selected entities
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedNodeIds, selectedMemberIds, clearSelection } = useEditorStore.getState()
        const model = useModelStore.getState()

        for (const id of selectedMemberIds) {
          model.removeMember(id)
        }
        for (const id of selectedNodeIds) {
          useModelStore.getState().removeNode(id)
        }
        clearSelection()
      }

      // Arrow keys — nudge (move mode) or rotate (rotate mode) selected truss
      const ARROW_DIRS: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      }
      const arrowDir = ARROW_DIRS[e.key]
      if (arrowDir) {
        const { selectedGroupId, activePlane, mode: currentMode } = useEditorStore.getState()
        if (selectedGroupId) {
          e.preventDefault()
          const trussNodes = useModelStore.getState().getNodesByGroupId(selectedGroupId)

          if (currentMode === 'rotate') {
            // Arrow left/right rotate by +/-15 degrees
            const angleDeg = (arrowDir === 'right' || arrowDir === 'up') ? 15 : -15
            const { rotatePivotNodeId } = useEditorStore.getState()
            const pivotNode = rotatePivotNodeId ? useModelStore.getState().nodes.find((n) => n.id === rotatePivotNodeId) : null
            const pivot = pivotNode ? { ...pivotNode.position } : computeGroupCentroid(trussNodes)
            const positions = trussNodes.map((n) => n.position)
            const rotated = rotatePositionsAroundPivot(positions, pivot, angleDeg, activePlane)
            for (let i = 0; i < trussNodes.length; i++) {
              useModelStore.getState().updateNode(trussNodes[i].id, { position: rotated[i] })
            }
          } else {
            // Move mode: nudge by step size
            const stepSize = e.shiftKey ? 0.1 : 0.5
            const delta = computeNudgeDelta(arrowDir, activePlane, stepSize)
            for (const node of trussNodes) {
              useModelStore.getState().updateNode(node.id, {
                position: {
                  x: node.position.x + delta.x,
                  y: node.position.y + delta.y,
                  z: node.position.z + delta.z,
                },
              })
            }
          }
        }
      }

      // P key — create working plane from selection
      if (e.key.toLowerCase() === 'p') {
        const { selectedNodeIds, selectedMemberIds } = useEditorStore.getState()
        const { nodes, members } = useModelStore.getState()

        // Collect points from selected nodes
        const points: Vec3[] = []
        for (const id of selectedNodeIds) {
          const node = nodes.find((n) => n.id === id)
          if (node) points.push({ ...node.position })
        }

        // Add beam endpoints for selected members
        for (const id of selectedMemberIds) {
          const member = members.find((m) => m.id === id)
          if (member) {
            const startNode = nodes.find((n) => n.id === member.start_node)
            const endNode = nodes.find((n) => n.id === member.end_node)
            if (startNode) points.push({ ...startNode.position })
            if (endNode) points.push({ ...endNode.position })
          }
        }

        const plane = createPlaneFromPoints(points.slice(0, 3))
        usePlaneStore.getState().setActivePlane(plane)
      }

      // F key — toggle focus on active plane
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        const { activePlane } = usePlaneStore.getState()
        if (activePlane) {
          usePlaneStore.getState().toggleFocus()
        }
      }

      // Escape — clear selection and reset to select mode
      if (e.key === 'Escape') {
        useEditorStore.getState().clearSelection()
        useEditorStore.getState().setMemberStartNode(null)
        setMode('select')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setMode])

  return null
}
