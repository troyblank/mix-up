import Chance from 'chance'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createWrappersWithoutRouter } from '../testing/wrappers'
import { mockListWithItems } from '../testing/mocks/lists'
import { useList } from '../hooks/useList'
import { ListPage } from './ListPage'

jest.mock('../hooks/useList')

const chance = new Chance()
const mockUseList = jest.mocked(useList)

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={'/list/:listId'} element={<ListPage />} />
      </Routes>
    </MemoryRouter>,
    { wrapper: createWrappersWithoutRouter() },
  )
}

describe('ListPage', () => {
  const listWithItem = mockListWithItems({
    id: 'abc123',
    name: chance.sentence({ words: 2 }).replace(/\.$/, ''),
    type: 'pick',
    items: [{ id: '1', name: 'Item' }],
  })
  const emptyList = mockListWithItems({
    id: 'xyz-789',
    name: chance.sentence({ words: 2 }).replace(/\.$/, ''),
    type: 'pick',
    items: [],
  })
  const listTypeList = mockListWithItems({
    id: '3',
    name: chance.sentence({ words: 2 }).replace(/\.$/, ''),
    type: 'list',
    items: [{ id: '1', name: chance.word() }],
  })

  beforeEach(() => {
    mockUseList.mockImplementation((id) => {
      const data =
        id === 'abc123'
          ? listWithItem
          : id === 'xyz-789'
            ? emptyList
            : id === '3'
              ? listTypeList
              : listWithItem
      return {
        data,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useList>
    })
  })

  it('Renders the list page with RandomPick.', async () => {
    const { findByText } = renderWithRoute('/list/abc123')
    expect(await findByText(/Item/i)).toBeInTheDocument()
  })

  it('Renders empty list message when list has no items.', async () => {
    const { findByText } = renderWithRoute('/list/xyz-789')
    expect(await findByText(/this list has no items/i)).toBeInTheDocument()
  })

  it('Renders RandomList when list type is list.', () => {
    const { queryByRole } = renderWithRoute('/list/3')
    expect(queryByRole('heading')).not.toBeInTheDocument()
  })
})
