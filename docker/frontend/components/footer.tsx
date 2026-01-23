import Link from "next/link"

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-muted-foreground">
      Created by{" "}
      <Link
        href="https://github.com/jeantivan"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
      >
        Jean Tivan
      </Link>
    </footer>
  )
}
