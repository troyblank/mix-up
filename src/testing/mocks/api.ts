export const mockJsonResponse = (
  ok: boolean,
  data: unknown,
  status = ok ? 200 : 400,
  url = '',
) => ({
  ok,
  status,
  url,
  headers: { get: (name: string) => (name === 'content-type' ? 'application/json' : null) },
  json: () => Promise.resolve(data),
}) as Response
