import { useEffect } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { useModelStore } from '../store/useModelStore'
import type { EditorMode } from '../store/useEditorStore'

const MODE_KEYS: Record<string, EditorMode> = {
  v: 'select',
  n: 'add-node',
  m: 'add-member',
  g: 'move',
}

export default function KeyboardHandler() {
  const setMode = useEditorStore((s) => s.setMode)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      // Mode shortcuts
      const newMode = MODE_KEYS[e.key.toLowerCase()]
      if (newMode) {
        setMode(newMode)
        return
      }

      // Delete / Backspace — remove selected entity
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedId, selectedType, clearSelection } = useEditorStore.getState()
        if (!selectedId || !selectedType) return

        if (selectedType === 'node') {
          useModelStore.getState().removeNode(selectedId)
        } else if (selectedType === 'member') {
          useModelStore.getState().removeMember(selectedId)
        }
        clearSelection()
      }

      // Escape — clear selection and reset to select mode
      if (e.key === 'Escape') {
        useEditorStore.getState().clearSelection()
        useEditorStore.getState().setMemberStartNode(null)
        setMode('select')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setMode])

  return null
}
