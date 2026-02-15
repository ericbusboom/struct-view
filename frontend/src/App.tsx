import './App.css'
import Viewport3D from './components/Viewport3D'
import EditorToolbar from './components/EditorToolbar'
import FileToolbar from './components/FileToolbar'
import KeyboardHandler from './components/KeyboardHandler'
import TrussLibraryPanel from './components/TrussLibraryPanel'
import PropertiesPanel from './components/PropertiesPanel'
import FocusOverlay from './components/FocusOverlay'

function App() {
  return (
    <div id="app">
      <KeyboardHandler />
      <header className="toolbar">
        <h1>StructView</h1>
        <EditorToolbar />
        <div className="toolbar-spacer" />
        <FileToolbar />
      </header>
      <main className="viewport-main">
        <div className="viewport-container" style={{ position: 'relative' }}>
          <Viewport3D />
          <FocusOverlay />
        </div>
        <div className="sidebar">
          <PropertiesPanel />
          <TrussLibraryPanel />
        </div>
      </main>
    </div>
  )
}

export default App
