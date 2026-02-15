import { useModelStore } from '../store/useModelStore'
import type { Shape2D } from '../model'

export default function ShapeLibrary({ onClose }: { onClose: () => void }) {
  const shapes = useModelStore((s) => s.shapes)
  const updateShape = useModelStore((s) => s.updateShape)
  const removeShape = useModelStore((s) => s.removeShape)

  const handleRename = (shape: Shape2D) => {
    const name = prompt('New name:', shape.name)
    if (!name) return
    updateShape(shape.id, { name })
  }

  const handleDelete = (shape: Shape2D) => {
    if (!confirm(`Delete shape "${shape.name}"?`)) return
    removeShape(shape.id)
  }

  return (
    <div className="shape-library">
      <div className="shape-library-header">
        <span>Shape Library</span>
        <button className="tool-btn" onClick={onClose}>X</button>
      </div>
      <div className="shape-library-list">
        {shapes.length === 0 && (
          <div className="shape-library-empty">No saved shapes</div>
        )}
        {shapes.map((shape) => (
          <div key={shape.id} className="shape-library-item">
            <div className="shape-library-item-info">
              <span className="shape-library-item-name">{shape.name}</span>
              <span className="shape-library-item-count">
                {shape.nodes.length}n / {shape.members.length}m
              </span>
            </div>
            <div className="shape-library-item-actions">
              <button className="tool-btn" onClick={() => handleRename(shape)}>Rename</button>
              <button className="tool-btn" onClick={() => handleDelete(shape)}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
