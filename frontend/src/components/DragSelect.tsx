import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'

const MIN_DRAG_PX = 5

/**
 * Rectangular drag-selection overlay for the 3D viewport.
 *
 * Lives inside the R3F Canvas so it can access camera and controls via
 * useThree(). Attaches pointer listeners to the Canvas's parent DOM
 * element and draws a selection rectangle via a manually-created div.
 *
 * On release, projects every node to screen-space and selects those
 * inside the rectangle. Shift-drag adds to existing selection.
 */
export default function DragSelect() {
  const { camera, gl, controls } = useThree()
  const dragging = useRef(false)
  const startPx = useRef({ x: 0, y: 0 })
  const rectDiv = useRef<HTMLDivElement | null>(null)
  const shiftRef = useRef(false)

  // Create the selection rectangle div once
  useEffect(() => {
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.border = '1px solid #4a9eff'
    div.style.background = 'rgba(74, 158, 255, 0.12)'
    div.style.pointerEvents = 'none'
    div.style.display = 'none'
    div.style.zIndex = '20'
    gl.domElement.parentElement?.appendChild(div)
    rectDiv.current = div
    return () => { div.remove() }
  }, [gl])

  const getContainerRect = useCallback(() => {
    return gl.domElement.getBoundingClientRect()
  }, [gl])

  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (e.button !== 0) return // left button only
    if (useEditorStore.getState().mode !== 'select') return

    shiftRef.current = e.shiftKey
    startPx.current = { x: e.clientX, y: e.clientY }
    dragging.current = false // will become true after MIN_DRAG_PX
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (startPx.current.x === 0 && startPx.current.y === 0) return
    if (useEditorStore.getState().mode !== 'select') return

    const dx = e.clientX - startPx.current.x
    const dy = e.clientY - startPx.current.y

    if (!dragging.current) {
      if (Math.abs(dx) < MIN_DRAG_PX && Math.abs(dy) < MIN_DRAG_PX) return
      dragging.current = true
      // Disable orbit controls while drag-selecting
      if (controls) (controls as any).enabled = false
    }

    const containerRect = getContainerRect()
    const div = rectDiv.current
    if (!div) return

    const left = Math.min(startPx.current.x, e.clientX) - containerRect.left
    const top = Math.min(startPx.current.y, e.clientY) - containerRect.top
    const width = Math.abs(dx)
    const height = Math.abs(dy)

    div.style.display = 'block'
    div.style.left = `${left}px`
    div.style.top = `${top}px`
    div.style.width = `${width}px`
    div.style.height = `${height}px`
  }, [controls, getContainerRect])

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!dragging.current) {
      startPx.current = { x: 0, y: 0 }
      return
    }

    dragging.current = false
    if (rectDiv.current) rectDiv.current.style.display = 'none'

    // Re-enable orbit controls
    if (controls) (controls as any).enabled = true

    // Compute selection rectangle in container-local pixels
    const containerRect = getContainerRect()
    const x1 = Math.min(startPx.current.x, e.clientX) - containerRect.left
    const y1 = Math.min(startPx.current.y, e.clientY) - containerRect.top
    const x2 = Math.max(startPx.current.x, e.clientX) - containerRect.left
    const y2 = Math.max(startPx.current.y, e.clientY) - containerRect.top

    startPx.current = { x: 0, y: 0 }

    // Project every node to screen space and check if inside rect
    const nodes = useModelStore.getState().nodes
    const w = containerRect.width
    const h = containerRect.height
    const vec = new THREE.Vector3()
    const selected = new Set<string>()

    for (const node of nodes) {
      vec.set(node.position.x, node.position.y, node.position.z)
      vec.project(camera)

      // NDC (-1..1) to container pixels
      const sx = (vec.x * 0.5 + 0.5) * w
      const sy = (-vec.y * 0.5 + 0.5) * h

      // Skip nodes behind camera
      if (vec.z > 1) continue

      if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) {
        selected.add(node.id)
      }
    }

    if (selected.size > 0 || !shiftRef.current) {
      useEditorStore.getState().setSelectedNodeIds(selected, shiftRef.current)
    }
  }, [camera, controls, getContainerRect])

  // Attach listeners to the canvas DOM element
  useEffect(() => {
    const el = gl.domElement
    el.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      el.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [gl, handlePointerDown, handlePointerMove, handlePointerUp])

  return null // no Three.js scene children
}
