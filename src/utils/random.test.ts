import Chance from 'chance'
import { pickRandom, randomInclusiveInteger, shuffleArray } from './random'

const chance = new Chance()

describe('Pick Random Utility', () => {
  it('Returns null when items array is empty.', () => {
    expect(pickRandom([])).toBeNull()
  })

  it('Returns an item from the array when non-empty.', () => {
    const items = chance.unique(chance.word, 5)
    const randomlyPickedItem = pickRandom(items)

    expect(items).toContain(randomlyPickedItem)
  })
})

describe('Shuffle Array Utility', () => {
  it('Returns an empty array when the input is empty.', () => {
    expect(shuffleArray([])).toEqual([])
  })

  it('Returns a permutation of the input with the same length.', () => {
    const items = chance.unique(chance.word, 6)
    const shuffled = shuffleArray(items)

    expect(shuffled).toHaveLength(items.length)
    expect([...shuffled].sort()).toEqual([...items].sort())
  })
})

describe('randomInclusiveInteger', () => {
  it('Returns an integer between minimum and maximum inclusive.', () => {
    for (let attemptIndex = 0; attemptIndex < 40; attemptIndex += 1) {
      const minimum = chance.integer({ min: -20, max: 50 })
      const maximum = minimum + chance.integer({ min: 0, max: 30 })
      const randomInclusiveIntegerResult = randomInclusiveInteger(
        minimum,
        maximum,
      )

      expect(Number.isInteger(randomInclusiveIntegerResult)).toBe(true)
      expect(randomInclusiveIntegerResult).toBeGreaterThanOrEqual(minimum)
      expect(randomInclusiveIntegerResult).toBeLessThanOrEqual(maximum)
    }
  })
})
