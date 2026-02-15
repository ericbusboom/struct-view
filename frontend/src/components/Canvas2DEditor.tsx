import { useRef, useEffect, useCallback, useState } from 'react'
import { useCanvas2DStore, screenToWorld } from '../store/useCanvas2DStore'
import type { Camera2D } from '../store/useCanvas2DStore'
import { useEditor2DStore, hitTestNode, hitTestMember } from '../store/useEditor2DStore'
import type { Tool2D } from '../store/useEditor2DStore'
import { snapPoint } from '../editor2d/snap'
import type { SnapResult } from '../editor2d/snap'
import type { Shape2D } from '../model'
import TemplatePicker from './TemplatePicker'
import ShapeLibrary from './ShapeLibrary'
import PlaneSelector from './PlaneSelector'

const ZOOM_SENSITIVITY = 0.001
const SNAP_RADIUS_PX = 10
const HIT_RADIUS_PX = 8

function adaptiveGridSpacing(zoom: number): { major: number; minor: number } {
  const targetPx = 80
  const rawWorldSpacing = targetPx / zoom
  const exponent = Math.round(Math.log10(rawWorldSpacing))
  const major = Math.pow(10, exponent)
  const minor = major / 5
  return { major, minor }
}

function drawGrid(ctx: CanvasRenderingContext2D, camera: Camera2D, w: number, h: number) {
  const { major, minor } = adaptiveGridSpacing(camera.zoom)
  const left = -camera.offsetX / camera.zoom
  const top = -camera.offsetY / camera.zoom
  const right = (w - camera.offsetX) / camera.zoom
  const bottom = (h - camera.offsetY) / camera.zoom

  ctx.strokeStyle = '#3a3a3a'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  for (let x = Math.floor(left / minor) * minor; x <= right; x += minor) {
    const sx = x * camera.zoom + camera.offsetX
    ctx.moveTo(sx, 0)
    ctx.lineTo(sx, h)
  }
  for (let y = Math.floor(top / minor) * minor; y <= bottom; y += minor) {
    const sy = y * camera.zoom + camera.offsetY
    ctx.moveTo(0, sy)
    ctx.lineTo(w, sy)
  }
  ctx.stroke()

  ctx.strokeStyle = '#555'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = Math.floor(left / major) * major; x <= right; x += major) {
    const sx = x * camera.zoom + camera.offsetX
    ctx.moveTo(sx, 0)
    ctx.lineTo(sx, h)
  }
  for (let y = Math.floor(top / major) * major; y <= bottom; y += major) {
    const sy = y * camera.zoom + camera.offsetY
    ctx.moveTo(0, sy)
    ctx.lineTo(w, sy)
  }
  ctx.stroke()

  const originSX = camera.offsetX
  const originSY = camera.offsetY
  ctx.lineWidth = 1.5
  if (originSY >= 0 && originSY <= h) {
    ctx.strokeStyle = '#ff4444'
    ctx.beginPath()
    ctx.moveTo(0, originSY)
    ctx.lineTo(w, originSY)
    ctx.stroke()
  }
  if (originSX >= 0 && originSX <= w) {
    ctx.strokeStyle = '#44cc44'
    ctx.beginPath()
    ctx.moveTo(originSX, 0)
    ctx.lineTo(originSX, h)
    ctx.stroke()
  }
}

