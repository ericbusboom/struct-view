import { useState, useRef, useEffect } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'
import type { UnitSystem } from '../store/useSettingsStore'

function NumberField({ label, value, onChange }: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText(String(value))
  }, [value])

  const commit = () => {
    const n = parseFloat(text)
    if (!isNaN(n) && n > 0) {
      onChange(n)
    } else {
      setText(String(value))
    }
  }

  return (
    <div className="settings-field">
      <label>{label}</label>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === 'Enter') commit()
        }}
        className="settings-input"
      />
    </div>
  )
}

export default function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const unitSystem = useSettingsStore((s) => s.unitSystem)
  const snapGridSize = useSettingsStore((s) => s.snapGridSize)
  const gridLineSpacing = useSettingsStore((s) => s.gridLineSpacing)
  const workPlaneSize = useSettingsStore((s) => s.workPlaneSize)

  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem)
  const setSnapGridSize = useSettingsStore((s) => s.setSnapGridSize)
  const setGridLineSpacing = useSettingsStore((s) => s.setGridLineSpacing)
  const setWorkPlaneSize = useSettingsStore((s) => s.setWorkPlaneSize)

  // Close on click outside or Escape
  useEffect(() => {
    if (!open) return

    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="settings-wrapper" ref={panelRef}>
      <button
        className="tool-btn"
        onClick={() => setOpen(!open)}
        title="Settings"
      >
        &#x2699;
      </button>
      {open && (
        <div className="settings-popover">
          <div className="settings-header">Settings</div>

          <div className="settings-field">
            <label>Units</label>
            <select
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
              className="settings-select"
            >
              <option value="imperial">Imperial (ft)</option>
              <option value="metric">Metric (m)</option>
            </select>
          </div>

          <NumberField
            label="Snap grid"
            value={snapGridSize}
            onChange={setSnapGridSize}
          />
          <NumberField
            label="Grid lines"
            value={gridLineSpacing}
            onChange={setGridLineSpacing}
          />
          <NumberField
            label="Plane size"
            value={workPlaneSize}
            onChange={setWorkPlaneSize}
          />
        </div>
      )}
    </div>
  )
}
