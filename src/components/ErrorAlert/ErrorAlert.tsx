import type { FunctionComponent } from 'react'

import { Alert } from './ErrorAlert.styles'

type ErrorAlertProps = {
  message: string
  error: unknown
}

export const ErrorAlert: FunctionComponent<ErrorAlertProps> = ({ message, error }) => (
  <Alert role={'alert'}>
    {message}: {error instanceof Error ? error.message : 'Unknown error'}
  </Alert>
)
