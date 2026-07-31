import type { ListItem } from '../../api/graphql'

export const itemDisplayName = (item: ListItem): string => {
  const name = item.name?.trim()
  return name !== '' && name != null ? name : 'Unnamed item'
}

export const sortItemsAlphabetically = (items: ListItem[]): ListItem[] =>
  [...items].sort((a, b) =>
    itemDisplayName(a).localeCompare(itemDisplayName(b)),
  )

export const resolveDeleteTargetId = (
  items: ListItem[],
  pickedName: string | null,
): string | null => {
  if (items.length === 0) return null
  if (pickedName != null && pickedName !== '') {
    const match = items.find((item) => item.name === pickedName)
    if (match != null) return match.id
  }
  return items[0].id
}
