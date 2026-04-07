import Chance from 'chance'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuth } from '../../contexts'
import { HOME_PATH, LOGIN_PATH } from '../../constants/paths'
import { createAllWrappersWithoutAuth } from '../../testing/wrappers'
import { SignIn } from './SignIn'

jest.mock('../../contexts', () => ({
  ...jest.requireActual<typeof import('../../contexts')>('../../contexts'),
  useAuth: jest.fn(),
}))

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const chance = new Chance()

describe('Sign in', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    jest.mocked(useAuth).mockReturnValue({
      attemptToSignIn: jest.fn().mockResolvedValue({ isUserComplete: true }),
      authStatus: 'unauthenticated',
    })
  })

  it('Disables the submit button and shows a spinner while sign-in is in progress.', async () => {
    jest.mocked(useAuth).mockReturnValue({
      attemptToSignIn: jest.fn(() => new Promise(() => {})),
      authStatus: 'unauthenticated',
    })

    const user = userEvent.setup()
    const { getByLabelText, getByRole } = render(<SignIn />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.type(getByLabelText('Username:'), chance.name())
    await user.type(getByLabelText('Password:'), chance.word())
    await user.click(getByRole('button', { name: 'Login' }))

    const submit = getByRole('button', { name: 'Signing in' })
    expect(submit).toHaveAttribute('aria-busy', 'true')
    expect(submit).toBeDisabled()
    expect(submit.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('Shows the username and password fields.', async () => {
    const { getByText } = render(<SignIn />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    expect(getByText('Username:')).toBeInTheDocument()
    expect(getByText('Password:')).toBeInTheDocument()
  })

  it('Shows a message when username or password is missing.', async () => {
    const user = userEvent.setup()
    const { getByRole, getByText } = render(<SignIn />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.click(getByRole('button', { name: 'Login' }))

    expect(
      getByText('Please enter username and password.'),
    ).toBeInTheDocument()
  })

  it('Shows an error when sign-in fails.', async () => {
    const errorMessage = chance.sentence()

    jest.mocked(useAuth).mockReturnValue({
      attemptToSignIn: jest
        .fn()
        .mockRejectedValue(new Error(errorMessage)),
      authStatus: 'unauthenticated',
    })

    const user = userEvent.setup()
    const { getByLabelText, getByRole, findByText } = render(<SignIn />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.type(getByLabelText('Username:'), chance.name())
    await user.type(getByLabelText('Password:'), chance.word())
    await user.click(getByRole('button', { name: 'Login' }))

    expect(await findByText(`Error: ${errorMessage}`)).toBeInTheDocument()
  })

  it('Lets the user edit username and password.', async () => {
    const newUserName = chance.name()
    const newPassword = chance.word()
    const user = userEvent.setup()
    const { getByLabelText } = render(<SignIn />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    const userNameInput = getByLabelText('Username:') as HTMLInputElement
    const passwordInput = getByLabelText('Password:') as HTMLInputElement

    await user.clear(userNameInput)
    await user.clear(passwordInput)
    await user.type(userNameInput, newUserName)
    await user.type(passwordInput, newPassword)

    expect(userNameInput.value).toBe(newUserName)
    expect(passwordInput.value).toBe(newPassword)
  })

  it('Navigates home after a successful sign-in.', async () => {
    let authStatus: 'unauthenticated' | 'authenticated' = 'unauthenticated'
    const attemptToSignIn = jest.fn().mockImplementation(async () => {
      authStatus = 'authenticated'
      return { isUserComplete: true }
    })

    jest.mocked(useAuth).mockImplementation(() => ({
      attemptToSignIn,
      authStatus,
    }))

    const user = userEvent.setup()
    const { getByLabelText, getByRole } = render(<SignIn />, {
      wrapper: createAllWrappersWithoutAuth({ initialEntries: [LOGIN_PATH] }),
    })

    await user.type(getByLabelText('Username:'), chance.name())
    await user.type(getByLabelText('Password:'), chance.word())
    await user.click(getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(attemptToSignIn).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith(HOME_PATH, { replace: true })
    })
  })

  it('Shows a message when the user is not valid.', async () => {
    jest.mocked(useAuth).mockReturnValue({
      attemptToSignIn: jest.fn().mockResolvedValue({ isUserComplete: false }),
      authStatus: 'unauthenticated',
    })

    const user = userEvent.setup()
    const { getByLabelText, getByRole, getByText } = render(<SignIn />, {
      wrapper: createAllWrappersWithoutAuth(),
    })

    await user.type(getByLabelText('Username:'), chance.name())
    await user.type(getByLabelText('Password:'), chance.word())
    await user.click(getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(getByText('User is invalid.')).toBeInTheDocument()
    })
  })

  it('Redirects to home when already authenticated on the login page.', async () => {
    jest.mocked(useAuth).mockReturnValue({
      attemptToSignIn: jest.fn(),
      authStatus: 'authenticated',
    })

    render(<SignIn />, {
      wrapper: createAllWrappersWithoutAuth({ initialEntries: [LOGIN_PATH] }),
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(HOME_PATH, { replace: true })
    })
  })
})
