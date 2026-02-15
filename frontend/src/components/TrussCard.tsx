import { useRef, useEffect } from 'react'
import type { Shape2D } from '../model'

interface TrussCardProps {
  shape: Shape2D
  onEdit: () => void
  onPlace: () => void
}

function renderThumbnail(canvas: HTMLCanvasElement, shape: Shape2D) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const w = canvas.width / dpr
  const h = canvas.height / dpr

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#2a2a3e'
  ctx.fillRect(0, 0, w, h)

  if (shape.nodes.length === 0) return

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const n of shape.nodes) {
    if (n.x < minX) minX = n.x
    if (n.y < minY) minY = n.y
    if (n.x > maxX) maxX = n.x
    if (n.y > maxY) maxY = n.y
  }

  const bw = maxX - minX || 1
  const bh = maxY - minY || 1
  const padding = 12
  const scaleX = (w - padding * 2) / bw
  const scaleY = (h - padding * 2) / bh
  const scale = Math.min(scaleX, scaleY)
  const cx = (w - bw * scale) / 2
  const cy = (h - bh * scale) / 2

  const toScreen = (x: number, y: number) => ({
    sx: (x - minX) * scale + cx,
    // Flip Y so +Y is up in the thumbnail
    sy: h - ((y - minY) * scale + cy),
  })

  const nodeMap = new Map(shape.nodes.map((n) => [n.id, n]))

  // Draw members
  ctx.strokeStyle = '#88aaff'
  ctx.lineWidth = 1.5
  for (const m of shape.members) {
    const a = nodeMap.get(m.startNode)
    const b = nodeMap.get(m.endNode)
    if (!a || !b) continue
    const pa = toScreen(a.x, a.y)
    const pb = toScreen(b.x, b.y)
    ctx.beginPath()
    ctx.moveTo(pa.sx, pa.sy)
    ctx.lineTo(pb.sx, pb.sy)
    ctx.stroke()
  }

  // Draw nodes
  ctx.fillStyle = '#4a9eff'
  for (const n of shape.nodes) {
    const p = toScreen(n.x, n.y)
    ctx.beginPath()
    ctx.arc(p.sx, p.sy, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function TrussCard({ shape, onEdit, onPlace }: TrussCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = 200 * dpr
    canvas.height = 120 * dpr
    canvas.style.width = '200px'
    canvas.style.height = '120px'
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
    renderThumbnail(canvas, shape)
  }, [shape])

  return (
    <div className="truss-card">
      <canvas ref={canvasRef} className="truss-card-thumbnail" />
      <div className="truss-card-name">{shape.name}</div>
      <div className="truss-card-meta">
        {shape.nodes.length} nodes, {shape.members.length} members
      </div>
      <div className="truss-card-actions">
        <button className="tool-btn" onClick={onEdit}>Edit</button>
        <button className="tool-btn" onClick={onPlace}>Add to 3D</button>
      </div>
    </div>
  )
}
