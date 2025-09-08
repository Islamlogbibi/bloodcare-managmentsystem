"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const publicRoutes = ["/login", "/setup-admin"]
  const isPublicRoute = publicRoutes.includes(pathname)

  if (!user && !isPublicRoute) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">{children}</div>
  }

  if (isPublicRoute) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">{children}</div>
  }

  console.log("[v0] Rendering authenticated layout with user:", user)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto" role="main" aria-label="Main content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LanguageProvider>
            <AuthProvider>
              <AuthenticatedLayout>{children}</AuthenticatedLayout>
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
