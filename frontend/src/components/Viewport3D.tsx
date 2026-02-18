import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, GizmoHelper, Grid } from '@react-three/drei'
import * as THREE from 'three'
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
import NodePlacer from './NodePlacer'
import DimensionOverlay from './DimensionOverlay'
import { useSettingsStore } from '../store/useSettingsStore'

function SettingsGrid() {
  const cellSize = useSettingsStore((s) => s.snapGridSize)
  const sectionSize = useSettingsStore((s) => s.gridLineSpacing)
  return (
    <Grid
      args={[100, 100]}
      cellSize={cellSize}
      cellThickness={0.5}
      cellColor="#444"
      sectionSize={sectionSize}
      sectionThickness={1}
      sectionColor="#666"
      fadeDistance={50}
      infiniteGrid
      rotation={[Math.PI / 2, 0, 0]}
    />
  )
}

/**
 * Imperatively configure OrbitControls after creation.
 *
 * drei recreates the OrbitControls instance whenever the R3F camera changes
 * (e.g. entering/exiting 2D focus mode). This configurator re-applies
 * settings whenever the controls instance changes.
 *
 * Turntable orbit (Tinkercad-style):
 *   Right-click drag        → Orbit (azimuth around Z, elevation tilt)
 *   Shift + right-click     → Pan
 *   Middle scroll            → Zoom toward cursor
 *   Left click               → Selection (no-op for controls)
 */
function OrbitControlsConfigurator() {
  const controls = useThree((s) => s.controls) as any

  useEffect(() => {
    if (!controls) return

    // Right-click orbits, middle zooms, left does nothing (selection)
    controls.mouseButtons = {
      LEFT: -1,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    }

    controls.enableDamping = false
    controls.rotateSpeed = 1.5
    controls.zoomToCursor = true

    // Disable built-in keyboard controls (arrows pan by default in OrbitControls)
    controls.enableKeys = false
    controls.keys = {}
  }, [controls])

  // OrbitControls has built-in modifier key handling:
  // Shift + ROTATE action → PAN, so Shift + right-click pans automatically.

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
      <SettingsGrid />

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
      <NodePlacer />
      <DimensionOverlay />

      <OrbitControls makeDefault />
      <OrbitControlsConfigurator />

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <ViewCube />
      </GizmoHelper>
    </Canvas>
  )
}
