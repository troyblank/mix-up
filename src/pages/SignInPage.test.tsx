import { render } from '@testing-library/react'
import { createAllWrappers } from '../testing/wrappers'
import { SignInPage } from './SignInPage'

describe('SignInPage', () => {
  it('Shows the sign-in form.', () => {
    const { getByText } = render(<SignInPage />, {
      wrapper: createAllWrappers(),
    })

    expect(getByText('Username:')).toBeInTheDocument()
    expect(getByText('Password:')).toBeInTheDocument()
  })
})
