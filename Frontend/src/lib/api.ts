type ProblemDetails = {
  title?: string
  detail?: string
  errorCode?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly errorCode: string | null
  readonly errors: Record<string, string[]>

  constructor(status: number, problem: ProblemDetails) {
    super(
      problem.detail ??
        problem.title ??
        'No fue posible completar la solicitud.',
    )
    this.name = 'ApiError'
    this.status = status
    this.errorCode = problem.errorCode ?? null
    this.errors = problem.errors ?? {}
  }
}

const apiBaseUrl = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:5258/api'
).replace(/\/$/, '')

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    let problem: ProblemDetails = {}

    try {
      problem = (await response.json()) as ProblemDetails
    } catch {
      problem = { title: `Error HTTP ${response.status}` }
    }

    throw new ApiError(response.status, problem)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
