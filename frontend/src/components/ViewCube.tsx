/**
 * Custom ViewCube for Z-up coordinate system.
 * Clicks dispatch viewFrom actions to CameraActionExecutor (bypassing
 * drei's tweenCamera which hardcodes Y-up during animation).
 *
 * Face index → BoxGeometry material index:
 *   0: +X (Right)   1: -X (Left)
 *   2: +Y (Front)   3: -Y (Back)
 *   4: +Z (Top)     5: -Z (Bottom)
 *
 * Text rotation needed for Z-up viewing:
 *   +X: 90° CW   -X: 90° CCW   +Y: 180°   -Y/+Z/-Z: 0°
 */
import * as React from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3, CanvasTexture } from 'three'
import { useCameraActionStore } from '../store/useCameraActionStore'

const FACE_LABELS = ['Right', 'Left', 'Front', 'Back', 'Top', 'Bottom']

/**
 * Camera position directions for each face (direction FROM target TO camera).
 * Clicking "Right" puts the camera on the +X side looking toward -X.
 */
const FACE_VIEW_DIRS: Vector3[] = [
  new Vector3(1, 0, 0),   // Right: camera at +X
  new Vector3(-1, 0, 0),  // Left: camera at -X
  new Vector3(0, 1, 0),   // Front: camera at +Y
  new Vector3(0, -1, 0),  // Back: camera at -Y
  new Vector3(0, 0, 1),   // Top: camera at +Z
  new Vector3(0, 0, -1),  // Bottom: camera at -Z
]

/** Per-face canvas rotation (radians) to correct text for Z-up viewing. */
const FACE_ROTATIONS = [
  -Math.PI / 2,   // +X: 90° CW
  Math.PI / 2,    // -X: 90° CCW
  Math.PI,        // +Y: 180°
  0,              // -Y: no rotation
  0,              // +Z: no rotation
  0,              // -Z: no rotation
]

const BG_COLOR = '#f0f0f0'
const TEXT_COLOR = '#000'
const STROKE_COLOR = '#000'
const HOVER_COLOR = '#999'
const FONT = '20px Inter var, Arial, sans-serif'

function createFaceTexture(label: string, rotation: number): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, 128, 128)
  ctx.strokeStyle = STROKE_COLOR
  ctx.strokeRect(0, 0, 128, 128)

  // Rotate around center before drawing text
  ctx.save()
  ctx.translate(64, 64)
  ctx.rotate(rotation)
  ctx.font = FONT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = TEXT_COLOR
  ctx.fillText(label.toUpperCase(), 0, 0)
  ctx.restore()

  return new CanvasTexture(canvas)
}

const makePositionVector = (xyz: number[]) => new Vector3(...xyz).multiplyScalar(0.38)

const corners = [
  [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
  [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
].map(makePositionVector)

const edges = [
  [1, 1, 0], [1, 0, 1], [1, 0, -1], [1, -1, 0],
  [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1],
  [-1, 1, 0], [-1, 0, 1], [-1, 0, -1], [-1, -1, 0],
].map(makePositionVector)

const edgeDimensions = edges.map((edge) =>
  edge.toArray().map((axis) => (axis === 0 ? 0.5 : 0.25)) as [number, number, number],
)

function FaceMaterial({ index, hover }: { index: number; hover: boolean }) {
  const gl = useThree((s) => s.gl)
  const texture = React.useMemo(
    () => createFaceTexture(FACE_LABELS[index], FACE_ROTATIONS[index]),
    [index],
  )
  return (
    <meshBasicMaterial
      map={texture}
      map-anisotropy={gl.capabilities.getMaxAnisotropy() || 1}
      attach={`material-${index}`}
      color={hover ? HOVER_COLOR : 'white'}
    />
  )
}

function FaceCube() {
  const requestAction = useCameraActionStore((s) => s.requestAction)
  const [hover, setHover] = React.useState<number | null>(null)

  const handleClick = React.useCallback((e: { stopPropagation: () => void; faceIndex: number }) => {
    e.stopPropagation()
    const faceIdx = Math.floor(e.faceIndex / 2)
    const dir = FACE_VIEW_DIRS[faceIdx]
    if (dir) {
      requestAction({ viewFrom: { x: dir.x, y: dir.y, z: dir.z } })
    }
  }, [requestAction])

  return (
    <mesh
      onPointerOut={(e) => { e.stopPropagation(); setHover(null) }}
      onPointerMove={(e) => { e.stopPropagation(); setHover(Math.floor(e.faceIndex / 2)) }}
      onClick={handleClick}
    >
      {[...Array(6)].map((_, i) => (
        <FaceMaterial key={i} index={i} hover={hover === i} />
      ))}
      <boxGeometry />
    </mesh>
  )
}

function EdgeCube({ position, dimensions }: { position: Vector3; dimensions: number[] | [number, number, number] }) {
  const requestAction = useCameraActionStore((s) => s.requestAction)
  const [hover, setHover] = React.useState(false)

  const handleClick = React.useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    // Edge/corner position IS the view direction (camera on that side of the target)
    const dir = position.clone().normalize()
    requestAction({ viewFrom: { x: dir.x, y: dir.y, z: dir.z } })
  }, [requestAction, position])

  return (
    <mesh
      scale={1.01}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true) }}
      onPointerOut={(e) => { e.stopPropagation(); setHover(false) }}
      onClick={handleClick}
    >
      <meshBasicMaterial
        color={hover ? HOVER_COLOR : 'white'}
        transparent
        opacity={0.6}
        visible={hover}
      />
      <boxGeometry args={dimensions as [number, number, number]} />
    </mesh>
  )
}

export default function ViewCube() {
  return (
    <group scale={[60, 60, 60]}>
      <FaceCube />
      {edges.map((edge, i) => (
        <EdgeCube key={`e${i}`} position={edge} dimensions={edgeDimensions[i]} />
      ))}
      {corners.map((corner, i) => (
        <EdgeCube key={`c${i}`} position={corner} dimensions={[0.25, 0.25, 0.25]} />
      ))}
    </group>
  )
}
