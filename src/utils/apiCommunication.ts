export const ERROR_DELIMITER = ' <<<<<<HUMAN|DETAILED>>>>> '
export const GENERAL_ERROR_HEADING = 'Something went wrong...'
export const INTERNAL_SERVICE_ERROR_HEADING =
  'There seems to be an Internal Service Error.'

export async function getAndValidateResponseData<T = unknown>(
  response: Response,
  errorMessage: string = GENERAL_ERROR_HEADING,
): Promise<{ response: Response; data: T }> {
  const { ok, status, url } = response
  let data: T = {} as T

  if (response.headers.get('content-type')?.includes('application/json')) {
    data = (await response.json()) as T
  }

  if (!ok) {
    const humanError =
      status === 500 ? INTERNAL_SERVICE_ERROR_HEADING : errorMessage
    const computerError = (data as { message?: string })?.message

    if (!computerError) {
      throw new Error(humanError)
    }

    throw new Error(`${humanError}${ERROR_DELIMITER}${computerError} (${url})`)
  }

  return { response, data }
}
