'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PendingSellerCard } from './PendingSellerCard'

interface PendingSeller {
  id: string
  store_name: string
  status: string
  created_at: string
  users?: {
    full_name?: string
    email?: string
  }
}

interface PendingSellersSectionProps {
  initialSellers: PendingSeller[]
}

export function PendingSellersSection({ initialSellers }: PendingSellersSectionProps) {
  const router = useRouter()
  const [sellers, setSellers] = useState(
    initialSellers.filter((s) => s.status === 'pending').slice(0, 6)
  )

  const handleStatusChange = () => {
    // Refresh the page to get updated data
    router.refresh()
  }

  if (sellers.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">Хүлээгдэж буй худалдагч байхгүй</p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sellers.map((seller) => (
        <PendingSellerCard
          key={seller.id}
          seller={seller}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  )
}
