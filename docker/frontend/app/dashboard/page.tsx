import { Logout } from "@/components/logout";
import { cookies } from "next/headers";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const BASE_URL = "http://localhost:3000";

async function getSessions() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return [];
  }

  const apiUrl = new URL("/api/auth/sessions", BASE_URL).toString();

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export default async function DashboardPage() {

  const sessions = await getSessions();


  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Basic message
        </p>
        <div className="mt-6">
          <Logout />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Active Sessions</h2>
          {sessions.length === 0 ? (
            <p>No active sessions found.</p>
          ) : (
            <ul className="space-y-4">
              {sessions.map((session: any) => (
                <li key={session.id} className="border p-4 rounded-md">
                  <p><strong>Device:</strong> {session.userAgent}</p>
                  <p><strong>IP Address:</strong> {session.ipAddress}</p>
                  <p><strong>Last Active:</strong> {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: es })}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
