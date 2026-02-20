import { fetchLists, API_URL } from './graphql'
import { mockJsonResponse } from '../testing/mocks/api'
import { mockLists } from '../testing/mocks/lists'

describe('Graphql', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('Sends a request to the API with the correct URL and list query.', async () => {
    const mockFetch = jest.mocked(global.fetch)
    mockFetch.mockResolvedValue(
      mockJsonResponse(true, { data: { lists: [] } }, 200, API_URL),
    )

    await fetchLists()

    const body = JSON.parse(String(mockFetch.mock.calls[0][1]?.body ?? '{}'))

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('query'),
    })

    expect(body.query).toContain('lists')
    expect(body.query).toContain('id')
    expect(body.query).toContain('name')
  })

  it('Returns the lists when the API responds successfully.', async () => {
    const lists = mockLists()
    jest.mocked(global.fetch).mockResolvedValue(
      mockJsonResponse(true, { data: { lists } }, 200, API_URL),
    )

    const result = await fetchLists()

    expect(result).toEqual(lists)
  })

  it('Throws when the server returns an error.', async () => {
    jest.mocked(global.fetch).mockResolvedValue(
      mockJsonResponse(false, { message: 'Server error' }, 500, API_URL),
    )

    await expect(fetchLists()).rejects.toThrow()
  })

  it('Throws when the API response has no lists.', async () => {
    jest.mocked(global.fetch).mockResolvedValue(
      mockJsonResponse(true, { data: {} }, 200, API_URL),
    )

    await expect(fetchLists()).rejects.toThrow('Invalid lists response')
  })

  it('Throws when the API returns an empty response.', async () => {
    jest.mocked(global.fetch).mockResolvedValue(
      mockJsonResponse(true, {}, 200, API_URL),
    )

    await expect(fetchLists()).rejects.toThrow('Invalid lists response')
  })

  it('Throws when the API returns null instead of lists.', async () => {
    jest.mocked(global.fetch).mockResolvedValue(
      mockJsonResponse(true, { data: null }, 200, API_URL),
    )

    await expect(fetchLists()).rejects.toThrow('Invalid lists response')
  })
})
