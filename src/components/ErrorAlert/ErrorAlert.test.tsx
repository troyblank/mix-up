import type { ComponentProps } from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../../theme'
import { ErrorAlert } from './ErrorAlert'

function renderErrorAlert(props: ComponentProps<typeof ErrorAlert>) {
  return render(
    <ThemeProvider theme={theme}>
      <ErrorAlert {...props} />
    </ThemeProvider>,
  )
}

describe('ErrorAlert', () => {
  it('Shows error message when error is an Error instance.', () => {
    const { getByRole } = renderErrorAlert({
      message: 'Failed to load',
      error: new Error('Server error'),
    })
    expect(getByRole('alert')).toHaveTextContent('Failed to load: Server error')
  })

  it('Shows Unknown error when error is not an Error instance.', () => {
    const { getByRole } = renderErrorAlert({
      message: 'Failed to load',
      error: 'network failure',
    })
    expect(getByRole('alert')).toHaveTextContent('Failed to load: Unknown error')
  })
})
