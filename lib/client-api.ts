/** Tiny fetch wrapper for the admin UI. Throws ApiClientError with the server's message. */
export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
  }
}

export async function api<T>(url: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init
  const res = await fetch(url, {
    ...rest,
    headers: json !== undefined ? { 'content-type': 'application/json', ...headers } : headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: 'no-store',
  })
  const body = await res.json().catch(() => null)
  if (res.status === 401 && typeof window !== 'undefined' && !url.includes('/auth/login')) {
    // Session expired: a full reload to the login page is intended here.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`
  }
  if (!res.ok) {
    const err = body?.error
    const details = Array.isArray(err?.details)
      ? err.details
          .map((d: { path?: string; message?: string }) =>
            d.path ? `${d.path}: ${d.message}` : d.message,
          )
          .join('; ')
      : ''
    throw new ApiClientError(
      res.status,
      err?.code ?? 'ERROR',
      `${err?.message ?? `Request failed (${res.status})`}${details ? ` — ${details}` : ''}`,
      err?.details,
    )
  }
  return body?.data as T
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong'
}
