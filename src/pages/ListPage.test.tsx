import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ListPage } from './ListPage'

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/list/:listId" element={<ListPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ListPage', () => {
  it('renders the list ID from the URL', () => {
    renderWithRoute('/list/abc123')
    expect(screen.getByRole('heading', { name: /list/i })).toBeInTheDocument()
    expect(screen.getByText(/list id: abc123/i)).toBeInTheDocument()
  })

  it('renders a different list ID', () => {
    renderWithRoute('/list/xyz-789')
    expect(screen.getByText(/list id: xyz-789/i)).toBeInTheDocument()
  })
})
