'use client'

import { useTransition } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { stopImpersonation } from '@/actions/admin'
import { useRouter } from 'next/navigation'

interface ImpersonationBannerProps {
  impersonatedUser: {
    id: string
    email: string
    name: string | null
  }
}

export function ImpersonationBanner({ impersonatedUser }: ImpersonationBannerProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStopImpersonation = () => {
    startTransition(async () => {
      await stopImpersonation()
      router.push('/admin/users')
      router.refresh()
    })
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-yellow-900 py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            Та &quot;{impersonatedUser.name || impersonatedUser.email}&quot; хэрэглэгч шиг харж байна
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStopImpersonation}
          disabled={isPending}
          className="text-yellow-900 hover:text-yellow-950 hover:bg-yellow-400"
        >
          <X className="h-4 w-4 mr-1" />
          {isPending ? 'Гарч байна...' : 'Гарах'}
        </Button>
      </div>
    </div>
  )
}
