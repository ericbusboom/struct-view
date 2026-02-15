import { useModelStore } from '../store/useModelStore'
import TrussCard from './TrussCard'

export default function TrussLibraryPanel() {
  const shapes = useModelStore((s) => s.shapes)

  return (
    <div className="truss-library-panel">
      <div className="truss-library-header">Trusses</div>
      {shapes.length === 0 ? (
        <div className="truss-library-empty">
          No trusses yet.
        </div>
      ) : (
        <div className="truss-library-list">
          {shapes.map((shape) => (
            <TrussCard
              key={shape.id}
              shape={shape}
              onEdit={() => {}}
              onPlace={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}
