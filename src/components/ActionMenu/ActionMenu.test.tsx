import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chance from 'chance'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { ActionMenu } from './ActionMenu'
import { DeleteIcon } from '../icons'

const chance = new Chance()

describe('Action Menu', () => {
  it('Renders nothing when there are no actions.', () => {
    const { container } = render(<ActionMenu actions={[]} onAction={jest.fn()} />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(container.firstChild).toBeNull()
  })

  it('Invokes an action handler with the action id when a control is activated.', async () => {
    const user = userEvent.setup()
    const onAction = jest.fn()
    const actionId = chance.guid()
    const ariaLabel = chance.word()

    const { getByRole } = render(
      <ActionMenu
        actions={[
          {
            id: actionId,
            ariaLabel,
            icon: <DeleteIcon />,
          },
        ]}
        onAction={onAction}
      />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    const btn = getByRole('button', { name: ariaLabel })

    await user.click(btn)

    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onAction).toHaveBeenCalledWith(actionId)
  })

  it('Renders every action provided.', () => {
    const numberOfActions = chance.integer({ min: 1, max: 5 })
    const labels = chance.unique(chance.word, numberOfActions)
    const actions = labels.map((label) => ({
      id: chance.guid(),
      ariaLabel: label,
      icon: <span>{chance.character({ pool: '123456789' })}</span>,
    }))

    const { getAllByRole, getByRole } = render(
      <ActionMenu actions={actions} onAction={jest.fn()} />,
      { wrapper: createAllWrappersWithoutAuth() },
    )

    expect(getAllByRole('button')).toHaveLength(numberOfActions)
    expect(getByRole('button', { name: labels[0] })).toBeInTheDocument()
  })
})
