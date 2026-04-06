import { getAndValidateResponseData } from '../utils/apiCommunication'

export const API_URL = 'https://mix-up-api.troyblank.com/graphql'

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
    createList: Pick<List, 'id' | 'name' | 'type'>
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
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: LISTS_QUERY }),
  })
  const { data } = await getAndValidateResponseData<ListsResponse>(
    res,
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
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: LIST_QUERY, variables: { id } }),
  })
  const { data } = await getAndValidateResponseData<ListResponse>(
    res,
    'Failed to load list',
  )
  return data?.data?.list ?? null
}

const CREATE_LIST_MUTATION = `
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) {
      id
      name
      type
    }
  }
`

export const createList = async (
  input: CreateListInput,
): Promise<Pick<List, 'id' | 'name' | 'type'>> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: CREATE_LIST_MUTATION,
      variables: { input },
    }),
  })
  const { data } = await getAndValidateResponseData<CreateListResponse>(
    res,
    'Failed to create list',
  )
  if (data?.data?.createList == null) {
    throw new Error('Invalid create list response')
  }
  return data.data.createList
}
