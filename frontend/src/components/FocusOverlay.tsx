import { usePlaneStore } from '../store/usePlaneStore'
import { useModelStore } from '../store/useModelStore'
import { getPlaneColor, isOnPlane } from '../model'
import { saveToShape2D } from '../editor2d/shapeToPlane'
import type { Vec3 } from '../model'

/**
 * Derive axis label text from tangent vectors.
 * If a tangent aligns with a world axis, return that axis name.
 * Otherwise return "U" or "V".
 */
function axisLabel(tangent: Vec3): string {
  const THRESHOLD = 0.9
  if (Math.abs(tangent.x) > THRESHOLD) return 'X'
  if (Math.abs(tangent.y) > THRESHOLD) return 'Y'
  if (Math.abs(tangent.z) > THRESHOLD) return 'Z'
  return ''
}

/**
 * HTML overlay for 2D focus mode.
 * Shows a "2D" badge and axis labels at viewport edges.
 * Only visible when usePlaneStore.isFocused is true.
 */
export default function FocusOverlay() {
  const isFocused = usePlaneStore((s) => s.isFocused)
  const activePlane = usePlaneStore((s) => s.activePlane)
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)
  const addShape = useModelStore((s) => s.addShape)

  if (!isFocused || !activePlane) return null

  const color = getPlaneColor(activePlane.normal)
  const uLabel = axisLabel(activePlane.tangentU)
  const vLabel = axisLabel(activePlane.tangentV)

  const handleSaveToLibrary = () => {
    const planeNodes = nodes.filter((n) => isOnPlane(n.position, activePlane))
    if (planeNodes.length === 0) return
    const nodeIdSet = new Set(planeNodes.map((n) => n.id))
    const planeMembers = members.filter(
      (m) => nodeIdSet.has(m.start_node) && nodeIdSet.has(m.end_node),
    )
    const name = window.prompt('Shape name:', 'My Truss') ?? 'My Truss'
    const shape = saveToShape2D(planeNodes, planeMembers, activePlane, name)
    addShape(shape)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* 2D badge */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: color,
          color: '#000',
          fontWeight: 'bold',
          fontSize: 14,
          padding: '4px 10px',
          borderRadius: 4,
        }}
      >
        2D
      </div>

      {/* Save to Library button */}
      <button
        className="tool-btn"
        style={{
          position: 'absolute',
          top: 12,
          left: 60,
          pointerEvents: 'auto',
        }}
        onClick={handleSaveToLibrary}
      >
        Save to Library
      </button>

      {/* Horizontal axis label (tangentU) — bottom center */}
      {uLabel && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            color,
            fontWeight: 'bold',
            fontSize: 14,
          }}
        >
          {uLabel}
        </div>
      )}

      {/* Vertical axis label (tangentV) — left center */}
      {vLabel && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 12,
            transform: 'translateY(-50%)',
            color,
            fontWeight: 'bold',
            fontSize: 14,
          }}
        >
          {vLabel}
        </div>
      )}
    </div>
  )
}

/** Exported for testing */
export { axisLabel }
