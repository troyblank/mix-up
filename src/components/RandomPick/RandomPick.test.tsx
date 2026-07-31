import { fetchAuthSession } from 'aws-amplify/auth'
import type { ListWithItems } from '../../api/graphql'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chance from 'chance'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { API_URL } from '../../api/graphql'
import { mockListItem, mockListWithItems } from '../../testing/mocks/lists'
import { theme } from '../../theme'
import * as randomUtils from '../../utils/random'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { ConfirmDialog } from '../ConfirmDialog'
import { RandomPick } from './RandomPick'
import * as randomPickUtils from './utils'

jest.mock('../ConfirmDialog', () => {
  const actual = jest.requireActual('../ConfirmDialog')
  return {
    ...actual,
    ConfirmDialog: jest.fn((props) => actual.ConfirmDialog(props)),
  }
})

const chance = new Chance()

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(),
}))

const mockFetchAuthSession = jest.mocked(fetchAuthSession)
const mockConfirmDialog = jest.mocked(ConfirmDialog)

describe('RandomPick', () => {
  let listWithItems: ReturnType<typeof mockListWithItems>
  let listId: string

  beforeEach(() => {
    mockConfirmDialog.mockImplementation(
      jest.requireActual('../ConfirmDialog').ConfirmDialog,
    )
    mockFetchAuthSession.mockResolvedValue({
      tokens: { idToken: { toString: () => 'test-id-token' } },
    } as Awaited<ReturnType<typeof fetchAuthSession>>)
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

    const { findByText, findByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await findByText(/this list has no items/i)).toBeInTheDocument()
    expect(
      await findByRole('button', { name: /^add$/i }),
    ).toBeInTheDocument()
  })

  it('Closes the add dialog when cancel is clicked before submit.', async () => {
    const user = userEvent.setup()
    const { findByRole, getByRole, queryByRole } = render(
      <RandomPick id={listId} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await user.click(await findByRole('button', { name: /^add$/i }))
    await user.click(getByRole('button', { name: /^cancel$/i }))

    expect(
      queryByRole('dialog', { name: /^add item$/i }),
    ).not.toBeInTheDocument()
  })

  it('Ignores close requests while add is pending.', async () => {
    mockConfirmDialog.mockImplementation(
      ({ isOpen, onClose, onConfirm, message, title }) =>
        isOpen ? (
          <div role="dialog" aria-label={title}>
            {message}
            <button type="button" onClick={onClose}>
              Force close
            </button>
            <button type="button" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        ) : null,
    )

    const user = userEvent.setup()
    const mockFetch = jest.mocked(global.fetch)

    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

      const body = JSON.parse(String(init?.body ?? '{}'))
      if (body.query?.includes('insertListItem')) {
        return new Promise(() => {})
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: listWithItems } }),
      } as unknown as Response)
    })

    const { findByRole, getByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^add$/i }))

    const dialog = getByRole('dialog', { name: /^add item$/i })
    await user.type(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
      chance.word(),
    )
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )
    await user.click(
      within(dialog).getByRole('button', { name: /^force close$/i }),
    )

    expect(dialog).toBeInTheDocument()
  })

  it('Adds an item when add is confirmed.', async () => {
    const user = userEvent.setup()
    const newItemName = chance.sentence({ words: 2 })
    const newItem = { id: chance.guid(), name: newItemName }
    const listAfterAdd = {
      ...listWithItems,
      items: [...listWithItems.items, newItem],
    }

    const mockFetch = jest.mocked(global.fetch)
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve({
            data: { list: listWithItems },
          }),
      } as unknown as Response),
    )

    const { findByRole, getByRole, queryByRole } = render(
      <RandomPick id={listId} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await findByRole('button', { name: /^add$/i })

    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

      const body = JSON.parse(String(init?.body ?? '{}'))
      if (body.query?.includes('insertListItem')) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              headers: { get: () => 'application/json' },
              json: () =>
                Promise.resolve({
                  data: { insertListItem: newItem },
                }),
            } as unknown as Response)
          }, 50)
        })
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: listAfterAdd } }),
      } as unknown as Response)
    })

    await user.click(await findByRole('button', { name: /^add$/i }))

    const dialog = getByRole('dialog', { name: /^add item$/i })
    await user.type(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
      newItemName,
    )
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    await waitFor(() => {
      expect(
        within(dialog).getByRole('button', { name: /^adding$/i }),
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      const insertCall = mockFetch.mock.calls.find(([, requestInit]) => {
        const callBody = JSON.parse(String(requestInit?.body ?? '{}'))
        return callBody.query?.includes('insertListItem')
      })
      expect(insertCall).toBeDefined()
      const insertBody = JSON.parse(
        String(insertCall?.[1]?.body ?? '{}'),
      )
      expect(insertBody.variables).toEqual({
        input: { listId, name: newItemName },
      })
    })

    await waitFor(() => {
      expect(
        queryByRole('dialog', { name: /^add item$/i }),
      ).not.toBeInTheDocument()
    })
  })

  it('Keeps the add dialog open while insert is in progress.', async () => {
    const user = userEvent.setup()
    const mockFetch = jest.mocked(global.fetch)

    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

      const body = JSON.parse(String(init?.body ?? '{}'))
      if (body.query?.includes('insertListItem')) {
        return new Promise(() => {})
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: listWithItems } }),
      } as unknown as Response)
    })

    const { findByRole, getByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^add$/i }))

    const dialog = getByRole('dialog', { name: /^add item$/i })
    await user.type(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
      chance.word(),
    )
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    await waitFor(() => {
      expect(
        within(dialog).getByRole('button', { name: /^adding$/i }),
      ).toBeInTheDocument()
    })

    await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }))
    await user.keyboard('{Escape}')

    expect(getByRole('dialog', { name: /^add item$/i })).toBeInTheDocument()
  })

  it('Does not add when the item name is blank.', async () => {
    const user = userEvent.setup()
    const mockFetch = jest.mocked(global.fetch)
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: listWithItems } }),
      } as unknown as Response),
    )

    const { findByRole, getByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^add$/i }))

    const dialog = getByRole('dialog', { name: /^add item$/i })
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    const insertCall = mockFetch.mock.calls.find(([, requestInit]) => {
      const callBody = JSON.parse(String(requestInit?.body ?? '{}'))
      return callBody.query?.includes('insertListItem')
    })
    expect(insertCall).toBeUndefined()
  })

  it('Deletes the selected item when delete is confirmed.', async () => {
    const user = userEvent.setup()
    const emptyList = mockListWithItems({ items: [] })
    const pickRandomSpy = jest.spyOn(randomUtils, 'pickRandom')

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: emptyList } }),
      } as unknown as Response),
    )

    const { findByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await findByRole('button', { name: /^refresh choice$/i })
    const callsBefore = pickRandomSpy.mock.calls.length
    await user.click(await findByRole('button', { name: /^refresh choice$/i }))

    expect(pickRandomSpy.mock.calls.length).toBe(callsBefore)
    pickRandomSpy.mockRestore()
  })

  it('Deletes the selected item when delete is confirmed.', async () => {
    const user = userEvent.setup()
    const listAfterDelete = {
      ...listWithItems,
      items: listWithItems.items.slice(1),
    }

    const mockFetch = jest.mocked(global.fetch)
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve({
            data: { list: listWithItems },
          }),
      } as unknown as Response),
    )

    const { findByRole, getByRole, queryByRole } = render(
      <RandomPick id={listId} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    await findByRole('button', { name: /^delete$/i })

    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

      const body = JSON.parse(String(init?.body ?? '{}'))
      if (body.query?.includes('deleteListItem')) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              headers: { get: () => 'application/json' },
              json: () =>
                Promise.resolve({ data: { deleteListItem: true } }),
            } as unknown as Response)
          }, 50)
        })
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: listAfterDelete } }),
      } as unknown as Response)
    })

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete item\?$/i })
    const itemSelect = within(dialog).getByRole('combobox', {
      name: /^item to delete$/i,
    })
    const itemToDeleteId = (itemSelect as HTMLSelectElement).value

    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    await waitFor(() => {
      expect(
        within(dialog).getByRole('button', { name: /^deleting$/i }),
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      const deleteCall = mockFetch.mock.calls.find(([, requestInit]) => {
        const callBody = JSON.parse(String(requestInit?.body ?? '{}'))
        return callBody.query?.includes('deleteListItem')
      })
      expect(deleteCall).toBeDefined()
      const deleteBody = JSON.parse(
        String(deleteCall?.[1]?.body ?? '{}'),
      )
      expect(deleteBody.variables).toEqual({
        input: { itemId: itemToDeleteId },
      })
    })

    await waitFor(() => {
      expect(
        queryByRole('dialog', { name: /^delete item\?$/i }),
      ).not.toBeInTheDocument()
    })
  })

  it('Keeps the delete dialog open while delete is in progress.', async () => {
    const user = userEvent.setup()
    const mockFetch = jest.mocked(global.fetch)

    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

      const body = JSON.parse(String(init?.body ?? '{}'))
      if (body.query?.includes('deleteListItem')) {
        return new Promise(() => {})
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: listWithItems } }),
      } as unknown as Response)
    })

    const { findByRole, getByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete item\?$/i })
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    await waitFor(() => {
      expect(
        within(dialog).getByRole('button', { name: /^deleting$/i }),
      ).toBeInTheDocument()
    })

    await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }))
    await user.keyboard('{Escape}')

    expect(
      getByRole('dialog', { name: /^delete item\?$/i }),
    ).toBeInTheDocument()
  })

  it('Does not delete when no delete target is selected.', async () => {
    const user = userEvent.setup()
    const resolveDeleteTargetIdSpy = jest
      .spyOn(randomPickUtils, 'resolveDeleteTargetId')
      .mockReturnValue(null)

    const mockFetch = jest.mocked(global.fetch)
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: listWithItems } }),
      } as unknown as Response),
    )

    const { findByRole, getByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete item\?$/i })
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )

    const deleteCall = mockFetch.mock.calls.find(([, requestInit]) => {
      const callBody = JSON.parse(String(requestInit?.body ?? '{}'))
      return callBody.query?.includes('deleteListItem')
    })
    expect(deleteCall).toBeUndefined()

    resolveDeleteTargetIdSpy.mockRestore()
  })

  it('Shows items in alphabetical order in the delete select.', async () => {
    const items = [
      mockListItem({ name: 'Zebra' }),
      mockListItem({ name: 'Alpha' }),
      mockListItem({ name: 'Middle' }),
    ]
    listWithItems = mockListWithItems({ id: listId, items })

    const user = userEvent.setup()
    const { findByRole, getByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const itemSelect = within(
      getByRole('dialog', { name: /^delete item\?$/i }),
    ).getByRole('combobox', { name: /^item to delete$/i })
    const options = Array.from(itemSelect.querySelectorAll('option')).map(
      (option) => option.textContent,
    )
    expect(options).toEqual(['Alpha', 'Middle', 'Zebra'])
  })

  it('Ignores close requests while delete is pending.', async () => {
    mockConfirmDialog.mockImplementation(({ isOpen, onClose, onConfirm, title }) =>
      isOpen ? (
        <div role="dialog" aria-label={title}>
          <button type="button" onClick={onClose}>
            Force close
          </button>
          <button type="button" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      ) : null,
    )

    const user = userEvent.setup()
    const mockFetch = jest.mocked(global.fetch)

    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

      const body = JSON.parse(String(init?.body ?? '{}'))
      if (body.query?.includes('deleteListItem')) {
        return new Promise(() => {})
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { list: listWithItems } }),
      } as unknown as Response)
    })

    const { findByRole, getByRole } = render(<RandomPick id={listId} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(await findByRole('button', { name: /^delete$/i }))

    const dialog = getByRole('dialog', { name: /^delete item\?$/i })
    await user.click(
      within(dialog).getByRole('button', { name: /^confirm$/i }),
    )
    await user.click(
      within(dialog).getByRole('button', { name: /^force close$/i }),
    )

    expect(dialog).toBeInTheDocument()
  })
})
