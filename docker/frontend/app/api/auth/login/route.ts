import { forwardAuthRequest } from "@/lib/auth-bff"

export async function POST(request: Request) {
  return forwardAuthRequest(request, "/auth/login", "POST")
}
