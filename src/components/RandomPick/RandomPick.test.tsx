import type { ListWithItems } from '../../api/graphql'
import { render, waitForElementToBeRemoved } from '@testing-library/react'
import { API_URL } from '../../api/graphql'
import { mockListWithItems } from '../../testing/mocks/lists'
import { createAllWrappers } from '../../testing/wrappers'
import { RandomPick } from './RandomPick'

describe('RandomPick', () => {
  let listWithItems: ReturnType<typeof mockListWithItems>

  beforeEach(() => {
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
      wrapper: createAllWrappers(),
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('Shows loading state.', () => {
    const { getByText } = render(<RandomPick id={'1'} />, { wrapper: createAllWrappers() })
    expect(getByText('Loading pick')).toBeInTheDocument()
  })

  it('Shows a random item when list loads.', async () => {
    const { findByText } = render(<RandomPick id={'1'} />, { wrapper: createAllWrappers() })
    const itemNames = listWithItems.items.map((i) => i.name)
    const pickedElement = await findByText((content) =>
      itemNames.some((name) => content === name),
    )
    expect(pickedElement).toBeInTheDocument()
  })

  it('Shows error when API fails.', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ message: 'Server error' }),
    } as unknown as Response)

    const { findByRole } = render(<RandomPick id={'1'} />, { wrapper: createAllWrappers() })
    const alert = await findByRole('alert')
    expect(alert).toHaveTextContent(/failed to load pick/i)
  })

  it('Handles item with undefined name.', async () => {
    const listWithItemNoName = {
      ...mockListWithItems(),
      items: [{ id: '1' }],
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

    const { findByRole } = render(<RandomPick id={'1'} />, { wrapper: createAllWrappers() })
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

    const { container, getByText } = render(<RandomPick id={'1'} />, {
      wrapper: createAllWrappers(),
    })
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

    const { findByText } = render(<RandomPick id={'1'} />, { wrapper: createAllWrappers() })
    expect(await findByText(/this list has no items/i)).toBeInTheDocument()
  })
})
