import type { FunctionComponent } from 'react'

type ErrorAlertProps = {
  message: string
  error: unknown
}

export const ErrorAlert: FunctionComponent<ErrorAlertProps> = ({ message, error }) => (
  <p role="alert">
    {message}: {error instanceof Error ? error.message : 'Unknown error'}
  </p>
)
