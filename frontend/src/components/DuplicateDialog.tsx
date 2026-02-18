import { useState, useEffect, useRef } from 'react'
import { nanoid } from 'nanoid'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import { parseCoordinateInput } from './PropertiesPanel'

interface Props {
  open: boolean
  onClose: () => void
}

export default function DuplicateDialog({ open, onClose }: Props) {
  const [dx, setDx] = useState('0')
  const [dy, setDy] = useState('0')
  const [dz, setDz] = useState('0')
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && firstRef.current) {
      firstRef.current.select()
    }
  }, [open])

  if (!open) return null

  const handleSubmit = () => {
    const offsetX = parseCoordinateInput(dx, 0) ?? 0
    const offsetY = parseCoordinateInput(dy, 0) ?? 0
    const offsetZ = parseCoordinateInput(dz, 0) ?? 0

    const { selectedNodeIds, selectedMemberIds, selectedGroupId } = useEditorStore.getState()
    const { nodes, members, addNode, addMember } = useModelStore.getState()

    // Collect all node IDs to duplicate
    const nodeIdsToDup = new Set<string>()
    const memberIdsToDup = new Set<string>()

    if (selectedGroupId) {
      // Duplicate entire group's nodes and members
      for (const n of nodes) {
        if (n.groupId === selectedGroupId) nodeIdsToDup.add(n.id)
      }
      for (const m of members) {
        if (m.groupId === selectedGroupId) memberIdsToDup.add(m.id)
      }
    } else {
      // Add explicitly selected nodes
      for (const id of selectedNodeIds) nodeIdsToDup.add(id)

      // Add explicitly selected members and their nodes
      for (const id of selectedMemberIds) {
        const m = members.find((mem) => mem.id === id)
        if (m) {
          memberIdsToDup.add(m.id)
          nodeIdsToDup.add(m.start_node)
          nodeIdsToDup.add(m.end_node)
        }
      }

      // If both nodes of a member are selected, include that member too
      for (const m of members) {
        if (nodeIdsToDup.has(m.start_node) && nodeIdsToDup.has(m.end_node)) {
          memberIdsToDup.add(m.id)
        }
      }
    }

    if (nodeIdsToDup.size === 0) {
      onClose()
      return
    }

    // Create new nodes with offset
    const oldToNew = new Map<string, string>()
    const newNodeIds = new Set<string>()

    for (const oldId of nodeIdsToDup) {
      const node = nodes.find((n) => n.id === oldId)
      if (!node) continue
      const newId = nanoid()
      oldToNew.set(oldId, newId)
      newNodeIds.add(newId)
      addNode({
        ...node,
        id: newId,
        groupId: undefined, // don't copy group membership
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY,
          z: node.position.z + offsetZ,
        },
      })
    }

    // Create new members
    for (const oldId of memberIdsToDup) {
      const m = members.find((mem) => mem.id === oldId)
      if (!m) continue
      const newStart = oldToNew.get(m.start_node)
      const newEnd = oldToNew.get(m.end_node)
      if (newStart && newEnd) {
        addMember({
          ...m,
          id: nanoid(),
          groupId: undefined,
          start_node: newStart,
          end_node: newEnd,
        })
      }
    }

    // Select the new nodes
    useEditorStore.getState().setSelectedNodeIds(newNodeIds)

    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="duplicate-backdrop" onClick={onClose}>
      <div className="duplicate-dialog" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="duplicate-header">Duplicate with Offset</div>
        <div className="duplicate-fields">
          <div className="duplicate-field">
            <label>X</label>
            <input ref={firstRef} type="text" value={dx} onChange={(e) => setDx(e.target.value)} autoFocus />
          </div>
          <div className="duplicate-field">
            <label>Y</label>
            <input type="text" value={dy} onChange={(e) => setDy(e.target.value)} />
          </div>
          <div className="duplicate-field">
            <label>Z</label>
            <input type="text" value={dz} onChange={(e) => setDz(e.target.value)} />
          </div>
        </div>
        <div className="duplicate-actions">
          <button className="tool-btn" onClick={onClose}>Cancel</button>
          <button className="tool-btn active" onClick={handleSubmit}>Duplicate</button>
        </div>
      </div>
    </div>
  )
}
