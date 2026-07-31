import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { API_URL } from '../api/graphql'
import { mockList } from '../testing/mocks/lists'
import { createAllWrappersWithoutAuth } from '../testing/wrappers'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  const lists = [mockList({ name: 'Beta' }), mockList({ name: 'Alpha' })]

  beforeEach(() => {
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === API_URL) {
        return Promise.resolve({
          ok: true,
          headers: {
            get: (name: string) =>
              name === 'content-type' ? 'application/json' : null,
          },
          json: () => Promise.resolve({ data: { lists } }),
        } as unknown as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  it('Renders the title.', async () => {
    const { findByRole } = render(<HomePage />, {
      wrapper: createAllWrappersWithoutAuth(),
    })
    expect(
      await findByRole('heading', { name: /mix up/i }),
    ).toBeInTheDocument()
  })

  it('Opens the create list dialog when add is activated.', async () => {
    const user = userEvent.setup()
    const { findByRole, getByRole, queryByRole } = render(<HomePage />, {
      wrapper: createAllWrappersWithoutAuth(),
    })
    await user.click(await findByRole('button', { name: /^add$/i }))
    expect(getByRole('dialog', { name: 'New list' })).toBeInTheDocument()

    await user.click(getByRole('button', { name: /^cancel$/i }))
    expect(
      queryByRole('dialog', { name: 'New list' }),
    ).not.toBeInTheDocument()
  })

  it('Shows the random from range action and opens the number range dialog.', async () => {
    const user = userEvent.setup()
    const { findByRole, getByRole, queryByRole } = render(<HomePage />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(
      await findByRole('button', { name: /^random from range$/i }),
    ).toBeInTheDocument()

    await user.click(
      await findByRole('button', { name: /^random from range$/i }),
    )
    expect(
      getByRole('dialog', { name: 'Random number' }),
    ).toBeInTheDocument()

    await user.click(getByRole('button', { name: /^close$/i }))
    expect(
      queryByRole('dialog', { name: 'Random number' }),
    ).not.toBeInTheDocument()
  })

  it('Shows the delete action and opens the delete list dialog.', async () => {
    const user = userEvent.setup()
    const { findByRole, getByRole, queryByRole } = render(<HomePage />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(await findByRole('button', { name: /^delete$/i })).toBeInTheDocument()

    await user.click(await findByRole('button', { name: /^delete$/i }))
    const dialog = getByRole('dialog', { name: /^delete list\?$/i })
    expect(dialog).toBeInTheDocument()

    const listSelect = getByRole('combobox', { name: /^list to delete$/i })
    expect(listSelect).toHaveValue(lists[1].id)

    const options = Array.from(listSelect.querySelectorAll('option')).map(
      (option) => option.textContent,
    )
    expect(options).toEqual(['Alpha', 'Beta'])

    await user.click(getByRole('button', { name: /^cancel$/i }))
    expect(
      queryByRole('dialog', { name: /^delete list\?$/i }),
    ).not.toBeInTheDocument()
  })
})