function drawShape(ctx: CanvasRenderingContext2D, camera: Camera2D, shape: Shape2D, selectedIds: Set<string>) {
  const nodeMap = new Map(shape.nodes.map((n) => [n.id, n]))

  // Draw members
  for (const member of shape.members) {
    const a = nodeMap.get(member.startNode)
    const b = nodeMap.get(member.endNode)
    if (!a || !b) continue
    const ax = a.x * camera.zoom + camera.offsetX
    const ay = a.y * camera.zoom + camera.offsetY
    const bx = b.x * camera.zoom + camera.offsetX
    const by = b.y * camera.zoom + camera.offsetY

    ctx.strokeStyle = selectedIds.has(member.id) ? '#ffff00' : member.isSnapEdge ? '#ff8844' : '#88aaff'
    ctx.lineWidth = selectedIds.has(member.id) ? 3 : 2
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)
    ctx.stroke()
  }

  // Draw nodes
  for (const node of shape.nodes) {
    const sx = node.x * camera.zoom + camera.offsetX
    const sy = node.y * camera.zoom + camera.offsetY
    const isSelected = selectedIds.has(node.id)
    ctx.fillStyle = isSelected ? '#ffff00' : '#4a9eff'
    ctx.beginPath()
    ctx.arc(sx, sy, isSelected ? 5 : 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

function drawSnapIndicator(ctx: CanvasRenderingContext2D, camera: Camera2D, snap: SnapResult) {
  if (snap.type === 'none') return
  const sx = snap.point.x * camera.zoom + camera.offsetX
  const sy = snap.point.y * camera.zoom + camera.offsetY

  ctx.strokeStyle = snap.type === 'node' ? '#ff44ff' : snap.type === 'midpoint' ? '#44ffff' : '#888'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(sx, sy, 8, 0, Math.PI * 2)
  ctx.stroke()

  // Draw guide lines
  for (const guide of snap.guides) {
    ctx.strokeStyle = guide.type === 'perpendicular' ? '#ff666688' : '#66ff6688'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(guide.from.x * camera.zoom + camera.offsetX, guide.from.y * camera.zoom + camera.offsetY)
    ctx.lineTo(guide.to.x * camera.zoom + camera.offsetX, guide.to.y * camera.zoom + camera.offsetY)
    ctx.stroke()
    ctx.setLineDash([])
  }
}

function drawPendingSegment(ctx: CanvasRenderingContext2D, camera: Camera2D, shape: Shape2D, startNodeId: string, cursorWorld: { x: number; y: number }) {
  const startNode = shape.nodes.find((n) => n.id === startNodeId)
  if (!startNode) return
  const ax = startNode.x * camera.zoom + camera.offsetX
  const ay = startNode.y * camera.zoom + camera.offsetY
  const bx = cursorWorld.x * camera.zoom + camera.offsetX
  const by = cursorWorld.y * camera.zoom + camera.offsetY

  ctx.strokeStyle = '#88aaff66'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.moveTo(ax, ay)
  ctx.lineTo(bx, by)
  ctx.stroke()
  ctx.setLineDash([])
}

const TOOL_LABELS: Record<Tool2D, string> = {
  'draw-node': 'Node',
  'draw-segment': 'Segment',
  'select': 'Select',
  'delete': 'Delete',
  'snap-edge': 'Snap Edge',
}

export default function Canvas2DEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isPanningRef = useRef(false)
  const spaceHeldRef = useRef(false)
  const isDraggingRef = useRef(false)
  const dragNodeIdRef = useRef<string | null>(null)
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const [cursorSnap, setCursorSnap] = useState<SnapResult | null>(null)
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showShapeLibrary, setShowShapeLibrary] = useState(false)

  const camera = useCanvas2DStore((s) => s.camera)
  const pan = useCanvas2DStore((s) => s.pan)
  const zoomAt = useCanvas2DStore((s) => s.zoomAt)
  const close = useCanvas2DStore((s) => s.close)

  const currentTool = useEditor2DStore((s) => s.currentTool)
  const shape = useEditor2DStore((s) => s.shape)
  const selectedIds = useEditor2DStore((s) => s.selectedIds)
  const pendingSegmentStart = useEditor2DStore((s) => s.pendingSegmentStart)
  const setTool = useEditor2DStore((s) => s.setTool)
  const addNode = useEditor2DStore((s) => s.addNode)
  const addMember = useEditor2DStore((s) => s.addMember)
  const deleteEntity = useEditor2DStore((s) => s.deleteEntity)
  const moveNode = useEditor2DStore((s) => s.moveNode)
  const selectEntity = useEditor2DStore((s) => s.selectEntity)
  const setPendingSegmentStart = useEditor2DStore((s) => s.setPendingSegmentStart)
  const toggleSnapEdge = useEditor2DStore((s) => s.toggleSnapEdge)
  const setPlacementPlane = useEditor2DStore((s) => s.setPlacementPlane)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#1e1e2e'
    ctx.fillRect(0, 0, w, h)

    drawGrid(ctx, camera, w, h)
    drawShape(ctx, camera, shape, selectedIds)

    if (pendingSegmentStart && cursorSnap) {
      drawPendingSegment(ctx, camera, shape, pendingSegmentStart, cursorSnap.point)
    }

    if (cursorSnap) {
      drawSnapIndicator(ctx, camera, cursorSnap)
    }
  }, [camera, shape, selectedIds, pendingSegmentStart, cursorSnap])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
      render()
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [render])

  useEffect(() => {
    render()
  }, [render])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        spaceHeldRef.current = true
      }
      if (e.code === 'Escape') {
        if (pendingSegmentStart) {
          setPendingSegmentStart(null)
        } else {
          close()
        }
      }
      if (e.code === 'Delete' || e.code === 'Backspace') {
        for (const id of selectedIds) {
          deleteEntity(id)
        }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceHeldRef.current = false
        isPanningRef.current = false
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [close, pendingSegmentStart, setPendingSegmentStart, selectedIds, deleteEntity])

  const getWorldPos = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }
      return screenToWorld(e.clientX - rect.left, e.clientY - rect.top, camera)
    },
    [camera],
  )

  const computeSnap = useCallback(
    (world: { x: number; y: number }) => {
      const { major } = adaptiveGridSpacing(camera.zoom)
      const snapRadiusWorld = SNAP_RADIUS_PX / camera.zoom
      const lastNode = pendingSegmentStart
        ? shape.nodes.find((n) => n.id === pendingSegmentStart)
        : undefined
      return snapPoint(world, shape.nodes, shape.members, {
        snapRadius: snapRadiusWorld,
        gridSize: major / 5,
        lastNode: lastNode ? { x: lastNode.x, y: lastNode.y } : undefined,
      })
    },
    [camera.zoom, shape.nodes, shape.members, pendingSegmentStart],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
      if (e.button === 1 || (e.button === 0 && spaceHeldRef.current)) {
        e.preventDefault()
        isPanningRef.current = true
        return
      }
      if (e.button !== 0) return

      const world = getWorldPos(e)
      const hitRadiusWorld = HIT_RADIUS_PX / camera.zoom

      if (currentTool === 'select') {
        const hitNode = hitTestNode(shape.nodes, world.x, world.y, hitRadiusWorld)
        if (hitNode) {
          selectEntity(hitNode.id)
          isDraggingRef.current = true
          dragNodeIdRef.current = hitNode.id
          return
        }
        const hitMember = hitTestMember(shape.members, shape.nodes, world.x, world.y, hitRadiusWorld)
        if (hitMember) {
          selectEntity(hitMember.id)
          return
        }
        selectEntity(null)
      }
    },
    [getWorldPos, camera.zoom, currentTool, shape.nodes, shape.members, selectEntity],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isPanningRef.current || isDraggingRef.current) return
      if (e.button !== 0 || spaceHeldRef.current) return

      const world = getWorldPos(e)
      const snap = computeSnap(world)
      const hitRadiusWorld = HIT_RADIUS_PX / camera.zoom

      if (currentTool === 'draw-node') {
        addNode(snap.point.x, snap.point.y)
      } else if (currentTool === 'draw-segment') {
        // Determine which node to use (existing or new)
        const existingNode = hitTestNode(shape.nodes, snap.point.x, snap.point.y, hitRadiusWorld)
        const nodeId = existingNode ? existingNode.id : addNode(snap.point.x, snap.point.y)

        if (!pendingSegmentStart) {
          setPendingSegmentStart(nodeId)
        } else {
          addMember(pendingSegmentStart, nodeId)
          setPendingSegmentStart(nodeId) // chain segments
        }
      } else if (currentTool === 'delete') {
        const hitNode = hitTestNode(shape.nodes, world.x, world.y, hitRadiusWorld)
        if (hitNode) {
          deleteEntity(hitNode.id)
          return
        }
        const hitMember = hitTestMember(shape.members, shape.nodes, world.x, world.y, hitRadiusWorld)
        if (hitMember) {
          deleteEntity(hitMember.id)
        }
      } else if (currentTool === 'snap-edge') {
        const hitMember = hitTestMember(shape.members, shape.nodes, world.x, world.y, hitRadiusWorld)
        if (hitMember) {
          toggleSnapEdge(hitMember.id)
        }
      }
    },
    [
      getWorldPos, computeSnap, camera.zoom, currentTool,
      shape.nodes, shape.members, pendingSegmentStart,
      addNode, addMember, deleteEntity, setPendingSegmentStart, toggleSnapEdge,
    ],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanningRef.current) {
        const dx = e.clientX - lastMouseRef.current.x
        const dy = e.clientY - lastMouseRef.current.y
        pan(dx, dy)
        lastMouseRef.current = { x: e.clientX, y: e.clientY }
        return
      }

      const world = getWorldPos(e)
      setCursorWorld(world)

      if (isDraggingRef.current && dragNodeIdRef.current) {
        const snap = computeSnap(world)
        moveNode(dragNodeIdRef.current, snap.point.x, snap.point.y)
        lastMouseRef.current = { x: e.clientX, y: e.clientY }
        return
      }

      const snap = computeSnap(world)
      setCursorSnap(snap)
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
    },
    [pan, getWorldPos, computeSnap, moveNode],
  )

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false
    isDraggingRef.current = false
    dragNodeIdRef.current = null
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const factor = Math.exp(-e.deltaY * ZOOM_SENSITIVITY)
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor)
    },
    [zoomAt],
  )

  const cursorStyle = spaceHeldRef.current || isPanningRef.current
    ? 'grab'
    : currentTool === 'select'
      ? 'default'
      : currentTool === 'delete'
        ? 'pointer'
        : 'crosshair'

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) close()
    },
    [close],
  )

  return (
    <div className="canvas2d-backdrop" onClick={handleBackdropClick}>
    <div className="canvas2d-overlay">
      <div className="canvas2d-header">
        <div className="canvas2d-tools">
          {(Object.keys(TOOL_LABELS) as Tool2D[]).map((tool) => (
            <button
              key={tool}
              className={`tool-btn${currentTool === tool ? ' active' : ''}`}
              onClick={() => setTool(tool)}
            >
              {TOOL_LABELS[tool]}
            </button>
          ))}
        </div>
        <button className="tool-btn" onClick={() => setShowTemplatePicker(true)}>Template</button>
        <button className="tool-btn" onClick={() => setShowShapeLibrary(true)}>Library</button>
        <PlaneSelector value={shape.placementPlane} onChange={setPlacementPlane} />
        <span className="canvas2d-title">2D Truss Editor</span>
        <div className="canvas2d-info">
          {cursorWorld.x.toFixed(2)}, {cursorWorld.y.toFixed(2)}
          {cursorSnap && cursorSnap.type !== 'none' && ` [${cursorSnap.type}]`}
        </div>
        <button className="tool-btn" onClick={close}>Close</button>
      </div>
      <div ref={containerRef} className="canvas2d-container">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          style={{ cursor: cursorStyle }}
        />
        {showTemplatePicker && (
          <TemplatePicker onClose={() => setShowTemplatePicker(false)} />
        )}
        {showShapeLibrary && (
          <ShapeLibrary onClose={() => setShowShapeLibrary(false)} />
        )}
      </div>
    </div>
    </div>
  )
}
