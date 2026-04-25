import type { FunctionComponent, ReactNode } from 'react'
import { useEffect } from 'react'

import { Backdrop, Overlay, Panel } from './Dialog.styles'

export type DialogProps = {
  isOpen: boolean
  onClose: () => void
  /** Pass the same id you set on `DialogTitle` for `aria-labelledby`. */
  ariaLabelledBy: string
  backdropTestId?: string
  children: ReactNode
}

export const Dialog: FunctionComponent<DialogProps> = ({
  isOpen,
  onClose,
  ariaLabelledBy,
  backdropTestId,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <Overlay role={'presentation'}>
      <Backdrop
        aria-hidden={true}
        data-testid={backdropTestId}
        onClick={onClose}
      />
      <Panel
        role={'dialog'}
        aria-modal={'true'}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </Panel>
    </Overlay>
  )
}
