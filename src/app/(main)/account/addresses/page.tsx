'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Plus, Pencil, Trash2, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultShippingAddress,
  type Address,
} from '@/actions/addresses'

const addressSchema = z.object({
  label: z.string().optional(),
  recipientName: z.string().min(1, 'Хүлээн авагчийн нэр шаардлагатай'),
  phone: z.string().optional(),
  streetAddress: z.string().min(1, 'Гудамжны хаяг шаардлагатай'),
  streetAddress2: z.string().optional(),
  city: z.string().min(1, 'Хот шаардлагатай'),
  state: z.string().min(1, 'Дүүрэг/Аймаг шаардлагатай'),
  postalCode: z.string().min(1, 'Шуудангийн код шаардлагатай'),
  country: z.string().optional().default('MN'),
  isDefaultShipping: z.boolean().optional().default(false),
})

type AddressFormData = z.infer<typeof addressSchema>

const MONGOLIAN_DISTRICTS = [
  'Багануур',
  'Багахангай',
  'Баянгол',
  'Баянзүрх',
  'Налайх',
  'Сонгинохайрхан',
  'Сүхбаатар',
  'Хан-Уул',
  'Чингэлтэй',
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)

  useEffect(() => {
    loadAddresses()
  }, [])

  async function loadAddresses() {
    setIsLoading(true)
    try {
      const result = await getUserAddresses()
      if (result.addresses) {
        setAddresses(result.addresses)
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch {
      toast.error('Хаягуудыг ачаалж чадсангүй')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    const result = await setDefaultShippingAddress(id)
    if (result.success) {
      toast.success('Үндсэн хаяг амжилттай солигдлоо')
      loadAddresses()
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    if (!deletingAddressId) return

    const result = await deleteAddress(deletingAddressId)
    if (result.success) {
      toast.success('Хаяг амжилттай устгагдлаа')
      loadAddresses()
    } else if (result.error) {
      toast.error(result.error)
    }
    setDeletingAddressId(null)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingAddress(null)
  }

  const handleSaveSuccess = () => {
    handleDialogClose()
    loadAddresses()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <MapPin className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Хадгалсан хаяг байхгүй</h2>
        <p className="mt-2 text-gray-500">
          Төлбөр тооцоог хурдасгахын тулд хүргэлтийн хаяг нэмнэ үү.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Хаяг нэмэх
            </Button>
          </DialogTrigger>
          <AddressDialog
            onClose={handleDialogClose}
            onSuccess={handleSaveSuccess}
            editingAddress={editingAddress}
          />
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Хадгалсан хаягууд</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) handleDialogClose()
          else setIsDialogOpen(true)
        }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Хаяг нэмэх
            </Button>
          </DialogTrigger>
          <AddressDialog
            onClose={handleDialogClose}
            onSuccess={handleSaveSuccess}
            editingAddress={editingAddress}
          />
        </Dialog>
      </div>

      {/* Address Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="relative rounded-lg border bg-white p-4"
          >
            {address.is_default_shipping && (
              <Badge className="absolute right-4 top-4 bg-orange-100 text-orange-700">
                Үндсэн
              </Badge>
            )}

            <div className="space-y-1">
              {address.label && (
                <p className="text-xs font-medium text-gray-500 uppercase">{address.label}</p>
              )}
              <p className="font-medium text-gray-900">{address.recipient_name}</p>
              <p className="text-sm text-gray-600">{address.street_address}</p>
              {address.street_address_2 && (
                <p className="text-sm text-gray-600">{address.street_address_2}</p>
              )}
              <p className="text-sm text-gray-600">
                {address.city}, {address.state} {address.postal_code}
              </p>
              {address.phone && (
                <p className="text-sm text-gray-600">{address.phone}</p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(address)}>
                <Pencil className="mr-1 h-3 w-3" />
                Засах
              </Button>
              {!address.is_default_shipping && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Үндсэн болгох
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeletingAddressId(address.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Устгах
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAddressId} onOpenChange={(open) => !open && setDeletingAddressId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Хаяг устгах уу?</AlertDialogTitle>
            <AlertDialogDescription>
              Энэ үйлдлийг буцаах боломжгүй. Хаяг бүрмөсөн устгагдах болно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AddressDialog({
  onClose,
  onSuccess,
  editingAddress,
}: {
  onClose: () => void
  onSuccess: () => void
  editingAddress: Address | null
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: editingAddress
      ? {
          label: editingAddress.label || '',
          recipientName: editingAddress.recipient_name,
          phone: editingAddress.phone || '',
          streetAddress: editingAddress.street_address,
          streetAddress2: editingAddress.street_address_2 || '',
          city: editingAddress.city,
          state: editingAddress.state,
          postalCode: editingAddress.postal_code,
          country: editingAddress.country,
          isDefaultShipping: editingAddress.is_default_shipping,
        }
      : {
          country: 'MN',
          isDefaultShipping: false,
        },
  })

  const selectedState = watch('state')

  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true)
    try {
      // Add isDefaultBilling field required by server action
      const addressData = { ...data, isDefaultBilling: false }
      let result
      if (editingAddress) {
        result = await updateAddress(editingAddress.id, addressData)
      } else {
        result = await createAddress(addressData)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(editingAddress ? 'Хаяг амжилттай шинэчлэгдлээ' : 'Хаяг амжилттай нэмэгдлээ')
        onSuccess()
      }
    } catch {
      toast.error('Алдаа гарлаа')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {editingAddress ? 'Хаяг засах' : 'Шинэ хаяг нэмэх'}
        </DialogTitle>
      </DialogHeader>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="label">Хаягийн нэр (заавал биш)</Label>
          <Input
            id="label"
            placeholder="Гэр, Ажил гэх мэт"
            {...register('label')}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="recipientName">Хүлээн авагчийн нэр *</Label>
          <Input id="recipientName" {...register('recipientName')} className="mt-1" />
          {errors.recipientName && (
            <p className="mt-1 text-sm text-red-500">{errors.recipientName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Утас</Label>
          <Input id="phone" type="tel" {...register('phone')} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="streetAddress">Гудамжны хаяг *</Label>
          <Input id="streetAddress" {...register('streetAddress')} className="mt-1" />
          {errors.streetAddress && (
            <p className="mt-1 text-sm text-red-500">{errors.streetAddress.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="streetAddress2">Байр, тоот гэх мэт (заавал биш)</Label>
          <Input id="streetAddress2" {...register('streetAddress2')} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Хот *</Label>
            <Input id="city" {...register('city')} className="mt-1" />
            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="state">Дүүрэг/Аймаг *</Label>
            <Select
              value={selectedState}
              onValueChange={(value) => setValue('state', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Сонгох" />
              </SelectTrigger>
              <SelectContent>
                {MONGOLIAN_DISTRICTS.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="postalCode">Шуудангийн код *</Label>
          <Input id="postalCode" {...register('postalCode')} className="mt-1" />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-500">{errors.postalCode.message}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Цуцлах
          </Button>
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingAddress ? 'Хадгалах' : 'Хаяг нэмэх'}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
