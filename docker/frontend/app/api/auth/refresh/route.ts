import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL

export async function POST() {
  const cookieStore  = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Refresh token is missing." },
      { status: 401 },
    )
  }

  const backendUrl = new URL("/auth/refresh", BACKEND_API_BASE_URL).toString();

  const backendResponse = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!backendResponse.ok) {
    return NextResponse.json(
      { error: "Session expired"},
      { status: 401 });
  }

  const data = await backendResponse.json();

  const response = NextResponse.json({ success: true });

  if (data.accessToken) {
    response.cookies.set({
      name: "accessToken",
      value: data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  return response;

}
