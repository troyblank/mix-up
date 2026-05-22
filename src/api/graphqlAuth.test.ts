import { fetchAuthSession } from 'aws-amplify/auth'
import {
  getGraphqlAuthHeaders,
  NOT_AUTHENTICATED_MESSAGE,
} from './graphqlAuth'

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(),
}))

const mockFetchAuthSession = jest.mocked(fetchAuthSession)

describe('GraphQL auth headers', () => {
  beforeEach(() => {
    mockFetchAuthSession.mockReset()
  })

  it('Returns an empty object when auth is optional and there is no session.', async () => {
    mockFetchAuthSession.mockResolvedValue({ tokens: undefined })

    await expect(getGraphqlAuthHeaders(false)).resolves.toEqual({})
  })

  it('Returns a Bearer header when an id token is present.', async () => {
    mockFetchAuthSession.mockResolvedValue({
      tokens: { idToken: { toString: () => 'id-token-123' } },
    } as Awaited<ReturnType<typeof fetchAuthSession>>)

    await expect(getGraphqlAuthHeaders(false)).resolves.toEqual({
      Authorization: 'Bearer id-token-123',
    })
  })

  it('Throws when auth is required but there is no id token.', async () => {
    mockFetchAuthSession.mockResolvedValue({ tokens: undefined })

    await expect(getGraphqlAuthHeaders(true)).rejects.toThrow(
      NOT_AUTHENTICATED_MESSAGE,
    )
  })

  it('Throws when auth is required and the session cannot be loaded.', async () => {
    mockFetchAuthSession.mockRejectedValue(new Error('session error'))

    await expect(getGraphqlAuthHeaders(true)).rejects.toThrow(
      NOT_AUTHENTICATED_MESSAGE,
    )
  })
})
