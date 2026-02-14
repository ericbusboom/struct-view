import { usePlacementStore } from '../store/usePlacementStore'

export default function PlacementPanel() {
  const phase = usePlacementStore((s) => s.phase)
  const shape = usePlacementStore((s) => s.shape)
  const offset = usePlacementStore((s) => s.offset)
  const count = usePlacementStore((s) => s.count)
  const setOffset = usePlacementStore((s) => s.setOffset)
  const setCount = usePlacementStore((s) => s.setCount)
  const cancel = usePlacementStore((s) => s.cancel)
  const confirmPlacement = usePlacementStore((s) => s.confirmPlacement)

  if (phase === 'idle') return null

  return (
    <div className="placement-panel">
      <div className="placement-panel-header">
        <span>Place: {shape?.name ?? 'Shape'}</span>
        <button className="tool-btn" onClick={cancel}>Cancel</button>
      </div>

      {phase === 'picking-edge' && (
        <div className="placement-panel-body">
          Click two points to define the target edge, or click a member.
        </div>
      )}

      {(phase === 'previewing' || phase === 'adjusting') && (
        <div className="placement-panel-body">
          <label>
            Offset
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={offset}
              onChange={(e) => setOffset(Number(e.target.value))}
            />
            <span>{(offset * 100).toFixed(0)}%</span>
          </label>
          <label>
            Count
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>
          <div className="placement-panel-actions">
            <button className="tool-btn" onClick={confirmPlacement}>
              Confirm
            </button>
            <button className="tool-btn" onClick={cancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
