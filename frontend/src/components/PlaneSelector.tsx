import type { PlacementPlane } from '../model'

interface PlaneSelectorProps {
  value: PlacementPlane
  onChange: (plane: PlacementPlane) => void
}

const PLANES: PlacementPlane[] = ['XZ', 'XY', 'YZ']

export default function PlaneSelector({ value, onChange }: PlaneSelectorProps) {
  return (
    <div className="plane-selector">
      {PLANES.map((plane) => (
        <button
          key={plane}
          className={`tool-btn${value === plane ? ' active' : ''}`}
          onClick={() => onChange(plane)}
        >
          {plane}
        </button>
      ))}
    </div>
  )
}
