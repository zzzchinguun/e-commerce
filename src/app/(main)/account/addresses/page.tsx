'use client'

import { useState } from 'react'
import { MapPin, Plus, Pencil, Trash2, Check } from 'lucide-react'
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

interface Address {
  id: string
  name: string
  street: string
  apartment?: string
  city: string
  state: string
  zipCode: string
  phone: string
  isDefault: boolean
}

// Placeholder addresses
const placeholderAddresses: Address[] = [
  {
    id: '1',
    name: 'John Doe',
    street: '123 Main Street',
    apartment: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phone: '(555) 123-4567',
    isDefault: true,
  },
]

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    )
  }

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id))
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <MapPin className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">No addresses saved</h2>
        <p className="mt-2 text-gray-500">
          Add a shipping address to make checkout faster.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <AddressDialog onClose={() => setIsDialogOpen(false)} />
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <AddressDialog onClose={() => setIsDialogOpen(false)} />
        </Dialog>
      </div>

      {/* Address Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="relative rounded-lg border bg-white p-4"
          >
            {address.isDefault && (
              <Badge className="absolute right-4 top-4 bg-orange-100 text-orange-700">
                Default
              </Badge>
            )}

            <div className="space-y-1">
              <p className="font-medium text-gray-900">{address.name}</p>
              <p className="text-sm text-gray-600">{address.street}</p>
              {address.apartment && (
                <p className="text-sm text-gray-600">{address.apartment}</p>
              )}
              <p className="text-sm text-gray-600">
                {address.city}, {address.state} {address.zipCode}
              </p>
              <p className="text-sm text-gray-600">{address.phone}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                <Pencil className="mr-1 h-3 w-3" />
                Edit
              </Button>
              {!address.isDefault && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Set Default
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddressDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Address</DialogTitle>
      </DialogHeader>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="street">Street Address</Label>
          <Input id="street" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
          <Input id="apartment" className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input id="zipCode" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" className="mt-1" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
            Save Address
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
