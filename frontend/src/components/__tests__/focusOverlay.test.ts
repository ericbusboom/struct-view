import { describe, it, expect } from 'vitest'
import { axisLabel } from '../FocusOverlay'

describe('axisLabel', () => {
  it('returns X for tangent along X axis', () => {
    expect(axisLabel({ x: 1, y: 0, z: 0 })).toBe('X')
    expect(axisLabel({ x: -1, y: 0, z: 0 })).toBe('X')
  })

  it('returns Y for tangent along Y axis', () => {
    expect(axisLabel({ x: 0, y: 1, z: 0 })).toBe('Y')
    expect(axisLabel({ x: 0, y: -1, z: 0 })).toBe('Y')
  })

  it('returns Z for tangent along Z axis', () => {
    expect(axisLabel({ x: 0, y: 0, z: 1 })).toBe('Z')
    expect(axisLabel({ x: 0, y: 0, z: -1 })).toBe('Z')
  })

  it('returns empty string for non-axis-aligned tangent', () => {
    const n = 1 / Math.sqrt(2)
    expect(axisLabel({ x: n, y: n, z: 0 })).toBe('')
  })
})
