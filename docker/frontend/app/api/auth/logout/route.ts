import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      const backendUrl = new URL("/auth/logout", BACKEND_API_BASE_URL).toString();

      await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Error during logout request:", error);
    }
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: "refreshToken",
    value: "",
    path: "/api/auth/refresh",
    maxAge: 0
  });

  response.cookies.set({
    name: "accessToken",
    value: "",
    path: "/",
    maxAge: 0
  });

  return response;
}
