'use client'

import { ReactNode, useState } from 'react'
import { Button } from '../components/ui/button'

interface SidebarLayoutProps {
  children: ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="flex h-screen">
      <aside className={`transition-all ${open ? 'w-72' : 'w-16'} bg-gray-800 p-2`}>
        <Button onClick={() => setOpen(o => !o)} className="mb-4 px-3 py-1 text-sm">
          {open ? '←' : '→'}
        </Button>
        {open && (
          <div className="overflow-auto">
            {/* here you can put your IDE / file navigator */}
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
