import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'

/**
 * Parse a coordinate input string. Supports:
 * - Absolute values: "5", "-3.2"
 * - Expressions with +/-: "12.5+3" → 15.5, "10-2.5" → 7.5
 * - Leading +/- as relative to current: "+3" → currentValue + 3
 *
 * Returns the new value, or null if the input is invalid.
 */
export function parseCoordinateInput(input: string, currentValue: number): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null

  // Leading +/- with no number before it: relative to current value
  if (trimmed.startsWith('+')) {
    const rest = trimmed.substring(1)
    const result = evaluateAddSub(rest)
    return result !== null ? currentValue + result : null
  }

  // Try to evaluate as an expression with +/- operators
  const result = evaluateAddSub(trimmed)
  return result
}

/** Evaluate a simple expression with + and - (left to right). */
function evaluateAddSub(expr: string): number | null {
  // Split on + or - while keeping the operator, but not splitting a leading minus
  // e.g. "-3+2-1" → ["-3", "+2", "-1"]
  const tokens = expr.match(/^-?\d*\.?\d+|[+-]\d*\.?\d+/g)
  if (!tokens || tokens.join('') !== expr) return null

  let sum = 0
  for (const token of tokens) {
    const val = parseFloat(token)
    if (isNaN(val)) return null
    sum += val
  }
  return sum
}

interface CoordFieldProps {
  label: string
  value: number
  onCommit: (newValue: number) => void
  editing: boolean
  onStartEdit: () => void
  onAdvance: () => void
  onStopEdit: () => void
}

function CoordField({ label, value, onCommit, editing, onStartEdit, onAdvance, onStopEdit }: CoordFieldProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setInputValue(value.toFixed(3))
    }
  }, [editing, value])

  // Select all text when the input mounts/focuses
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.select()
    }
  }, [editing])

  const commit = useCallback(() => {
    const result = parseCoordinateInput(inputValue, value)
    if (result !== null) {
      onCommit(result)
    }
  }, [inputValue, value, onCommit])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      commit()
      onAdvance()
    } else if (e.key === 'Escape') {
      onStopEdit()
    }
  }

  if (editing) {
    return (
      <div className="coord-field">
        <span className="coord-label">{label}</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { commit(); onStopEdit() }}
          autoFocus
          className="coord-input"
        />
      </div>
    )
  }

  return (
    <div className="coord-field" onClick={onStartEdit}>
      <span className="coord-label">{label}</span>
      <span className="coord-value">{value.toFixed(3)}</span>
    </div>
  )
}

/** Compute distance between two 3D points. */
function distance(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

function NodeProperties() {
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds)
  const nodes = useModelStore((s) => s.nodes)
  const updateNode = useModelStore((s) => s.updateNode)

  const selectedCount = selectedNodeIds.size
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

  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  useEffect(() => {
    setEditingIndex(null)
  }, [selectedNode?.id])

  const fields = [
    { label: 'X', value: selectedNode?.position.x ?? 0, onCommit: handleUpdateX },
    { label: 'Y', value: selectedNode?.position.y ?? 0, onCommit: handleUpdateY },
    { label: 'Z', value: selectedNode?.position.z ?? 0, onCommit: handleUpdateZ },
  ]

  if (selectedCount === 0) return null

  return (
    <>
      <div className="properties-header">Node</div>
      {selectedNode ? (
        <div className="coord-fields">
          {fields.map((f, i) => (
            <CoordField
              key={f.label}
              label={f.label}
              value={f.value}
              onCommit={f.onCommit}
              editing={editingIndex === i}
              onStartEdit={() => setEditingIndex(i)}
              onAdvance={() => setEditingIndex(i < 2 ? i + 1 : null)}
              onStopEdit={() => setEditingIndex(null)}
            />
          ))}
        </div>
      ) : (
        <div className="properties-multi">{selectedCount} nodes selected</div>
      )}
    </>
  )
}

