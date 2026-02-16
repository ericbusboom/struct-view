import { useState } from 'react'
import { useModelStore } from '../store/useModelStore'
import { usePlaneStore } from '../store/usePlaneStore'
import { useEditorStore } from '../store/useEditorStore'
import { placeShapeOnPlane } from '../editor2d/shapeToPlane'
import { createGroup } from '../model'
import type { Shape2D } from '../model'
import TrussCard from './TrussCard'
import TemplatePicker from './TemplatePicker'

export default function TrussLibraryPanel() {
  const [showPicker, setShowPicker] = useState(false)
  const shapes = useModelStore((s) => s.shapes)
  const addNode = useModelStore((s) => s.addNode)
  const addMember = useModelStore((s) => s.addMember)
  const addGroup = useModelStore((s) => s.addGroup)
  const activePlane = usePlaneStore((s) => s.activePlane)
  const selectGroup = useEditorStore((s) => s.selectGroup)

  const handlePlace = (shape: Shape2D) => {
    if (!activePlane) return
    const { nodes, members } = placeShapeOnPlane(shape, activePlane, { u: 0, v: 0 })
    const group = createGroup(shape.name)

    for (const node of nodes) {
      addNode({ ...node, groupId: group.id })
    }
    for (const member of members) {
      addMember({ ...member, groupId: group.id })
    }

    addGroup({
      ...group,
      nodeIds: nodes.map((n) => n.id),
      memberIds: members.map((m) => m.id),
    })
    selectGroup(group.id)
  }

  return (
    <div className="truss-library-panel">
      <div className="truss-library-header">
        Trusses
        <button className="tool-btn" onClick={() => setShowPicker(!showPicker)}>
          + Template
        </button>
      </div>
      {showPicker && <TemplatePicker onClose={() => setShowPicker(false)} />}
      {shapes.length === 0 && !showPicker ? (
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
              onPlace={() => handlePlace(shape)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
