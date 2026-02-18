import { useState } from 'react'
import './App.css'
import Viewport3D from './components/Viewport3D'
import EditorToolbar from './components/EditorToolbar'
import FileToolbar from './components/FileToolbar'
import KeyboardHandler from './components/KeyboardHandler'
import GroupPanel from './components/GroupPanel'
import TrussLibraryPanel from './components/TrussLibraryPanel'
import PropertiesPanel from './components/PropertiesPanel'
import FocusOverlay from './components/FocusOverlay'
import ViewportOverlayButtons from './components/ViewportOverlayButtons'
import SettingsPanel from './components/SettingsPanel'
import DuplicateDialog from './components/DuplicateDialog'
import ShortcutsPanel from './components/ShortcutsPanel'

function App() {
  const [dupOpen, setDupOpen] = useState(false)

  return (
    <div id="app">
      <KeyboardHandler onDuplicate={() => setDupOpen(true)} />
      <DuplicateDialog open={dupOpen} onClose={() => setDupOpen(false)} />
      <header className="toolbar">
        <h1>StructView</h1>
        <EditorToolbar />
        <div className="toolbar-spacer" />
        <SettingsPanel />
        <FileToolbar />
      </header>
      <main className="viewport-main">
        <div className="viewport-container" style={{ position: 'relative' }}>
          <Viewport3D />
          <FocusOverlay />
          <ViewportOverlayButtons />
        </div>
        <div className="sidebar">
          <PropertiesPanel />
          <GroupPanel />
          <TrussLibraryPanel />
          <ShortcutsPanel />
        </div>
      </main>
    </div>
  )
}

export default App
