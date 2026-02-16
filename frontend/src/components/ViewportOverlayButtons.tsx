import { useCameraActionStore } from '../store/useCameraActionStore'
import { useModelStore } from '../store/useModelStore'
import { usePlaneStore } from '../store/usePlaneStore'
import { getPlaneFromSelection } from '../editor3d/planeFromSelection'
import type { Vec3 } from '../model'

/** Default 3/4 view direction: above, front-right (Z-up) */
const HOME_DIR: Vec3 = (() => {
  const len = Math.sqrt(1 + 1 + 1)
  return { x: 1 / len, y: -1 / len, z: 1 / len }
})()

const DEFAULT_FOV = 50
const ORIENT_DISTANCE = 15
const MIN_DISTANCE = 5
const FIT_PADDING = 1.2

/**
 * Compute camera position that fits all nodes in view from a given direction.
 */
function computeZoomToFit(
  nodes: { position: Vec3 }[],
  viewDir: Vec3,
  fov: number,
): { position: Vec3; target: Vec3 } {
  if (nodes.length === 0) {
    return {
      target: { x: 0, y: 0, z: 0 },
      position: {
        x: viewDir.x * ORIENT_DISTANCE,
        y: viewDir.y * ORIENT_DISTANCE,
        z: viewDir.z * ORIENT_DISTANCE,
      },
    }
  }

  // Compute bounding box center
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
  for (const { position: p } of nodes) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.z < minZ) minZ = p.z
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
    if (p.z > maxZ) maxZ = p.z
  }
  const center: Vec3 = {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    z: (minZ + maxZ) / 2,
  }

  // Compute bounding sphere radius from center
  let maxDistSq = 0
  for (const { position: p } of nodes) {
    const dx = p.x - center.x
    const dy = p.y - center.y
    const dz = p.z - center.z
    const distSq = dx * dx + dy * dy + dz * dz
    if (distSq > maxDistSq) maxDistSq = distSq
  }
  const radius = Math.sqrt(maxDistSq)

  // Distance to fit the bounding sphere in the viewport
  const halfFovRad = (fov / 2) * (Math.PI / 180)
  const distance = Math.max(MIN_DISTANCE, (radius / Math.tan(halfFovRad)) * FIT_PADDING)

  return {
    target: center,
    position: {
      x: center.x + viewDir.x * distance,
      y: center.y + viewDir.y * distance,
      z: center.z + viewDir.z * distance,
    },
  }
}

export default function ViewportOverlayButtons() {
  const requestAction = useCameraActionStore((s) => s.requestAction)
  const isFocused = usePlaneStore((s) => s.isFocused)

  const handleHome = () => {
    const nodes = useModelStore.getState().nodes
    const { position, target } = computeZoomToFit(nodes, HOME_DIR, DEFAULT_FOV)
    requestAction({ position, target, up: { x: 0, y: 0, z: 1 } })
  }

  const handleOrientToPlane = () => {
    const plane = getPlaneFromSelection()
    if (!plane) return

    // Position camera along the plane normal, looking at the plane anchor
    const position: Vec3 = {
      x: plane.point.x + plane.normal.x * ORIENT_DISTANCE,
      y: plane.point.y + plane.normal.y * ORIENT_DISTANCE,
      z: plane.point.z + plane.normal.z * ORIENT_DISTANCE,
    }
    requestAction({
      position,
      target: plane.point,
      up: plane.tangentV,
    })
  }

  if (isFocused) return null

  return (
    <div className="viewport-overlay-buttons">
      <button
        className="viewport-nav-btn"
        onClick={handleHome}
        title="Home view (fit model)"
      >
        &#x2302;
      </button>
      <button
        className="viewport-nav-btn"
        onClick={handleOrientToPlane}
        title="Orient to selection plane"
      >
        &#x25CE;
      </button>
    </div>
  )
}
