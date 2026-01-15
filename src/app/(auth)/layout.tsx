import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header with logo */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-slate-900">
            MARKETPLACE
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}
