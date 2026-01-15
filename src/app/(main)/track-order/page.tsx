'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<'not_found' | 'found' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    // Simulate search
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For demo, always show not found (real implementation would query database)
    setSearchResult('not_found')
    setIsSearching(false)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <Package className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Захиалга хянах</h1>
        <p className="mt-2 text-gray-600">
          Захиалгын дугаар болон имэйлээ оруулж захиалгынхаа одоогийн төлөвийг харна уу
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Захиалгын дугаар</Label>
            <Input
              id="orderNumber"
              placeholder="жишээ нь, ORD-12345678"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">
              Үүнийг захиалгын баталгаажуулах имэйлээс олж болно
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Имэйл хаяг</Label>
            <Input
              id="email"
              type="email"
              placeholder="Захиалгад ашигласан имэйл"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Хайж байна...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Захиалга хайх
              </>
            )}
          </Button>
        </form>

        {searchResult === 'not_found' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600">
              Эдгээр мэдээллээр захиалга олдсонгүй. Захиалгын дугаар болон имэйлээ шалгана уу.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Хэрэв танд бүртгэл байгаа бол нэвтэрсний дараа{' '}
              <Link href="/account/orders" className="text-orange-600 hover:underline">
                захиалгуудаа харах
              </Link>{' '}
              боломжтой.
            </p>
          </div>
        )}
      </div>

      {/* Order Status Guide */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Захиалгын төлөвийн тайлбар</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Боловсруулж байна</h3>
              <p className="text-sm text-gray-600">Таны захиалгыг хүлээн авч, бэлтгэж байна</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Илгээгдсэн</h3>
              <p className="text-sm text-gray-600">Таны захиалгыг хүргэлтийн компанид өгсөн</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Хүргэлтэнд гарсан</h3>
              <p className="text-sm text-gray-600">Таны захиалга хаяг руу явж байна</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Хүргэгдсэн</h3>
              <p className="text-sm text-gray-600">Таны захиалга амжилттай хүргэгдсэн</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-orange-50 rounded-lg p-6 text-center">
        <h2 className="font-semibold text-gray-900">Тусламж хэрэгтэй юу?</h2>
        <p className="mt-1 text-sm text-gray-600">
          Хэрэв танд захиалгын талаар асуулт байвал манай дэмжлэгийн баг туслахад бэлэн.
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-block text-orange-600 hover:underline"
        >
          Дэмжлэгтэй холбогдох
        </Link>
      </div>
    </div>
  )
}
