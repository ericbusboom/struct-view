import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { TrackballControls, GizmoHelper, Grid } from '@react-three/drei'
import ViewCube from './ViewCube'
import SceneModel from './SceneModel'
import GroundPlane from './GroundPlane'
import NodeDragger from './NodeDragger'
import TrussDragger from './TrussDragger'
import RotateArc from './RotateArc'
import SnapIndicators from './SnapIndicators'
import PlaneGrid from './PlaneGrid'
import PlanePlacer from './PlanePlacer'
import FocusCameraController from './FocusCameraController'
import CameraActionExecutor from './CameraActionExecutor'
import DragSelect from './DragSelect'

/**
 * Imperatively configure TrackballControls after creation.
 *
 * drei recreates the TrackballControls instance whenever the R3F camera
 * changes (e.g. entering/exiting 2D focus mode). Passing mouseButtons as
 * a JSX prop on <TrackballControls> goes through R3F's <primitive>, which
 * has unreliable timing for nested-object props. Instead, we set everything
 * here via an effect that re-runs whenever the controls instance changes.
 *
 * Mouse mapping (TrackballControls semantics):
 *   mouseButtons.LEFT  = button number that triggers ROTATE
 *   mouseButtons.MIDDLE = button number that triggers ZOOM
 *   mouseButtons.RIGHT  = button number that triggers PAN
 *
 * Desired behavior:
 *   Right-click drag (button 2)        → Orbit (ROTATE)
 *   Shift + right-click drag (button 2) → Pan
 *   Middle scroll                       → Zoom (handled by mousewheel, not mouseButtons)
 *   Left click (button 0)              → Selection (no-op for controls)
 */
function TrackballControlsConfigurator() {
  const controls = useThree((s) => s.controls) as any

  // Apply base configuration whenever controls instance changes
  useEffect(() => {
    if (!controls) return

    // Right-click (2) → ROTATE, middle (1) → ZOOM, nothing (-1) → PAN
    controls.mouseButtons.LEFT = 2
    controls.mouseButtons.MIDDLE = 1
    controls.mouseButtons.RIGHT = -1

    // Disable built-in keyboard shortcuts (A/S/D) that switch modes.
    // Set to key codes that will never be pressed.
    controls.keys = ['', '', '']

    controls.cursorZoom = true
    controls.staticMoving = true
  }, [controls])

  // Shift key: swap right-click between ROTATE and PAN
  useEffect(() => {
    if (!controls) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        controls.mouseButtons.LEFT = -1  // no button → ROTATE
        controls.mouseButtons.RIGHT = 2  // right-click → PAN
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        controls.mouseButtons.LEFT = 2   // right-click → ROTATE
        controls.mouseButtons.RIGHT = -1 // no button → PAN
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [controls])

  return null
}

export default function Viewport3D() {
  return (
    <Canvas
      camera={{ position: [10, -8, 10], fov: 50, near: 0.1, far: 1000, up: [0, 0, 1] }}
      style={{ background: '#2a2a2a' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 15]} intensity={0.8} />

      {/* Ground grid in XY plane (Z-up) */}
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#444"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#666"
        fadeDistance={50}
        infiniteGrid
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* RGB axis arrows at the origin (1 grid unit long) */}
      <axesHelper args={[1]} />

      <GroundPlane />
      <SceneModel />
      <NodeDragger />
      <TrussDragger />
      <RotateArc />
      <SnapIndicators />
      <PlaneGrid />
      <PlanePlacer />
      <FocusCameraController />
      <CameraActionExecutor />
      <DragSelect />

      <TrackballControls makeDefault />
      <TrackballControlsConfigurator />

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <ViewCube />
      </GizmoHelper>
    </Canvas>
  )
}
