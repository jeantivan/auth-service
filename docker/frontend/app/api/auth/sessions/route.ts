import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get("accessToken")?.value;

	if (!accessToken) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const backendUrl = new URL("/auth/sessions", BACKEND_API_BASE_URL).toString();

	try {
		const response = await fetch(backendUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${accessToken}`
			}
		});

		if (!response.ok) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Error fetching sessions:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
