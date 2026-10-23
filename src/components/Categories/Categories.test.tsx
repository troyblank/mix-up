import { fetchAuthSession } from 'aws-amplify/auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { API_URL } from '../../api/graphql'
import { listsQueryKey } from '../../hooks/useLists'
import { mockList } from '../../testing/mocks/lists'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { theme } from '../../theme'
import { ConfirmDialog } from '../ConfirmDialog'
import { Categories } from './Categories'

jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(),
}))

jest.mock('../ConfirmDialog', () => {
  const actual = jest.requireActual('../ConfirmDialog')
  return {
    ...actual,
    ConfirmDialog: jest.fn((props) => actual.ConfirmDialog(props)),
  }
})

const mockFetchAuthSession = jest.mocked(fetchAuthSession)
const mockConfirmDialog = jest.mocked(ConfirmDialog)

describe('Categories', () => {
  const lists = [mockList(), mockList(), mockList()]

  beforeEach(() => {
    mockConfirmDialog.mockImplementation(
      jest.requireActual('../ConfirmDialog').ConfirmDialog,
    )
    mockFetchAuthSession.mockResolvedValue({
      tokens: { idToken: { toString: () => 'test-id-token' } },
    } as Awaited<ReturnType<typeof fetchAuthSession>>)
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === API_URL) {
        return Promise.resolve({
          ok: true,
          headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
          json: () => Promise.resolve({ data: { lists } }),
        } as unknown as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  it('Renders a list of links from the API.', async () => {
    render(<Categories />, { wrapper: createAllWrappersWithoutAuth() })
    for (const list of lists) {
      expect(await screen.findByRole('link', { name: list.name })).toBeInTheDocument()
    }
  })

  it('Renders an alert when the API fails.', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ message: 'Server error' }),
    } as unknown as Response)

    render(<Categories />, { wrapper: createAllWrappersWithoutAuth() })
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/failed to load lists/i)
  })

  it('Renders Unknown error when the error is not an Error instance.', async () => {
    jest.mocked(global.fetch).mockImplementationOnce(() => Promise.reject('network failure'))

    render(<Categories />, { wrapper: createAllWrappersWithoutAuth() })
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/Unknown error/)
  })

  it('Renders nothing when lists is empty.', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ data: { lists: [] } }),
      } as unknown as Response),
    )

    const { getByText } = render(<Categories />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(getByText('Loading lists')).toBeInTheDocument()
    await waitForElementToBeRemoved(() => getByText('Loading lists'))
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('Shows an add button beside each list.', async () => {
    const { findByRole } = render(<Categories />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    for (const list of lists) {
      const link = await findByRole('link', { name: list.name })
      const addButton = await findByRole('button', {
        name: `Add item to ${list.name}`,
      })
      expect(addButton).toBeInTheDocument()
      expect(link.parentElement).toBe(addButton.parentElement)
    }
  })

  it('Opens the add item dialog for the list beside the button.', async () => {
    const user = userEvent.setup()
    const list = lists[1]
    const { findByRole, getByRole, queryByRole } = render(<Categories />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(
      await findByRole('button', { name: `Add item to ${list.name}` }),
    )

    const dialog = getByRole('dialog', { name: `Add item to ${list.name}` })
    expect(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }))
    expect(
      queryByRole('dialog', { name: `Add item to ${list.name}` }),
    ).not.toBeInTheDocument()
  })

  it('Adds an item to the list beside the button you press.', async () => {
    const user = userEvent.setup()
    const list = lists[1]
    const itemName = 'Late night snack'
    const mockFetch = jest.mocked(global.fetch)
    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

      const body = JSON.parse(String(init?.body ?? '{}'))
      if (String(body.query).includes('insertListItem')) {
        return Promise.resolve({
          ok: true,
          headers: {
            get: (name: string) =>
              name === 'content-type' ? 'application/json' : null,
          },
          json: () =>
            Promise.resolve({
              data: { insertListItem: { id: 'item-1', name: itemName } },
            }),
        } as unknown as Response)
      }

      return Promise.resolve({
        ok: true,
        headers: {
          get: (name: string) =>
            name === 'content-type' ? 'application/json' : null,
        },
        json: () => Promise.resolve({ data: { lists } }),
      } as unknown as Response)
    })

    const { findByRole, getByRole, queryByRole } = render(<Categories />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(
      await findByRole('button', { name: `Add item to ${list.name}` }),
    )

    const dialog = getByRole('dialog', { name: `Add item to ${list.name}` })
    await user.type(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
      itemName,
    )
    await user.click(within(dialog).getByRole('button', { name: /^confirm$/i }))

    await waitFor(() => {
      const insertCall = mockFetch.mock.calls.find(([, requestInit]) => {
        const callBody = JSON.parse(String(requestInit?.body ?? '{}'))
        return String(callBody.query).includes('insertListItem')
      })
      expect(insertCall).toBeDefined()
      const insertBody = JSON.parse(String(insertCall?.[1]?.body ?? '{}'))
      expect(insertBody.variables).toEqual({
        input: { listId: list.id, name: itemName },
      })
    })

    await waitFor(() => {
      expect(
        queryByRole('dialog', { name: `Add item to ${list.name}` }),
      ).not.toBeInTheDocument()
    })
  })

  it('Keeps the add item dialog open when the name is blank.', async () => {
    const user = userEvent.setup()
    const list = lists[0]
    const mockFetch = jest.mocked(global.fetch)
    const { findByRole, getByRole } = render(<Categories />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(
      await findByRole('button', { name: `Add item to ${list.name}` }),
    )

    const dialog = getByRole('dialog', { name: `Add item to ${list.name}` })
    const itemName = within(dialog).getByRole('textbox', { name: /^item name$/i })
    await user.type(itemName, '   ')
    await user.keyboard('{Enter}')
    await user.click(within(dialog).getByRole('button', { name: /^confirm$/i }))

    expect(dialog).toBeInTheDocument()
    const insertCall = mockFetch.mock.calls.find(([, requestInit]) => {
      const callBody = JSON.parse(String(requestInit?.body ?? '{}'))
      return String(callBody.query).includes('insertListItem')
    })
    expect(insertCall).toBeUndefined()
  })

  it('Adds an item when you press Enter.', async () => {
    const user = userEvent.setup()
    const list = lists[0]
    const itemName = 'Weeknight pasta'
    const mockFetch = jest.mocked(global.fetch)
    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

      const body = JSON.parse(String(init?.body ?? '{}'))
      if (String(body.query).includes('insertListItem')) {
        return Promise.resolve({
          ok: true,
          headers: {
            get: (name: string) =>
              name === 'content-type' ? 'application/json' : null,
          },
          json: () =>
            Promise.resolve({
              data: { insertListItem: { id: 'item-2', name: itemName } },
            }),
        } as unknown as Response)
      }

      return Promise.resolve({
        ok: true,
        headers: {
          get: (name: string) =>
            name === 'content-type' ? 'application/json' : null,
        },
        json: () => Promise.resolve({ data: { lists } }),
      } as unknown as Response)
    })

    const { findByRole, getByRole, queryByRole } = render(<Categories />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(
      await findByRole('button', { name: `Add item to ${list.name}` }),
    )
    const dialog = getByRole('dialog', { name: `Add item to ${list.name}` })
    await user.type(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
      itemName,
    )
    await user.keyboard('{Enter}')

    await waitFor(() => {
      const insertCall = mockFetch.mock.calls.find(([, requestInit]) => {
        const callBody = JSON.parse(String(requestInit?.body ?? '{}'))
        return String(callBody.query).includes('insertListItem')
      })
      expect(insertCall).toBeDefined()
      const insertBody = JSON.parse(String(insertCall?.[1]?.body ?? '{}'))
      expect(insertBody.variables).toEqual({
        input: { listId: list.id, name: itemName },
      })
    })

    await waitFor(() => {
      expect(
        queryByRole('dialog', { name: `Add item to ${list.name}` }),
      ).not.toBeInTheDocument()
    })
  })

  it('Keeps the add dialog open and shows an error when adding fails.', async () => {
    const user = userEvent.setup()
    const list = lists[0]
    const itemName = 'Late night snack'
    const mockFetch = jest.mocked(global.fetch)
    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

      const body = JSON.parse(String(init?.body ?? '{}'))
      if (String(body.query).includes('insertListItem')) {
        return Promise.reject(new Error('Server unavailable'))
      }

      return Promise.resolve({
        ok: true,
        headers: {
          get: (name: string) =>
            name === 'content-type' ? 'application/json' : null,
        },
        json: () => Promise.resolve({ data: { lists } }),
      } as unknown as Response)
    })

    const { findByRole, getByRole } = render(<Categories />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(
      await findByRole('button', { name: `Add item to ${list.name}` }),
    )
    const dialog = getByRole('dialog', { name: `Add item to ${list.name}` })
    await user.type(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
      itemName,
    )
    await user.click(within(dialog).getByRole('button', { name: /^confirm$/i }))

    const alert = await within(dialog).findByRole('alert')
    expect(alert).toHaveTextContent(/failed to add item/i)
    expect(alert).toHaveTextContent(/server unavailable/i)
    expect(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
    ).toHaveValue(itemName)
    expect(dialog).toBeInTheDocument()

    await user.type(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
      '!',
    )
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument()
  })

  it('Ignores close requests while an item is being added.', async () => {
    mockConfirmDialog.mockImplementation(
      ({ isOpen, onClose, onConfirm, message, title }) =>
        isOpen ? (
          <div role={'dialog'} aria-label={title}>
            {message}
            <button type={'button'} onClick={onClose}>
              Force close
            </button>
            <button type={'button'} onClick={onConfirm}>
              Confirm
            </button>
          </div>
        ) : null,
    )

    const user = userEvent.setup()
    const list = lists[0]
    const mockFetch = jest.mocked(global.fetch)
    mockFetch.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

      const body = JSON.parse(String(init?.body ?? '{}'))
      if (String(body.query).includes('insertListItem')) {
        return new Promise(() => {})
      }

      return Promise.resolve({
        ok: true,
        headers: {
          get: (name: string) =>
            name === 'content-type' ? 'application/json' : null,
        },
        json: () => Promise.resolve({ data: { lists } }),
      } as unknown as Response)
    })

    const { findByRole, getByRole } = render(<Categories />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(
      await findByRole('button', { name: `Add item to ${list.name}` }),
    )
    const dialog = getByRole('dialog', { name: `Add item to ${list.name}` })
    await user.type(
      within(dialog).getByRole('textbox', { name: /^item name$/i }),
      'Soup',
    )
    await user.click(within(dialog).getByRole('button', { name: /^confirm$/i }))
    await user.click(within(dialog).getByRole('button', { name: /^force close$/i }))

    expect(dialog).toBeInTheDocument()
  })

  it('Keeps the list name on the add dialog when that list disappears.', async () => {
    const user = userEvent.setup()
    const dinnerA = mockList({ name: 'Dinner' })
    const dinnerB = mockList({ name: 'Dinner' })
    const breakfast = mockList({ name: 'Breakfast' })
    const jsonHeaders = {
      get: (name: string) =>
        name === 'content-type' ? 'application/json' : null,
    }
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: jsonHeaders,
        json: () =>
          Promise.resolve({ data: { lists: [dinnerA, dinnerB, breakfast] } }),
      } as unknown as Response),
    )

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const { findByRole, getByRole, queryByRole } = render(<Categories />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <MemoryRouter>{children}</MemoryRouter>
          </ThemeProvider>
        </QueryClientProvider>
      ),
    })

    await user.click(
      await findByRole('button', { name: 'Add item to Dinner (2)' }),
    )
    expect(
      getByRole('dialog', { name: 'Add item to Dinner (2)' }),
    ).toBeInTheDocument()

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: jsonHeaders,
        json: () => Promise.resolve({ data: { lists: [breakfast] } }),
      } as unknown as Response),
    )
    await queryClient.invalidateQueries({ queryKey: listsQueryKey })

    await waitFor(() => {
      expect(
        queryByRole('dialog', { name: 'Add item to Dinner (2)' }),
      ).not.toBeInTheDocument()
    })
    expect(getByRole('dialog', { name: 'Add item to Dinner' })).toBeInTheDocument()
  })

  it('Gives duplicate list names distinct add buttons.', async () => {
    const user = userEvent.setup()
    const sharedName = 'Dinner'
    const duplicateLists = [
      mockList({ name: sharedName }),
      mockList({ name: sharedName }),
    ]
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: {
          get: (name: string) =>
            name === 'content-type' ? 'application/json' : null,
        },
        json: () => Promise.resolve({ data: { lists: duplicateLists } }),
      } as unknown as Response),
    )

    const { findByRole, getByRole } = render(<Categories />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(
      await findByRole('button', { name: 'Add item to Dinner (1)' }),
    ).toBeInTheDocument()
    const secondAddButton = await findByRole('button', {
      name: 'Add item to Dinner (2)',
    })

    await user.click(secondAddButton)
    expect(
      getByRole('dialog', { name: 'Add item to Dinner (2)' }),
    ).toBeInTheDocument()
  })
})
