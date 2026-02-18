import { useEditorStore } from '../store/useEditorStore'
import { usePlaneStore } from '../store/usePlaneStore'

interface Shortcut {
  key: string
  label: string
}

export default function ShortcutsPanel() {
  const mode = useEditorStore((s) => s.mode)
  const hasSelection =
    useEditorStore((s) => s.selectedNodeIds.size > 0 || s.selectedMemberIds.size > 0 || !!s.selectedGroupId)
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId)
  const activePlane = usePlaneStore((s) => s.activePlane)
  const isFocused = usePlaneStore((s) => s.isFocused)

  const shortcuts: Shortcut[] = []

  // Mode shortcuts — always available
  shortcuts.push({ key: 'V', label: 'Select' })
  shortcuts.push({ key: 'M', label: 'Add member' })
  shortcuts.push({ key: 'N', label: 'Add node' })

  if (isFocused) {
    // 2D focused mode
    shortcuts.push({ key: 'F', label: 'Exit 2D' })

    if (hasSelection) {
      shortcuts.push({ key: 'D', label: 'Duplicate' })
      shortcuts.push({ key: 'Del', label: 'Delete' })
    }

    if (selectedGroupId) {
      shortcuts.push({ key: 'R', label: 'Rotate mode' })
      shortcuts.push({ key: '\u2190\u2192\u2191\u2193', label: 'Nudge group' })
      shortcuts.push({ key: 'Shift+\u2190', label: 'Fine nudge' })
    }

    shortcuts.push({ key: 'L', label: 'Dimensions' })
    shortcuts.push({ key: 'Esc', label: 'Exit all' })
  } else if (activePlane) {
    // 3D with active plane
    shortcuts.push({ key: 'R', label: 'Rotate mode' })
    shortcuts.push({ key: 'F', label: 'Enter 2D' })
    shortcuts.push({ key: 'P', label: 'New plane' })

    shortcuts.push({ key: '\u2190\u2192\u2191\u2193', label: selectedGroupId ? 'Nudge group' : 'Tilt plane' })
    if (selectedGroupId) {
      shortcuts.push({ key: 'Shift+\u2190', label: 'Fine nudge' })
    }
    shortcuts.push({ key: 'X Y Z', label: 'Align plane' })

    if (hasSelection) {
      shortcuts.push({ key: 'D', label: 'Duplicate' })
      shortcuts.push({ key: 'Del', label: 'Delete' })
    }

    shortcuts.push({ key: 'L', label: 'Dimensions' })
    shortcuts.push({ key: 'Esc', label: 'Clear all' })
  } else {
    // Base 3D — no plane
    shortcuts.push({ key: 'R', label: 'Rotate mode' })
    shortcuts.push({ key: 'P', label: 'Set plane' })

    if (hasSelection) {
      shortcuts.push({ key: 'D', label: 'Duplicate' })
      shortcuts.push({ key: 'Del', label: 'Delete' })
    }

    shortcuts.push({ key: 'L', label: 'Dimensions' })
    shortcuts.push({ key: 'Esc', label: 'Clear all' })
  }

  // Mouse controls (always shown)
  const mouse: Shortcut[] = [
    { key: 'RMB', label: 'Orbit' },
    { key: 'Shift+RMB', label: 'Pan' },
    { key: 'Scroll', label: 'Zoom' },
  ]

  return (
    <div className="shortcuts-panel">
      <div className="shortcuts-header">
        Shortcuts
        {isFocused && <span className="shortcuts-badge">2D</span>}
      </div>
      <div className="shortcuts-list">
        {shortcuts.map((s, i) => (
          <div key={i} className="shortcut-row">
            <kbd className="shortcut-key">{s.key}</kbd>
            <span className="shortcut-label">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="shortcuts-divider" />
      <div className="shortcuts-list">
        {mouse.map((s, i) => (
          <div key={i} className="shortcut-row">
            <kbd className="shortcut-key">{s.key}</kbd>
            <span className="shortcut-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
