import { usePlaneStore } from '../store/usePlaneStore'
import { getPlaneColor } from '../model'
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

  if (!isFocused || !activePlane) return null

  const color = getPlaneColor(activePlane.normal)
  const uLabel = axisLabel(activePlane.tangentU)
  const vLabel = axisLabel(activePlane.tangentV)

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
