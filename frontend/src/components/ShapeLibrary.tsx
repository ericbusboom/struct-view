import { nanoid } from 'nanoid'
import { useModelStore } from '../store/useModelStore'
import { useEditor2DStore } from '../store/useEditor2DStore'
import { usePlacementStore } from '../store/usePlacementStore'
import type { Shape2D } from '../model'

function deepCopyShape(shape: Shape2D): Shape2D {
  return JSON.parse(JSON.stringify(shape))
}

/** Check if dirty and confirm discard. Returns true if safe to proceed. */
function confirmIfDirty(isDirty: boolean): boolean {
  if (!isDirty) return true
  return confirm('You have unsaved changes. Discard them?')
}

export default function ShapeLibrary({ onClose }: { onClose: () => void }) {
  const shapes = useModelStore((s) => s.shapes)
  const addShape = useModelStore((s) => s.addShape)
  const updateShape = useModelStore((s) => s.updateShape)
  const removeShape = useModelStore((s) => s.removeShape)
  const editorShape = useEditor2DStore((s) => s.shape)
  const loadShape = useEditor2DStore((s) => s.loadShape)
  const resetShape = useEditor2DStore((s) => s.resetShape)
  const editingShapeId = useEditor2DStore((s) => s.editingShapeId)
  const isDirty = useEditor2DStore((s) => s.isDirty)
  const markClean = useEditor2DStore((s) => s.markClean)
  const startPlacement = usePlacementStore((s) => s.startPlacement)

  const handleNew = () => {
    if (!confirmIfDirty(isDirty)) return
    resetShape()
  }

  const handleSave = () => {
    if (editingShapeId) {
      // Update existing shape in library
      updateShape(editingShapeId, deepCopyShape(editorShape))
      markClean()
    } else {
      // Save as new shape
      const name = prompt('Shape name:', editorShape.name)
      if (!name) return
      const copy = deepCopyShape(editorShape)
      copy.name = name
      addShape(copy)
      // Now track as editing this shape
      useEditor2DStore.setState({ editingShapeId: copy.id, isDirty: false })
    }
  }

  const handleSaveAs = () => {
    const name = prompt('Save as:', editorShape.name)
    if (!name) return
    const copy = deepCopyShape(editorShape)
    copy.name = name
    // Give it a new ID so it's a separate library entry
    copy.id = nanoid()
    addShape(copy)
    useEditor2DStore.setState({ editingShapeId: copy.id, isDirty: false })
  }

  const handleLoad = (shape: Shape2D) => {
    if (!confirmIfDirty(isDirty)) return
    loadShape(deepCopyShape(shape), shape.id)
    onClose()
  }

  const handlePlace = (shape: Shape2D) => {
    startPlacement(shape)
    onClose()
  }

  const handleRename = (shape: Shape2D) => {
    const name = prompt('New name:', shape.name)
    if (!name) return
    updateShape(shape.id, { name })
  }

  const handleDelete = (shape: Shape2D) => {
    if (!confirm(`Delete shape "${shape.name}"?`)) return
    removeShape(shape.id)
    // If we were editing the deleted shape, reset
    if (editingShapeId === shape.id) {
      resetShape()
    }
  }

  return (
    <div className="shape-library">
      <div className="shape-library-header">
        <span>Shape Library</span>
        <button className="tool-btn" onClick={onClose}>X</button>
      </div>
      <div className="shape-library-actions">
        <button className="tool-btn" onClick={handleNew}>New</button>
        <button className="tool-btn" onClick={handleSave}>
          {editingShapeId ? 'Save' : 'Save New'}
        </button>
        {editingShapeId && (
          <button className="tool-btn" onClick={handleSaveAs}>Save As</button>
        )}
        {isDirty && <span className="shape-library-dirty">*unsaved</span>}
      </div>
      <div className="shape-library-list">
        {shapes.length === 0 && (
          <div className="shape-library-empty">No saved shapes</div>
        )}
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className={`shape-library-item${shape.id === editingShapeId ? ' shape-library-item-active' : ''}`}
          >
            <div className="shape-library-item-info">
              <span className="shape-library-item-name">{shape.name}</span>
              <span className="shape-library-item-count">
                {shape.nodes.length}n / {shape.members.length}m
              </span>
            </div>
            <div className="shape-library-item-actions">
              <button className="tool-btn" onClick={() => handlePlace(shape)}>Place</button>
              <button className="tool-btn" onClick={() => handleLoad(shape)}>Load</button>
              <button className="tool-btn" onClick={() => handleRename(shape)}>Rename</button>
              <button className="tool-btn" onClick={() => handleDelete(shape)}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
