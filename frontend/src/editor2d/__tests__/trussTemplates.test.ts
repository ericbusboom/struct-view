import { describe, it, expect } from 'vitest'
import {
  generatePrattTruss,
  generateHoweTruss,
  generateWarrenTruss,
  generateScissorsTruss,
} from '../trussTemplates'
import { Shape2DSchema } from '../../model'

describe('truss templates', () => {
  describe('generatePrattTruss', () => {
    it('generates correct node count: 2*(panels+1)', () => {
      const shape = generatePrattTruss(10, 2, 4)
      expect(shape.nodes).toHaveLength(10) // 5 bottom + 5 top
    })

    it('generates correct member count', () => {
      const shape = generatePrattTruss(10, 2, 4)
      // 4 bottom + 4 top + 5 verticals + 4 diagonals = 17
      expect(shape.members).toHaveLength(17)
    })

    it('passes Shape2DSchema validation', () => {
      const shape = generatePrattTruss(10, 2, 4)
      expect(Shape2DSchema.safeParse(shape).success).toBe(true)
    })

    it('bottom chord members are snap edges', () => {
      const shape = generatePrattTruss(10, 2, 4)
      const bottomChordMembers = shape.members.filter((m) => m.isSnapEdge)
      expect(bottomChordMembers).toHaveLength(4)
    })
  })

  describe('generateHoweTruss', () => {
    it('generates correct topology', () => {
      const shape = generateHoweTruss(12, 3, 6)
      expect(shape.nodes).toHaveLength(14) // 7 bottom + 7 top
      // 6 bottom + 6 top + 7 verticals + 6 diagonals = 25
      expect(shape.members).toHaveLength(25)
    })

    it('passes Shape2DSchema validation', () => {
      const shape = generateHoweTruss(10, 2, 4)
      expect(Shape2DSchema.safeParse(shape).success).toBe(true)
    })

    it('bottom chord members are snap edges', () => {
      const shape = generateHoweTruss(10, 2, 4)
      expect(shape.members.filter((m) => m.isSnapEdge)).toHaveLength(4)
    })
  })

  describe('generateWarrenTruss', () => {
    it('has alternating diagonals with no verticals', () => {
      const shape = generateWarrenTruss(10, 2, 4)
      // 4 bottom + 4 top + 4 diagonals = 12 (NO verticals)
      expect(shape.members).toHaveLength(12)
    })

    it('passes Shape2DSchema validation', () => {
      const shape = generateWarrenTruss(10, 2, 4)
      expect(Shape2DSchema.safeParse(shape).success).toBe(true)
    })

    it('bottom chord members are snap edges', () => {
      const shape = generateWarrenTruss(10, 2, 4)
      expect(shape.members.filter((m) => m.isSnapEdge)).toHaveLength(4)
    })
  })

  describe('generateScissorsTruss', () => {
    it('has crossed diagonals per panel', () => {
      const shape = generateScissorsTruss(10, 2, 4)
      // 4 bottom + 4 top + 8 diagonals (2 per panel) = 16
      expect(shape.members).toHaveLength(16)
    })

    it('passes Shape2DSchema validation', () => {
      const shape = generateScissorsTruss(10, 2, 4)
      expect(Shape2DSchema.safeParse(shape).success).toBe(true)
    })

    it('bottom chord members are snap edges', () => {
      const shape = generateScissorsTruss(10, 2, 4)
      expect(shape.members.filter((m) => m.isSnapEdge)).toHaveLength(4)
    })
  })

  it('varying panel count changes internal divisions', () => {
    const s2 = generatePrattTruss(10, 2, 2)
    const s6 = generatePrattTruss(10, 2, 6)
    expect(s2.nodes.length).toBeLessThan(s6.nodes.length)
    expect(s2.members.length).toBeLessThan(s6.members.length)
  })

  it('all templates produce unique ids', () => {
    const shapes = [
      generatePrattTruss(10, 2, 4),
      generateHoweTruss(10, 2, 4),
      generateWarrenTruss(10, 2, 4),
      generateScissorsTruss(10, 2, 4),
    ]
    const allIds = shapes.flatMap((s) => [
      s.id,
      ...s.nodes.map((n) => n.id),
      ...s.members.map((m) => m.id),
    ])
    expect(new Set(allIds).size).toBe(allIds.length)
  })
})
