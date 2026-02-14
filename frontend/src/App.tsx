import './App.css'
import Viewport3D from './components/Viewport3D'
import EditorToolbar from './components/EditorToolbar'
import FileToolbar from './components/FileToolbar'
import KeyboardHandler from './components/KeyboardHandler'

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
      <main className="viewport-container">
        <Viewport3D />
      </main>
    </div>
  )
}

export default App
