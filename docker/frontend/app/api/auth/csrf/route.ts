import { forwardAuthRequest } from "@/lib/auth-bff"

export async function GET(request: Request) {
  return forwardAuthRequest(request, "/auth/csrf", "GET")
}
