import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { API_URL } from '../api/graphql'
import { createWrappersWithoutRouter } from '../testing/wrappers'
import { ListPage } from './ListPage'

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/list/:listId" element={<ListPage />} />
      </Routes>
    </MemoryRouter>,
    { wrapper: createWrappersWithoutRouter() },
  )
}

describe('ListPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url !== API_URL) return Promise.reject(new Error('Unknown URL'))
      const body = init?.body ? JSON.parse(String(init.body)) : {}
      const id = body.variables?.id
      const listData: Record<string, unknown> = {
        abc123: { id: 'abc123', name: 'Test', items: [{ id: '1', name: 'Item' }] },
        'xyz-789': { id: 'xyz-789', name: 'Other', items: [] },
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve({
            data: { list: listData[id] ?? { id, name: 'List', items: [{ id: '1', name: 'Item' }] } },
          }),
      } as unknown as Response)
    })
  })

  it('Renders the list page with RandomPick.', async () => {
    renderWithRoute('/list/abc123')
    expect(await screen.findByText(/Item/i)).toBeInTheDocument()
  })

  it('Renders empty list message when list has no items.', async () => {
    renderWithRoute('/list/xyz-789')
    expect(await screen.findByText(/this list has no items/i)).toBeInTheDocument()
  })
})
