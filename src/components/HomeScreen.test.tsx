import { render, screen } from '@testing-library/react'
import { API_URL } from '../api/graphql'
import { mockList } from '../testing/mocks/lists'
import { createAllWrappers } from '../testing/wrappers'
import { HomeScreen } from './HomeScreen'

describe('HomeScreen', () => {
  const lists = [mockList(), mockList(), mockList()]

  beforeEach(() => {
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === API_URL) {
        return Promise.resolve({
          ok: true,
          headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
          json: () =>
            Promise.resolve({
              data: { lists },
            }),
        } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  it('Renders the title.', () => {
    render(<HomeScreen />, { wrapper: createAllWrappers() })
    expect(screen.getByRole('heading', { name: /mix up/i })).toBeInTheDocument()
  })

  it('Renders a list of buttons from the API.', async () => {
    render(<HomeScreen />, { wrapper: createAllWrappers() })
    for (const list of lists) {
      expect(await screen.findByRole('button', { name: list.name })).toBeInTheDocument()
    }
  })

  it('Renders an alert when the API fails.', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ message: 'Server error' }),
    } as unknown as Response)

    render(<HomeScreen />, { wrapper: createAllWrappers() })

    const alert = await screen.findByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent(/failed to load lists/i)
  })

  it('Renders Unknown error when the error is not an Error instance.', async () => {
    jest.mocked(global.fetch).mockImplementationOnce(() =>
      Promise.reject('network failure'),
    )

    render(<HomeScreen />, { wrapper: createAllWrappers() })

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/Unknown error/)
  })
})
