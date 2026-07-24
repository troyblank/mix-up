import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createAllWrappersWithoutAuth } from '../testing/wrappers'
import { HomePage } from './HomePage'

describe('HomePage', () => {
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
})
