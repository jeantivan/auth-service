import Link from "next/link"
import { Footer } from "@/components/footer"


export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
        Auth service
      </h1>
      <nav className="flex gap-6">
        <Link
          href="/register"
          className="text-lg font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Register
        </Link>
        <Link
          href="/login"
          className="text-lg font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Login
        </Link>
      </nav>
      <Footer />
    </main>
  )
}
