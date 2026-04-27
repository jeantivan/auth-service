import { Logout } from "@/components/logout";


export default async function DashboardPage() {

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
      </div>
    </main>
  )
}
