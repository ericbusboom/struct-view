import { Canvas } from '@react-three/fiber'
import { OrbitControls, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei'
import SceneModel from './SceneModel'
import GroundPlane from './GroundPlane'
import NodeDragger from './NodeDragger'
import TrussDragger from './TrussDragger'
import RotateArc from './RotateArc'
import SnapIndicators from './SnapIndicators'
import PlaneGrid from './PlaneGrid'
import FocusCameraController from './FocusCameraController'

export default function Viewport3D() {
  return (
    <Canvas
      camera={{ position: [10, 8, 10], fov: 50, near: 0.1, far: 1000 }}
      style={{ background: '#2a2a2a' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} />

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
      />

      <axesHelper args={[5]} />

      <GroundPlane />
      <SceneModel />
      <NodeDragger />
      <TrussDragger />
      <RotateArc />
      <SnapIndicators />
      <PlaneGrid />
      <FocusCameraController />

      <OrbitControls makeDefault />

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport />
      </GizmoHelper>
    </Canvas>
  )
}
