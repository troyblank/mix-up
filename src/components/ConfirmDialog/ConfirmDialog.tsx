import type { FunctionComponent, ReactNode } from 'react'
import { useId } from 'react'

import { DangerButton } from '../AppButton'
import { Dialog, DialogTitle } from '../Dialog'
import {
  Actions,
  SecondaryButton,
} from '../RandomNumberRangeDialog/RandomNumberRangeDialog.styles'
import { Message } from './ConfirmDialog.styles'

export type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: ReactNode
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmDialog: FunctionComponent<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
}) => {
  const titleId = useId()

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy={titleId}
      backdropTestId={'confirm-dialog-backdrop'}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <Message>{message}</Message>
      <Actions>
      <DangerButton
          type={'button'}
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          Confirm
        </DangerButton>
        <SecondaryButton type={'button'} onClick={onClose}>
          Cancel
        </SecondaryButton>
      </Actions>
    </Dialog>
  )
}
