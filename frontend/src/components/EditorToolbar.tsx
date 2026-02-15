import { useEditorStore } from '../store/useEditorStore'
import type { EditorMode } from '../store/useEditorStore'
import PlaneSelector from './PlaneSelector'

const TOOLS: { mode: EditorMode; label: string; shortcut: string }[] = [
  { mode: 'select', label: 'Select', shortcut: 'V' },
  { mode: 'add-node', label: 'Add Node', shortcut: 'N' },
  { mode: 'add-member', label: 'Add Member', shortcut: 'M' },
  { mode: 'move', label: 'Move', shortcut: 'G' },
  { mode: 'rotate', label: 'Rotate', shortcut: 'R' },
]

export default function EditorToolbar() {
  const mode = useEditorStore((s) => s.mode)
  const setMode = useEditorStore((s) => s.setMode)
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId)
  const activePlane = useEditorStore((s) => s.activePlane)
  const setActivePlane = useEditorStore((s) => s.setActivePlane)

  return (
    <div className="editor-toolbar">
      {TOOLS.map((tool) => (
        <button
          key={tool.mode}
          className={`tool-btn ${mode === tool.mode ? 'active' : ''}`}
          onClick={() => setMode(tool.mode)}
          title={`${tool.label} (${tool.shortcut})`}
        >
          {tool.label}
        </button>
      ))}
      {selectedGroupId && (
        <PlaneSelector value={activePlane} onChange={setActivePlane} />
      )}
    </div>
  )
}
