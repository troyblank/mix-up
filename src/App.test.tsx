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

describe('App', () => {
  beforeEach(() => {
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === API_URL) {
        return Promise.resolve({
          ok: true,
          headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
          json: () =>
            Promise.resolve({
              data: { lists: [mockList({ id: '1', name: 'My List' })] },
            }),
        } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  it('renders the home page at /', async () => {
    renderApp('/')
    expect(screen.getByRole('heading', { name: /mix up/i })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'My List' })).toBeInTheDocument()
  })

  it('renders the list page at /list/:listId', () => {
    renderApp('/list/abc123')
    expect(screen.getByRole('heading', { name: /list/i })).toBeInTheDocument()
    expect(screen.getByText(/list id: abc123/i)).toBeInTheDocument()
  })

  it('navigates to list page when clicking a list link', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const link = await screen.findByRole('link', { name: 'My List' })
    await user.click(link)
    expect(screen.getByRole('heading', { name: /list/i })).toBeInTheDocument()
    expect(screen.getByText(/list id: 1/i)).toBeInTheDocument()
  })
})