function MemberProperties() {
  const selectedMemberIds = useEditorStore((s) => s.selectedMemberIds)
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds)
  const nodes = useModelStore((s) => s.nodes)
  const members = useModelStore((s) => s.members)
  const updateNode = useModelStore((s) => s.updateNode)

  const memberCount = selectedMemberIds.size
  const selectedMember = memberCount === 1
    ? members.find((m) => selectedMemberIds.has(m.id)) ?? null
    : null

  // Find endpoints
  const startNode = selectedMember ? nodes.find((n) => n.id === selectedMember.start_node) ?? null : null
  const endNode = selectedMember ? nodes.find((n) => n.id === selectedMember.end_node) ?? null : null

  // The selected endpoint node (the one that will move when length is edited)
  const moveNodeId = selectedNodeIds.size === 1 ? [...selectedNodeIds][0] : null
  const moveNode = moveNodeId && selectedMember &&
    (moveNodeId === selectedMember.start_node || moveNodeId === selectedMember.end_node)
    ? nodes.find((n) => n.id === moveNodeId) ?? null
    : null
  const anchorNode = moveNode && startNode && endNode
    ? (moveNode.id === startNode.id ? endNode : startNode)
    : null

  const length = useMemo(() => {
    if (!startNode || !endNode) return 0
    return distance(startNode.position, endNode.position)
  }, [startNode?.position.x, startNode?.position.y, startNode?.position.z,
      endNode?.position.x, endNode?.position.y, endNode?.position.z])

  const [editingLength, setEditingLength] = useState(false)
  const [lengthInput, setLengthInput] = useState('')
  const lengthInputRef = useRef<HTMLInputElement>(null)

  // Reset editing when selection changes
  useEffect(() => {
    setEditingLength(false)
  }, [selectedMember?.id, moveNodeId])

  useEffect(() => {
    if (editingLength) {
      setLengthInput(length.toFixed(3))
    }
  }, [editingLength, length])

  useEffect(() => {
    if (editingLength && lengthInputRef.current) {
      lengthInputRef.current.select()
    }
  }, [editingLength])

  const commitLength = useCallback(() => {
    if (!moveNode || !anchorNode) return
    const newLength = parseCoordinateInput(lengthInput, length)
    if (newLength === null || newLength <= 0) return

    // Direction from anchor to moveNode
    const dx = moveNode.position.x - anchorNode.position.x
    const dy = moveNode.position.y - anchorNode.position.y
    const dz = moveNode.position.z - anchorNode.position.z
    const currentDist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (currentDist < 1e-12) return

    const scale = newLength / currentDist
    updateNode(moveNode.id, {
      position: {
        x: anchorNode.position.x + dx * scale,
        y: anchorNode.position.y + dy * scale,
        z: anchorNode.position.z + dz * scale,
      },
    })
  }, [moveNode, anchorNode, lengthInput, length, updateNode])

  const handleLengthKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      commitLength()
      setEditingLength(false)
    } else if (e.key === 'Escape') {
      setEditingLength(false)
    }
  }

  if (memberCount === 0) return null

  const canEdit = !!moveNode && !!anchorNode

  return (
    <>
      <div className="properties-header">Member</div>
      {selectedMember ? (
        <div className="coord-fields">
          {canEdit && editingLength ? (
            <div className="coord-field">
              <span className="coord-label">L</span>
              <input
                ref={lengthInputRef}
                type="text"
                value={lengthInput}
                onChange={(e) => setLengthInput(e.target.value)}
                onKeyDown={handleLengthKeyDown}
                onBlur={() => { commitLength(); setEditingLength(false) }}
                autoFocus
                className="coord-input"
              />
            </div>
          ) : (
            <div className="coord-field" onClick={canEdit ? () => setEditingLength(true) : undefined}
                 style={canEdit ? undefined : { cursor: 'default' }}>
              <span className="coord-label">L</span>
              <span className="coord-value">{length.toFixed(3)}</span>
            </div>
          )}
          {!canEdit && (
            <div className="properties-hint">Click an endpoint to edit length</div>
          )}
        </div>
      ) : (
        <div className="properties-multi">{memberCount} members selected</div>
      )}
    </>
  )
}

export default function PropertiesPanel() {
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds)
  const selectedMemberIds = useEditorStore((s) => s.selectedMemberIds)
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId)

  const hasNodes = selectedNodeIds.size > 0
  const hasMembers = selectedMemberIds.size > 0

  if (!hasNodes && !hasMembers && !selectedGroupId) return null

  return (
    <div className="properties-panel">
      <div className="properties-header">Properties</div>
      {hasMembers && <MemberProperties />}
      {hasNodes && <NodeProperties />}
      {selectedGroupId && !hasNodes && !hasMembers && (
        <div className="properties-multi">Group selected</div>
      )}
    </div>
  )
}
