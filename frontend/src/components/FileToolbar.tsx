import { useModelStore } from '../store/useModelStore'
import { downloadProject, importProjectFromFile } from '../io/projectFile'

export default function FileToolbar() {
  const handleSave = () => {
    const state = useModelStore.getState()
    downloadProject({
      name: state.name,
      nodes: state.nodes,
      members: state.members,
      groups: state.groups,
      panels: state.panels,
      loads: state.loads,
      load_cases: state.load_cases,
      combinations: state.combinations,
      shapes: state.shapes,
    })
  }

  const handleLoad = async () => {
    const result = await importProjectFromFile()
    if (result.ok) {
      useModelStore.getState().loadProject(result.project)
    } else {
      alert(`Import failed:\n${result.errors.join('\n')}`)
    }
  }

  return (
    <div className="file-toolbar">
      <button className="tool-btn" onClick={handleSave} title="Save project to JSON file">
        Save
      </button>
      <button className="tool-btn" onClick={handleLoad} title="Load project from JSON file">
        Load
      </button>
    </div>
  )
}
