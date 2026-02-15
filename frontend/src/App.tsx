import './App.css'
import Viewport3D from './components/Viewport3D'
import EditorToolbar from './components/EditorToolbar'
import FileToolbar from './components/FileToolbar'
import KeyboardHandler from './components/KeyboardHandler'
import Canvas2DEditor from './components/Canvas2DEditor'
import PlacementPanel from './components/PlacementPanel'
import TrussLibraryPanel from './components/TrussLibraryPanel'
import { useCanvas2DStore } from './store/useCanvas2DStore'

function App() {
  const is2DOpen = useCanvas2DStore((s) => s.isOpen)
  const open2D = useCanvas2DStore((s) => s.open)

  return (
    <div id="app">
      <KeyboardHandler />
      <header className="toolbar">
        <h1>StructView</h1>
        <EditorToolbar />
        <button className="tool-btn" onClick={open2D} style={{ marginLeft: '1rem' }} title="Create a new truss in the 2D editor">
          Add a Truss
        </button>
        <div className="toolbar-spacer" />
        <FileToolbar />
      </header>
      <main className="viewport-main">
        <div className="viewport-container">
          <Viewport3D />
        </div>
        <TrussLibraryPanel />
      </main>
      <PlacementPanel />
      {is2DOpen && <Canvas2DEditor />}
    </div>
  )
}

export default App
