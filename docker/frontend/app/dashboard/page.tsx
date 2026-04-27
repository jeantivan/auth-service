import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refreshToken")

  if (!refreshToken?.value) {
	console.log("No refresh token found, redirecting to login");
    redirect("/login")
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Basic message
        </p>
      </div>
    </main>
  )
}
