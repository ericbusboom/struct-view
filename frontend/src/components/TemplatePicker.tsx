import { useState } from 'react'
import {
  generatePrattTruss,
  generateHoweTruss,
  generateWarrenTruss,
  generateScissorsTruss,
} from '../editor2d/trussTemplates'
import { useModelStore } from '../store/useModelStore'
import type { Shape2D } from '../model'

type TemplateType = 'pratt' | 'howe' | 'warren' | 'scissors'

const GENERATORS: Record<TemplateType, (span: number, depth: number, panels: number) => Shape2D> = {
  pratt: generatePrattTruss,
  howe: generateHoweTruss,
  warren: generateWarrenTruss,
  scissors: generateScissorsTruss,
}

const LABELS: Record<TemplateType, string> = {
  pratt: 'Pratt',
  howe: 'Howe',
  warren: 'Warren',
  scissors: 'Scissors',
}

export default function TemplatePicker({ onClose }: { onClose: () => void }) {
  const [template, setTemplate] = useState<TemplateType>('pratt')
  const [span, setSpan] = useState(10)
  const [depth, setDepth] = useState(2)
  const [panels, setPanels] = useState(4)
  const addShape = useModelStore((s) => s.addShape)

  const handleGenerate = () => {
    const shape = GENERATORS[template](span, depth, panels)
    addShape(shape)
    onClose()
  }

  return (
    <div className="template-picker">
      <div className="template-picker-title">Truss Template</div>
      <div className="template-picker-row">
        <label>Type</label>
        <select value={template} onChange={(e) => setTemplate(e.target.value as TemplateType)}>
          {(Object.keys(LABELS) as TemplateType[]).map((t) => (
            <option key={t} value={t}>{LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div className="template-picker-row">
        <label>Span</label>
        <input type="number" min={1} step={0.5} value={span} onChange={(e) => setSpan(+e.target.value)} />
      </div>
      <div className="template-picker-row">
        <label>Depth</label>
        <input type="number" min={0.1} step={0.1} value={depth} onChange={(e) => setDepth(+e.target.value)} />
      </div>
      <div className="template-picker-row">
        <label>Panels</label>
        <input type="number" min={2} max={20} step={1} value={panels} onChange={(e) => setPanels(+e.target.value)} />
      </div>
      <div className="template-picker-actions">
        <button className="tool-btn" onClick={handleGenerate}>Generate</button>
        <button className="tool-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
