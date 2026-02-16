import { useEffect, useRef } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { usePlaneStore } from '../store/usePlaneStore'
import type { EditorMode } from '../store/useEditorStore'
import { computeNudgeDelta, computeGroupCentroid } from '../editor3d/groupMove'
import { rotatePositionsAroundPivot } from '../editor3d/planeRotate'
import { getPlaneFromSelection } from '../editor3d/planeFromSelection'
import { createPlaneFromPoints } from '../model'
import {
  rotatePlane,
  getRotationAxes,
  snapPlaneAngle,
  computeRotationSpeed,
  alignPlaneToAxis,
  AXIS_NORMALS,
  TAP_ANGLE,
} from '../editor3d/planeRotation'

const MODE_KEYS: Record<string, EditorMode> = {
  v: 'select',
  n: 'add-node',
  m: 'add-member',
  g: 'move',
  r: 'rotate',
}

type ArrowDir = 'left' | 'right' | 'up' | 'down'
const ARROW_DIRS: Record<string, ArrowDir> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
}

export default function KeyboardHandler() {
  const setMode = useEditorStore((s) => s.setMode)

  // Plane rotation state (refs to avoid re-render churn)
  const heldArrows = useRef(new Set<string>())
  const holdStart = useRef(new Map<string, number>()) // key → timestamp of first hold
  const rafId = useRef<number>(0)
  const lastTick = useRef(0)
  const isFirstFrame = useRef(new Map<string, boolean>()) // key → whether this is the first frame

  useEffect(() => {
    // --- Plane rotation animation loop ---
    const tick = (time: number) => {
      const dt = lastTick.current ? (time - lastTick.current) / 1000 : 0
      lastTick.current = time

      if (heldArrows.current.size > 0) {
        const plane = usePlaneStore.getState().activePlane
        const { selectedGroupId } = useEditorStore.getState()
        const { isFocused } = usePlaneStore.getState()

        // Only rotate the plane if: active plane, no group selected, not focused
        if (plane && !selectedGroupId && !isFocused) {
          const axes = getRotationAxes(plane)
          let updated = plane

          for (const key of heldArrows.current) {
            const dir = ARROW_DIRS[key]
            if (!dir) continue

            // Determine rotation axis and sign
            let axis = (dir === 'up' || dir === 'down') ? axes.horizontal : axes.vertical
            if (!axis) continue
            const sign = (dir === 'right' || dir === 'up') ? 1 : -1

            // Compute angle for this frame
            let angle: number
            if (isFirstFrame.current.get(key)) {
              // First frame of a key press: apply tap angle
              angle = TAP_ANGLE * sign
              isFirstFrame.current.set(key, false)
            } else {
              const holdDuration = (time - (holdStart.current.get(key) ?? time)) / 1000
              const speed = computeRotationSpeed(holdDuration)
              angle = speed * dt * sign
            }

            updated = rotatePlane(updated, axis, angle)

            // Apply 15-degree snap
            const snapAxis = (dir === 'up' || dir === 'down') ? axes.horizontal! : axes.vertical!
            updated = snapPlaneAngle(updated, snapAxis)
          }

          if (updated !== plane) {
            usePlaneStore.getState().updatePlane(updated)
          }
        }
      }

      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)

    // --- Keyboard event handlers ---
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      const key = e.key.toLowerCase()

      // Mode keys
      const newMode = MODE_KEYS[key]
      if (newMode) {
        console.log(`[key] mode → ${newMode}`)
        setMode(newMode)
        return
      }

      // Delete / Backspace — remove all selected entities
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedNodeIds, selectedMemberIds, clearSelection } = useEditorStore.getState()
        console.log(`[key] delete: ${selectedNodeIds.size} nodes, ${selectedMemberIds.size} members`)
        const model = useModelStore.getState()

        for (const id of selectedMemberIds) {
          model.removeMember(id)
        }
        for (const id of selectedNodeIds) {
          useModelStore.getState().removeNode(id)
        }
        clearSelection()
        return
      }

      // Arrow keys
      const arrowDir = ARROW_DIRS[e.key]
      if (arrowDir) {
        const { selectedGroupId, activePlane, mode: currentMode } = useEditorStore.getState()

        // Group selected → existing nudge/rotate behavior
        if (selectedGroupId) {
          e.preventDefault()
          const trussNodes = useModelStore.getState().getNodesByGroupId(selectedGroupId)

          if (currentMode === 'rotate') {
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
          return
        }

        // No group selected → plane rotation (handled by rAF loop)
        const workingPlane = usePlaneStore.getState().activePlane
        if (workingPlane && !e.repeat) {
          e.preventDefault()
          heldArrows.current.add(e.key)
          if (!holdStart.current.has(e.key)) {
            holdStart.current.set(e.key, performance.now())
            isFirstFrame.current.set(e.key, true)
          }
        }
        return
      }

      // X/Y/Z keys — align plane so that axis lies IN the plane
      if (key === 'x' || key === 'y' || key === 'z') {
        const plane = usePlaneStore.getState().activePlane
        if (plane && !usePlaneStore.getState().isFocused) {
          const target = AXIS_NORMALS[key]
          const aligned = alignPlaneToAxis(plane, target)
          if (aligned !== plane) {
            usePlaneStore.getState().updatePlane(aligned)
            console.log(`[key] ${key} → plane contains ${key.toUpperCase()} axis`)
          }
        }
        return
      }

      // P key — create working plane from selection
      if (key === 'p') {
        const plane = getPlaneFromSelection() ?? createPlaneFromPoints([])
        console.log(`[key] p → plane normal=(${plane.normal.x.toFixed(2)}, ${plane.normal.y.toFixed(2)}, ${plane.normal.z.toFixed(2)}), type=${plane.constraintType}`)
        usePlaneStore.getState().setActivePlane(plane)
        return
      }

      // F key — toggle focus on active plane
      if (key === 'f' && !e.ctrlKey && !e.metaKey) {
        const { activePlane, isFocused } = usePlaneStore.getState()
        if (activePlane) {
          usePlaneStore.getState().toggleFocus()
          console.log(`[key] f → focus ${isFocused ? 'OFF' : 'ON'}`)
        } else {
          console.log(`[key] f → no active plane, ignoring`)
        }
        return
      }

      // Escape — clear selection, clear active plane, and reset to select mode
      if (e.key === 'Escape') {
        console.log(`[key] Escape → clear all`)
        useEditorStore.getState().clearSelection()
        useEditorStore.getState().setMemberStartNode(null)
        usePlaneStore.getState().clearActivePlane()
        setMode('select')
        return
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (ARROW_DIRS[e.key]) {
        heldArrows.current.delete(e.key)
        holdStart.current.delete(e.key)
        isFirstFrame.current.delete(e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      cancelAnimationFrame(rafId.current)
    }
  }, [setMode])

  return null
}
