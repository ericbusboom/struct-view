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
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      const newMode = MODE_KEYS[e.key.toLowerCase()]
      if (newMode) {
        setMode(newMode)
        return
      }

      // Delete / Backspace — remove all selected entities
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedNodeIds, selectedMemberIds, clearSelection } = useEditorStore.getState()
        const model = useModelStore.getState()

        for (const id of selectedMemberIds) {
          model.removeMember(id)
        }
        for (const id of selectedNodeIds) {
          useModelStore.getState().removeNode(id)
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
