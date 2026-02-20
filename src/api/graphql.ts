import { getAndValidateResponseData } from '../utils/apiCommunication'

export const API_URL = 'https://mix-up-api.troyblank.com/graphql'

export type List = {
  id: string
  name: string
}

export type ListsResponse = {
  data: {
    lists: List[]
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

export async function fetchLists(): Promise<List[]> {
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
