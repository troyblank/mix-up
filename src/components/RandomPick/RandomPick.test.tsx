import type { ListWithItems } from '../../api/graphql'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import Chance from 'chance'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { API_URL } from '../../api/graphql'
import { mockListItem, mockListWithItems } from '../../testing/mocks/lists'
import { theme } from '../../theme'
import * as randomUtils from '../../utils/random'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { RandomPick } from './RandomPick'

const chance = new Chance()

describe('RandomPick', () => {
  let listWithItems: ReturnType<typeof mockListWithItems>
  let listId: string

  beforeEach(() => {
    listId = chance.guid()
    listWithItems = mockListWithItems()
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: listWithItems } }),
      } as unknown as Response)
    })
  })

  it('Returns null when id is undefined.', () => {
    const { container } = render(<RandomPick id={undefined} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('Shows loading state.', () => {
    const { getByText } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(getByText('Loading pick')).toBeInTheDocument()
  })

  it('Shows a random item when list loads.', async () => {
    const { findByText } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })
    const itemNames = listWithItems.items.map((i) => i.name)
    const pickedElement = await findByText((content) =>
      itemNames.some((name) => content === name),
    )

    expect(pickedElement).toBeInTheDocument()
  })

  it('Keeps the same pick when the list query refetches.', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const pickRandomSpy = jest
      .spyOn(randomUtils, 'pickRandom')
      .mockImplementation((items) => items[0] ?? null)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <MemoryRouter>{children}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )

    const { findByText } = render(<RandomPick id={listId} />, { wrapper })

    const stableName = listWithItems.items[0].name
    expect(await findByText(stableName)).toBeInTheDocument()
    expect(pickRandomSpy).toHaveBeenCalledTimes(1)

    await queryClient.invalidateQueries({ queryKey: ['list', listId] })

    await waitFor(() => {
      expect(jest.mocked(global.fetch).mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    expect(pickRandomSpy).toHaveBeenCalledTimes(1)
    expect(await findByText(stableName)).toBeInTheDocument()

    pickRandomSpy.mockRestore()
  })

  it('Keeps the current pick when the list length changes but that item is still present.', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const firstItem = mockListItem({ name: 'StillHere' })
    const secondItem = mockListItem()
    const listTwoItems = mockListWithItems({
      id: listId,
      items: [firstItem, secondItem],
    })
    const listThreeItems = mockListWithItems({
      id: listId,
      items: [firstItem, secondItem, mockListItem()],
    })

    let fetchCount = 0
    global.fetch = jest.fn(() => {
      fetchCount += 1
      const list = fetchCount === 1 ? listTwoItems : listThreeItems
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list } }),
      } as unknown as Response)
    })

    const pickRandomSpy = jest
      .spyOn(randomUtils, 'pickRandom')
      .mockImplementation((items) => items[0] ?? null)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <MemoryRouter>{children}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )

    const { findByText } = render(<RandomPick id={listId} />, { wrapper })

    expect(await findByText('StillHere')).toBeInTheDocument()
    expect(pickRandomSpy).toHaveBeenCalledTimes(1)

    await queryClient.invalidateQueries({ queryKey: ['list', listId] })

    await waitFor(() => {
      expect(fetchCount).toBeGreaterThanOrEqual(2)
    })

    expect(pickRandomSpy).toHaveBeenCalledTimes(1)
    expect(await findByText('StillHere')).toBeInTheDocument()

    pickRandomSpy.mockRestore()
  })

  it('Shows error when API fails.', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ message: 'Server error' }),
    } as unknown as Response)

    const { findByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })
    const alert = await findByRole('alert')

    expect(alert).toHaveTextContent(/failed to load pick/i)
  })

  it('Handles item with undefined name.', async () => {
    const listWithItemNoName = {
      ...mockListWithItems(),
      items: [{ id: chance.guid() }],
    } as ListWithItems
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve({
            data: { list: listWithItemNoName },
          }),
      } as unknown as Response),
    )

    const { findByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await findByRole('heading', { name: listWithItemNoName.name })).toBeInTheDocument()
  })

  it('Returns null when list loads as null.', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: null } }),
      } as unknown as Response),
    )

    const { container, getByText } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(getByText('Loading pick')).toBeInTheDocument()
    await waitForElementToBeRemoved(() => getByText('Loading pick'))
    expect(container).toBeEmptyDOMElement()
  })

  it('Shows empty message when list has no items.', async () => {
    const emptyList = mockListWithItems({ items: [] })
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve({
            data: { list: emptyList },
          }),
      } as unknown as Response),
    )

    const { findByText } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await findByText(/this list has no items/i)).toBeInTheDocument()
  })
})
