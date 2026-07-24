import { fetchAuthSession } from 'aws-amplify/auth'
import {
  createList,
  deleteListItem,
  deleteListItems,
  fetchLists,
  fetchList,
  insertListItem,
  API_URL,
} from './graphql'
import { mockJsonResponse } from '../testing/mocks/api'
import { mockList, mockLists } from '../testing/mocks/lists'

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(),
}))

const mockFetchAuthSession = jest.mocked(fetchAuthSession)

describe('Graphql', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
    mockFetchAuthSession.mockResolvedValue({ tokens: undefined })
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

  describe('fetchList', () => {
    const listWithItems = {
      id: '1',
      name: 'TV Shows',
      type: 'pick' as const,
      items: [
        { id: '1', name: 'Show A' },
        { id: '2', name: 'Show B' },
      ],
    }

    it('Sends a request with the list query and id variable.', async () => {
      const mockFetch = jest.mocked(global.fetch)
      mockFetch.mockResolvedValue(
        mockJsonResponse(true, { data: { list: listWithItems } }, 200, API_URL),
      )

      await fetchList('1')

      const body = JSON.parse(String(mockFetch.mock.calls[0][1]?.body ?? '{}'))
      expect(body.query).toContain('list')
      expect(body.variables).toEqual({ id: '1' })
    })

    it('Returns the list with items when the API responds successfully.', async () => {
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(true, { data: { list: listWithItems } }, 200, API_URL),
      )

      const result = await fetchList('1')

      expect(result).toEqual(listWithItems)
    })

    it('Returns null when the list is not found.', async () => {
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(true, { data: { list: null } }, 200, API_URL),
      )

      const result = await fetchList('999')

      expect(result).toBeNull()
    })

    it('Throws when the server returns an error.', async () => {
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(false, { message: 'Server error' }, 500, API_URL),
      )

      await expect(fetchList('1')).rejects.toThrow()
    })
  })

  describe('Create List', () => {
    const input = { name: 'New list', type: 'pick' as const }
    const createdList = mockList({
      id: 'new-id',
      name: input.name,
      type: input.type,
    })

    it('Sends a create mutation with variables.', async () => {
      const mockFetch = jest.mocked(global.fetch)
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      mockFetch.mockResolvedValue(
        mockJsonResponse(
          true,
          { data: { createNewList: createdList } },
          200,
          API_URL,
        ),
      )

      await createList(input)

      const body = JSON.parse(String(mockFetch.mock.calls[0][1]?.body ?? '{}'))
      expect(body.query).toContain('createNewList')
      expect(body.variables).toEqual({ input })
      expect(mockFetch).toHaveBeenCalledWith(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer signed-in-token',
        },
        body: expect.any(String),
      })
    })

    it('Returns the created list when the API responds successfully.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(
          true,
          { data: { createNewList: createdList } },
          200,
          API_URL,
        ),
      )

      const result = await createList(input)

      expect(result).toEqual(createdList)
    })

    it('Throws when createNewList is missing from the response.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(true, { data: {} }, 200, API_URL),
      )

      await expect(createList(input)).rejects.toThrow(
        'Invalid create list response',
      )
    })

    it('Throws when the server returns an error.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(false, { message: 'Server error' }, 500, API_URL),
      )

      await expect(createList(input)).rejects.toThrow()
    })

    it('Throws when there is no signed-in session.', async () => {
      mockFetchAuthSession.mockResolvedValue({ tokens: undefined })

      await expect(createList(input)).rejects.toThrow('Not Authenticated')
    })
  })

  describe('insertListItem', () => {
    const input = { listId: 'list-1', name: 'New item' }

    it('Sends an insert mutation with variables.', async () => {
      const mockFetch = jest.mocked(global.fetch)
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      mockFetch.mockResolvedValue(
        mockJsonResponse(
          true,
          { data: { insertListItem: { id: 'item-1', name: input.name } } },
          200,
          API_URL,
        ),
      )

      await insertListItem(input)

      const body = JSON.parse(String(mockFetch.mock.calls[0][1]?.body ?? '{}'))
      expect(body.query).toContain('insertListItem')
      expect(body.variables).toEqual({ input })
      expect(mockFetch).toHaveBeenCalledWith(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer signed-in-token',
        },
        body: expect.any(String),
      })
    })

    it('Returns the inserted item when the API responds successfully.', async () => {
      const insertedItem = { id: 'item-1', name: input.name }
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(
          true,
          { data: { insertListItem: insertedItem } },
          200,
          API_URL,
        ),
      )

      const result = await insertListItem(input)

      expect(result).toEqual(insertedItem)
    })

    it('Throws when insertListItem is missing from the response.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(true, { data: {} }, 200, API_URL),
      )

      await expect(insertListItem(input)).rejects.toThrow(
        'Invalid insert list item response',
      )
    })

    it('Throws when the server returns an error.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(false, { message: 'Server error' }, 500, API_URL),
      )

      await expect(insertListItem(input)).rejects.toThrow()
    })

    it('Throws when there is no signed-in session.', async () => {
      mockFetchAuthSession.mockResolvedValue({ tokens: undefined })

      await expect(insertListItem(input)).rejects.toThrow('Not Authenticated')
    })
  })

  describe('deleteListItem', () => {
    const input = { itemId: 'item-1' }

    it('Sends a delete mutation with variables.', async () => {
      const mockFetch = jest.mocked(global.fetch)
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      mockFetch.mockResolvedValue(
        mockJsonResponse(
          true,
          { data: { deleteListItem: true } },
          200,
          API_URL,
        ),
      )

      await deleteListItem(input)

      const body = JSON.parse(String(mockFetch.mock.calls[0][1]?.body ?? '{}'))
      expect(body.query).toContain('deleteListItem')
      expect(body.variables).toEqual({ input })
      expect(mockFetch).toHaveBeenCalledWith(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer signed-in-token',
        },
        body: expect.any(String),
      })
    })

    it('Returns true when the API responds successfully.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(
          true,
          { data: { deleteListItem: true } },
          200,
          API_URL,
        ),
      )

      const result = await deleteListItem(input)

      expect(result).toBe(true)
    })

    it('Throws when deleteListItem is missing from the response.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(true, { data: {} }, 200, API_URL),
      )

      await expect(deleteListItem(input)).rejects.toThrow(
        'Invalid delete list item response',
      )
    })

    it('Throws when the server returns an error.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(false, { message: 'Server error' }, 500, API_URL),
      )

      await expect(deleteListItem(input)).rejects.toThrow()
    })

    it('Throws when there is no signed-in session.', async () => {
      mockFetchAuthSession.mockResolvedValue({ tokens: undefined })

      await expect(deleteListItem(input)).rejects.toThrow('Not Authenticated')
    })
  })

  describe('deleteListItems', () => {
    const input = { itemIds: ['item-1', 'item-2'] }

    it('Sends a delete mutation with variables.', async () => {
      const mockFetch = jest.mocked(global.fetch)
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      mockFetch.mockResolvedValue(
        mockJsonResponse(
          true,
          { data: { deleteListItems: 2 } },
          200,
          API_URL,
        ),
      )

      await deleteListItems(input)

      const body = JSON.parse(String(mockFetch.mock.calls[0][1]?.body ?? '{}'))
      expect(body.query).toContain('deleteListItems')
      expect(body.variables).toEqual({ input })
      expect(mockFetch).toHaveBeenCalledWith(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer signed-in-token',
        },
        body: expect.any(String),
      })
    })

    it('Returns the deleted count when the API responds successfully.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(
          true,
          { data: { deleteListItems: 2 } },
          200,
          API_URL,
        ),
      )

      const result = await deleteListItems(input)

      expect(result).toBe(2)
    })

    it('Throws when deleteListItems is missing from the response.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(true, { data: {} }, 200, API_URL),
      )

      await expect(deleteListItems(input)).rejects.toThrow(
        'Invalid delete list items response',
      )
    })

    it('Throws when the server returns an error.', async () => {
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => 'signed-in-token' } },
      } as Awaited<ReturnType<typeof fetchAuthSession>>)
      jest.mocked(global.fetch).mockResolvedValue(
        mockJsonResponse(false, { message: 'Server error' }, 500, API_URL),
      )

      await expect(deleteListItems(input)).rejects.toThrow()
    })

    it('Throws when there is no signed-in session.', async () => {
      mockFetchAuthSession.mockResolvedValue({ tokens: undefined })

      await expect(deleteListItems(input)).rejects.toThrow('Not Authenticated')
    })
  })
})
