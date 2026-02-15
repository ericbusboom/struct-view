import { useState, useEffect, useCallback } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'

/**
 * Parse a coordinate input string. Supports absolute values and +/- relative adjustments.
 * Returns the new value, or null if the input is invalid.
 */
export function parseCoordinateInput(input: string, currentValue: number): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null

  // Relative: starts with + or - (but "-5" is ambiguous — treat leading +/- as relative)
  if (trimmed.startsWith('+')) {
    const offset = parseFloat(trimmed.substring(1))
    return isNaN(offset) ? null : currentValue + offset
  }
  if (trimmed.startsWith('-')) {
    const offset = parseFloat(trimmed.substring(1))
    return isNaN(offset) ? null : currentValue - offset
  }

  // Absolute
  const value = parseFloat(trimmed)
  return isNaN(value) ? null : value
}

interface CoordFieldProps {
  label: string
  value: number
  onCommit: (newValue: number) => void
}

function CoordField({ label, value, onCommit }: CoordFieldProps) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const startEditing = () => {
    setEditing(true)
    setInputValue(value.toFixed(3))
  }

  const commit = useCallback(() => {
    const result = parseCoordinateInput(inputValue, value)
    if (result !== null) {
      onCommit(result)
    }
    setEditing(false)
  }, [inputValue, value, onCommit])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation() // Prevent keyboard shortcuts (n, m, etc.)
    if (e.key === 'Enter') {
      commit()
    } else if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div className="coord-field">
        <span className="coord-label">{label}</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          autoFocus
          className="coord-input"
        />
      </div>
    )
  }

  return (
    <div className="coord-field" onClick={startEditing}>
      <span className="coord-label">{label}</span>
      <span className="coord-value">{value.toFixed(3)}</span>
    </div>
  )
}

export default function PropertiesPanel() {
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds)
  const nodes = useModelStore((s) => s.nodes)
  const updateNode = useModelStore((s) => s.updateNode)

  const selectedCount = selectedNodeIds.size

  // Find the single selected node (if exactly one)
  const selectedNode = selectedCount === 1
    ? nodes.find((n) => selectedNodeIds.has(n.id)) ?? null
    : null

  // Force re-render when node position changes
  const [, setTick] = useState(0)
  useEffect(() => {
    if (selectedNode) setTick((t) => t + 1)
  }, [selectedNode?.position.x, selectedNode?.position.y, selectedNode?.position.z])

  const handleUpdateX = useCallback((val: number) => {
    if (!selectedNode) return
    updateNode(selectedNode.id, { position: { ...selectedNode.position, x: val } })
  }, [selectedNode, updateNode])

  const handleUpdateY = useCallback((val: number) => {
    if (!selectedNode) return
    updateNode(selectedNode.id, { position: { ...selectedNode.position, y: val } })
  }, [selectedNode, updateNode])

  const handleUpdateZ = useCallback((val: number) => {
    if (!selectedNode) return
    updateNode(selectedNode.id, { position: { ...selectedNode.position, z: val } })
  }, [selectedNode, updateNode])

  if (selectedCount === 0) return null

  return (
    <div className="properties-panel">
      <div className="properties-header">Properties</div>
      {selectedNode ? (
        <div className="coord-fields">
          <CoordField label="X" value={selectedNode.position.x} onCommit={handleUpdateX} />
          <CoordField label="Y" value={selectedNode.position.y} onCommit={handleUpdateY} />
          <CoordField label="Z" value={selectedNode.position.z} onCommit={handleUpdateZ} />
        </div>
      ) : (
        <div className="properties-multi">{selectedCount} nodes selected</div>
      )}
    </div>
  )
}
