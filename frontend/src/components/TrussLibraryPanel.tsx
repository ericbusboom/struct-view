import { useModelStore } from '../store/useModelStore'
import { useCanvas2DStore } from '../store/useCanvas2DStore'
import { useEditor2DStore } from '../store/useEditor2DStore'
import { usePlacementStore } from '../store/usePlacementStore'
import TrussCard from './TrussCard'

export default function TrussLibraryPanel() {
  const shapes = useModelStore((s) => s.shapes)
  const open2D = useCanvas2DStore((s) => s.open)
  const loadShape = useEditor2DStore((s) => s.loadShape)
  const startPlacement = usePlacementStore((s) => s.startPlacement)

  const handleEdit = (shapeId: string) => {
    const shape = useModelStore.getState().shapes.find((s) => s.id === shapeId)
    if (shape) {
      loadShape(shape)
      open2D()
    }
  }

  const handlePlace = (shapeId: string) => {
    const shape = useModelStore.getState().shapes.find((s) => s.id === shapeId)
    if (shape) {
      startPlacement(shape)
    }
  }

  return (
    <div className="truss-library-panel">
      <div className="truss-library-header">Trusses</div>
      {shapes.length === 0 ? (
        <div className="truss-library-empty">
          No trusses yet. Click "Add a Truss" to get started.
        </div>
      ) : (
        <div className="truss-library-list">
          {shapes.map((shape) => (
            <TrussCard
              key={shape.id}
              shape={shape}
              onEdit={() => handleEdit(shape.id)}
              onPlace={() => handlePlace(shape.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
