'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { updateSellerStatus } from '@/actions/admin'

interface PendingSeller {
  id: string
  store_name: string
  created_at: string
  users?: {
    full_name?: string
    email?: string
  }
}

interface PendingSellerCardProps {
  seller: PendingSeller
  onStatusChange: () => void
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PendingSellerCard({ seller, onStatusChange }: PendingSellerCardProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const result = await updateSellerStatus(seller.id, 'approved')
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${seller.store_name} амжилттай баталгаажлаа`)
        onStatusChange()
      }
    } catch {
      toast.error('Алдаа гарлаа')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      const result = await updateSellerStatus(seller.id, 'rejected')
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${seller.store_name} татгалзагдлаа`)
        onStatusChange()
      }
    } catch {
      toast.error('Алдаа гарлаа')
    } finally {
      setIsRejecting(false)
      setShowRejectDialog(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-gray-900">{seller.store_name}</p>
            <p className="text-sm text-gray-500">
              {seller.users?.full_name || seller.users?.email}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {formatDate(seller.created_at)}
            </p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">Хүлээгдэж буй</Badge>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
          >
            {isApproving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-1 h-4 w-4" />
            )}
            Батлах
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-600 hover:bg-red-50"
            onClick={() => setShowRejectDialog(true)}
            disabled={isApproving || isRejecting}
          >
            {isRejecting ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-1 h-4 w-4" />
            )}
            Татгалзах
          </Button>
        </div>
      </div>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Худалдагчийг татгалзах уу?</AlertDialogTitle>
            <AlertDialogDescription>
              {seller.store_name} дэлгүүрийн хүсэлтийг татгалзах гэж байна.
              Энэ үйлдлийг буцаах боломжтой.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isRejecting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Татгалзах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
