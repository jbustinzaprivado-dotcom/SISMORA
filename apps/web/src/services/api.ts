/** Cliente HTTP mínimo. Los errores de la API llegan como {"error": {"code", "message", "details"}}. */
const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { credentials: 'include', signal })
  } catch {
    throw new ApiError(0, 'NETWORK', 'No se pudo conectar con la API.')
  }
  const body = await res.json().catch(() => null)
  // /health/ready responde 503 con un cuerpo válido cuando la base falla: se devuelve para mostrarlo
  if (!res.ok && !(res.status === 503 && body && 'status' in body)) {
    const e = body?.error
    throw new ApiError(res.status, e?.code ?? 'HTTP_ERROR', e?.message ?? `Error ${res.status}`)
  }
  return body as T
}
