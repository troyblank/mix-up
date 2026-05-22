import { fetchAuthSession } from 'aws-amplify/auth'

export const NOT_AUTHENTICATED_MESSAGE = 'Not Authenticated'

export const getGraphqlAuthHeaders = async (
  required: boolean,
): Promise<Record<string, string>> => {
  let idToken: string | undefined

  try {
    const session = await fetchAuthSession()
    idToken = session.tokens?.idToken?.toString()
  } catch {
    idToken = undefined
  }

  if (!idToken) {
    if (required) {
      throw new Error(NOT_AUTHENTICATED_MESSAGE)
    }
    return {}
  }

  return { Authorization: `Bearer ${idToken}` }
}
