export const randomInclusiveInteger = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

export const pickRandom = <T>(items: T[]): T | null =>
  items.length === 0
    ? null
    : items[randomInclusiveInteger(0, items.length - 1)]

export const shuffleArray = <T>(items: T[]): T[] => {
  const randomizedItems = [...items]
  for (
    let targetIndex = randomizedItems.length - 1;
    targetIndex > 0;
    targetIndex -= 1
  ) {
    const randomIndex = randomInclusiveInteger(0, targetIndex)
    const valueAtTargetIndex = randomizedItems[targetIndex]
    randomizedItems[targetIndex] = randomizedItems[randomIndex]!
    randomizedItems[randomIndex] = valueAtTargetIndex!
  }
  return randomizedItems
}
