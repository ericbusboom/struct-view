import './App.css'
import Viewport3D from './components/Viewport3D'

function App() {
  return (
    <div id="app">
      <header className="toolbar">
        <h1>StructView</h1>
      </header>
      <main className="viewport-container">
        <Viewport3D />
      </main>
    </div>
  )
}

export default App
