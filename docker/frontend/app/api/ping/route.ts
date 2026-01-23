import { NextResponse } from "next/server";

export async function GET() {

	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ping`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
		});
		if (!res.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch ping from API' },
				{ status: 500 },
			);
		};

		const data = await res.json();

		return new Response(JSON.stringify({ message: data.message }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
	catch (error) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
