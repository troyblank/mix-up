export const randomInclusiveInteger = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

export const pickRandom = <T>(items: T[]): T | null =>
  items.length === 0
    ? null
    : items[randomInclusiveInteger(0, items.length - 1)]
