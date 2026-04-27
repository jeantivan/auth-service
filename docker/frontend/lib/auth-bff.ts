import { NextResponse } from "next/server"

const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL
const FRONTEND_REFRESH_COOKIE_PATH = "/api/auth/refresh"

function getBackendUrl(path: string): string {
  if (!BACKEND_API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable")
  }

  return new URL(path, BACKEND_API_BASE_URL).toString()
}

function rewriteCookiePath(setCookieValue: string): string {
  return setCookieValue.replace(
    /(^|;\s*)Path=\/auth\/refresh(?=;|$)/i,
    `$1Path=${FRONTEND_REFRESH_COOKIE_PATH}`,
  )
}

function getSetCookieHeaders(response: Response): string[] {
  const headersWithGetSetCookie = response.headers as Headers & {
    getSetCookie?: () => string[]
  }

  const setCookieValues = headersWithGetSetCookie.getSetCookie?.()
  if (setCookieValues && setCookieValues.length > 0) {
    return setCookieValues
  }

  const fallback = response.headers.get("set-cookie")
  return fallback ? [fallback] : []
}

export async function forwardAuthRequest(
  request: Request,
  backendPath: string,
  method: "GET" | "POST",
): Promise<NextResponse> {
  let backendUrl: string

  try {
    backendUrl = getBackendUrl(backendPath)
  } catch {
    return NextResponse.json(
      { error: "Backend API URL is not configured." },
      { status: 500 },
    )
  }

  const headers = new Headers()
  headers.set("x-client-type", "web")

  const contentType = request.headers.get("content-type")
  if (contentType) {
    headers.set("content-type", contentType)
  }

  const cookie = request.headers.get("cookie")
  if (cookie) {
    headers.set("cookie", cookie)
  }

  const userAgent = request.headers.get("user-agent")
  if (userAgent) {
    headers.set("user-agent", userAgent)
  }

  const csrfHeader = request.headers.get("csrf-token")
  if (csrfHeader) {
    headers.set("csrf-token", csrfHeader)
  }

  const xCsrfHeader = request.headers.get("x-csrf-token")
  if (xCsrfHeader) {
    headers.set("x-csrf-token", xCsrfHeader)
  }

  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
  }

  if (method !== "GET") {
    const rawBody = await request.text()
    if (rawBody) {
      init.body = rawBody
    }
  }

  let backendResponse: Response

  try {
    backendResponse = await fetch(backendUrl, init)
  } catch {
    return NextResponse.json(
      { error: "Cannot reach backend auth API." },
      { status: 502 },
    )
  }

  const responseContentType = backendResponse.headers.get("content-type")
  const rawBody = backendResponse.status === 204 ? null : await backendResponse.text()

  const response = new NextResponse(rawBody, {
    status: backendResponse.status,
    headers: responseContentType ? { "content-type": responseContentType } : undefined,
  })

  const setCookieHeaders = getSetCookieHeaders(backendResponse)
  for (const setCookieHeader of setCookieHeaders) {
    response.headers.append("set-cookie", rewriteCookiePath(setCookieHeader))
  }

  return response
}
