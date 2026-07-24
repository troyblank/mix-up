import { postGraphql } from './graphqlRequest'

export { API_URL } from './graphqlConfig'

export type ListType = 'pick' | 'list'

export type List = {
  id: string
  name: string
  type: ListType
}

export type ListItem = {
  id: string
  name: string
}

export type ListWithItems = List & {
  items: ListItem[]
}

export type ListsResponse = {
  data: {
    lists: List[]
  }
}

export type ListResponse = {
  data: {
    list: ListWithItems | null
  }
}

export type CreateListInput = {
  name: string
  type: ListType
}

export type CreateListResponse = {
  data: {
    createNewList: Pick<List, 'id' | 'name' | 'type'>
  }
}

export type InsertListItemInput = {
  listId: string
  name: string
}

export type InsertListItemResponse = {
  data: {
    insertListItem: ListItem
  }
}

export type DeleteListItemInput = {
  itemId: string
}

export type DeleteListItemResponse = {
  data: {
    deleteListItem: boolean
  }
}

export type DeleteListItemsInput = {
  itemIds: string[]
}

export type DeleteListItemsResponse = {
  data: {
    deleteListItems: number
  }
}

const LISTS_QUERY = `
  query Lists {
    lists {
      id
      name
    }
  }
`

export const fetchLists = async (): Promise<List[]> => {
  const data = await postGraphql<ListsResponse>(
    { query: LISTS_QUERY },
    'Failed to load lists',
  )
  if (data?.data?.lists == null) {
    throw new Error('Invalid lists response')
  }
  return data.data.lists
}

const LIST_QUERY = `
  query List($id: ID!) {
    list(id: $id) {
      id
      name
      type
      items {
        id
        name
      }
    }
  }
`

export const fetchList = async (
  id: string,
): Promise<ListWithItems | null> => {
  const data = await postGraphql<ListResponse>(
    { query: LIST_QUERY, variables: { id } },
    'Failed to load list',
  )
  return data?.data?.list ?? null
}

const CREATE_LIST_MUTATION = `
  mutation CreateList($input: CreateListInput!) {
    createNewList(input: $input) {
      id
      name
      type
    }
  }
`

export const createList = async (
  input: CreateListInput,
): Promise<Pick<List, 'id' | 'name' | 'type'>> => {
  const data = await postGraphql<CreateListResponse>(
    {
      query: CREATE_LIST_MUTATION,
      variables: { input },
    },
    'Failed to create list',
    { requireAuth: true },
  )
  if (data?.data?.createNewList == null) {
    throw new Error('Invalid create list response')
  }
  return data.data.createNewList
}

const INSERT_LIST_ITEM_MUTATION = `
  mutation InsertListItem($input: InsertListItemInput!) {
    insertListItem(input: $input) {
      id
      name
    }
  }
`

export const insertListItem = async (
  input: InsertListItemInput,
): Promise<ListItem> => {
  const data = await postGraphql<InsertListItemResponse>(
    {
      query: INSERT_LIST_ITEM_MUTATION,
      variables: { input },
    },
    'Failed to add item',
    { requireAuth: true },
  )
  if (data?.data?.insertListItem == null) {
    throw new Error('Invalid insert list item response')
  }
  return data.data.insertListItem
}

const DELETE_LIST_ITEM_MUTATION = `
  mutation DeleteListItem($input: DeleteListItemInput!) {
    deleteListItem(input: $input)
  }
`

export const deleteListItem = async (
  input: DeleteListItemInput,
): Promise<boolean> => {
  const data = await postGraphql<DeleteListItemResponse>(
    {
      query: DELETE_LIST_ITEM_MUTATION,
      variables: { input },
    },
    'Failed to delete item',
    { requireAuth: true },
  )
  if (data?.data?.deleteListItem == null) {
    throw new Error('Invalid delete list item response')
  }
  return data.data.deleteListItem
}

const DELETE_LIST_ITEMS_MUTATION = `
  mutation DeleteListItems($input: DeleteListItemsInput!) {
    deleteListItems(input: $input)
  }
`

export const deleteListItems = async (
  input: DeleteListItemsInput,
): Promise<number> => {
  const data = await postGraphql<DeleteListItemsResponse>(
    {
      query: DELETE_LIST_ITEMS_MUTATION,
      variables: { input },
    },
    'Failed to delete items',
    { requireAuth: true },
  )
  if (data?.data?.deleteListItems == null) {
    throw new Error('Invalid delete list items response')
  }
  return data.data.deleteListItems
}
