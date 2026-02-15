import { describe, it, expect } from 'vitest'
import { parseCoordinateInput } from '../PropertiesPanel'

describe('parseCoordinateInput', () => {
  it('parses absolute integer value', () => {
    expect(parseCoordinateInput('5', 0)).toBe(5)
  })

  it('parses absolute float value', () => {
    expect(parseCoordinateInput('3.14', 0)).toBeCloseTo(3.14)
  })

  it('parses positive relative adjustment', () => {
    expect(parseCoordinateInput('+2.5', 5)).toBeCloseTo(7.5)
  })

  it('parses negative relative adjustment', () => {
    expect(parseCoordinateInput('-1', 5)).toBeCloseTo(4)
  })

  it('parses negative relative with decimal', () => {
    expect(parseCoordinateInput('-2.5', 10)).toBeCloseTo(7.5)
  })

  it('returns null for empty string', () => {
    expect(parseCoordinateInput('', 5)).toBeNull()
  })

  it('returns null for whitespace-only string', () => {
    expect(parseCoordinateInput('   ', 5)).toBeNull()
  })

  it('returns null for non-numeric input', () => {
    expect(parseCoordinateInput('abc', 5)).toBeNull()
  })

  it('returns null for invalid relative input', () => {
    expect(parseCoordinateInput('+abc', 5)).toBeNull()
  })

  it('handles zero', () => {
    expect(parseCoordinateInput('0', 5)).toBe(0)
  })

  it('handles +0 as no change', () => {
    expect(parseCoordinateInput('+0', 5)).toBe(5)
  })

  it('trims whitespace', () => {
    expect(parseCoordinateInput('  3  ', 0)).toBe(3)
  })
})
