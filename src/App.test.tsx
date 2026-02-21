import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'
import { mockList } from './testing/mocks/lists'
import { API_URL } from './api/graphql'

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  )
}

function createFetchMock() {
  return jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))

    const body = init?.body ? JSON.parse(String(init.body)) : {}
    const isListQuery = body.variables?.id != null

    if (isListQuery) {
      const id = body.variables.id
      const listData: Record<string, unknown> = {
        1: { id: '1', name: 'TV Shows', items: [{ id: '1', name: 'Show A' }] },
        abc123: { id: 'abc123', name: 'Test List', items: [{ id: '1', name: 'Item 1' }] },
      }
      return Promise.resolve({
        ok: true,
        headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
        json: () =>
          Promise.resolve({
            data: { list: listData[id] ?? null },
          }),
      } as unknown as Response)
    }

    return Promise.resolve({
      ok: true,
      headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
      json: () =>
        Promise.resolve({
          data: { lists: [mockList({ id: '1', name: 'My List' })] },
        }),
    } as unknown as Response)
  })
}

describe('App', () => {
  beforeEach(() => {
    global.fetch = createFetchMock()
  })

  it('Renders the home page at /.', async () => {
    renderApp('/')
    expect(screen.getByRole('heading', { name: /mix up/i })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'My List' })).toBeInTheDocument()
  })

  it('Renders the list page at /list/:listId.', async () => {
    renderApp('/list/abc123')
    expect(await screen.findByText(/Item 1/i)).toBeInTheDocument()
  })

  it('Navigates to list page when clicking a list link.', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const link = await screen.findByRole('link', { name: 'My List' })
    await user.click(link)
    expect(await screen.findByText(/Show A/i)).toBeInTheDocument()
  })
})
