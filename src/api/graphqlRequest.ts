import { getAndValidateResponseData } from '../utils/apiCommunication'
import { getGraphqlAuthHeaders } from './graphqlAuth'
import { API_URL } from './graphqlConfig'

type GraphqlRequestBody = {
  query: string
  variables?: Record<string, unknown>
}

export const postGraphql = async <T>(
  body: GraphqlRequestBody,
  errorMessage: string,
  options?: { requireAuth?: boolean },
): Promise<T> => {
  const authHeaders = await getGraphqlAuthHeaders(options?.requireAuth ?? false)

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(body),
  })

  const { data } = await getAndValidateResponseData<T>(res, errorMessage)
  return data
}
