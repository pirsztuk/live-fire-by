'use client'

import { usePathname } from 'next/navigation'
import { withAuth } from "@/components/withAuth"
import { Sidebar } from "@/components/Sidebar"

function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return children
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}

export default withAuth(ClientLayout)

