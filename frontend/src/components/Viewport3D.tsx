import { Canvas } from '@react-three/fiber'
import { OrbitControls, GizmoHelper, Grid } from '@react-three/drei'
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

      <OrbitControls makeDefault zoomToCursor />

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <ViewCube />
      </GizmoHelper>
    </Canvas>
  )
}
