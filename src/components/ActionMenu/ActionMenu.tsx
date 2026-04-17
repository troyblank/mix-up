import type { FunctionComponent, ReactNode } from 'react'
import { ActionMenuBar, ActionMenuButton } from './ActionMenu.styles'

export type MenuAction = {
  id: string
  ariaLabel: string
  icon: ReactNode
}

export type ActionMenuProps = {
  actions: MenuAction[]
  onAction: (actionId: string) => void
}

export const ActionMenu: FunctionComponent<ActionMenuProps> = ({
  actions,
  onAction,
}) => {
  if (actions.length === 0) return null

  return (
    <ActionMenuBar aria-label={'Page actions'}>
      {actions.map(({ id, ariaLabel, icon }) => (
        <ActionMenuButton
          key={id}
          type={'button'}
          aria-label={ariaLabel}
          onClick={() => onAction(id)}
        >
          {icon}
        </ActionMenuButton>
      ))}
    </ActionMenuBar>
  )
}
