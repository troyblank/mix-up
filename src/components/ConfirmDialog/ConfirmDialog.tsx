import type { FunctionComponent, ReactNode } from 'react'
import { useId } from 'react'

import { SecondaryButton } from '../AppButton'
import { Actions, Dialog, DialogTitle } from '../Dialog'
import {
  ConfirmButtonSpinner,
  ConfirmDangerButton,
  ConfirmSuccessButton,
  Message,
} from './ConfirmDialog.styles'

export type ConfirmDialogVariant = 'danger' | 'success'

export type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: ReactNode
  onClose: () => void
  onConfirm: () => void
  isConfirmPending?: boolean
  confirmPendingAriaLabel?: string
  confirmVariant?: ConfirmDialogVariant
  closeOnConfirm?: boolean
}

export const ConfirmDialog: FunctionComponent<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  isConfirmPending = false,
  confirmPendingAriaLabel = 'Deleting',
  confirmVariant = 'danger',
  closeOnConfirm = true,
}) => {
  const titleId = useId()
  const ConfirmButton =
    confirmVariant === 'success' ? ConfirmSuccessButton : ConfirmDangerButton

  const handleClose = () => {
    if (!isConfirmPending) {
      onClose()
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabelledBy={titleId}
      backdropTestId={'confirm-dialog-backdrop'}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <Message>{message}</Message>
      <Actions>
        <ConfirmButton
          type={'button'}
          disabled={isConfirmPending}
          aria-busy={isConfirmPending}
          aria-label={isConfirmPending ? confirmPendingAriaLabel : undefined}
          onClick={() => {
            onConfirm()
            if (closeOnConfirm && !isConfirmPending) {
              onClose()
            }
          }}
        >
          {isConfirmPending ? (
            <ConfirmButtonSpinner aria-hidden={'true'} />
          ) : (
            'Confirm'
          )}
        </ConfirmButton>
        <SecondaryButton
          type={'button'}
          disabled={isConfirmPending}
          onClick={handleClose}
        >
          Cancel
        </SecondaryButton>
      </Actions>
    </Dialog>
  )
}
