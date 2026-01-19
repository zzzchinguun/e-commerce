'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schema for address input
const addressSchema = z.object({
  label: z.string().optional(),
  recipientName: z.string().min(1, 'Recipient name is required'),
  phone: z.string().optional(),
  streetAddress: z.string().min(1, 'Street address is required'),
  streetAddress2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().optional().default('MN'),
  isDefaultShipping: z.boolean().optional().default(false),
  isDefaultBilling: z.boolean().optional().default(false),
})

export type AddressInput = z.infer<typeof addressSchema>

export interface Address {
  id: string
  user_id: string
  label: string | null
  recipient_name: string
  phone: string | null
  street_address: string
  street_address_2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default_shipping: boolean
  is_default_billing: boolean
  created_at: string
  updated_at: string
}

/**
 * Get all addresses for the current user
 */
export async function getUserAddresses(): Promise<{
  addresses?: Address[]
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default_shipping', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { addresses: data as Address[] }
}

/**
 * Get a single address by ID
 */
export async function getAddress(addressId: string): Promise<{
  address?: Address
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { address: data as Address }
}

/**
 * Create a new address
 */
export async function createAddress(input: AddressInput): Promise<{
  address?: Address
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate input
  const validation = addressSchema.safeParse(input)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const data = validation.data

  // If setting as default, unset other defaults first
  if (data.isDefaultShipping) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_addresses')
      .update({ is_default_shipping: false })
      .eq('user_id', user.id)
  }

  if (data.isDefaultBilling) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_addresses')
      .update({ is_default_billing: false })
      .eq('user_id', user.id)
  }

  // Create the address
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: address, error } = await (supabase as any)
    .from('user_addresses')
    .insert({
      user_id: user.id,
      label: data.label || null,
      recipient_name: data.recipientName,
      phone: data.phone || null,
      street_address: data.streetAddress,
      street_address_2: data.streetAddress2 || null,
      city: data.city,
      state: data.state,
      postal_code: data.postalCode,
      country: data.country,
      is_default_shipping: data.isDefaultShipping,
      is_default_billing: data.isDefaultBilling,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/account/addresses')
  return { address: address as Address }
}

/**
 * Update an existing address
 */
export async function updateAddress(
  addressId: string,
  input: Partial<AddressInput>
): Promise<{
  address?: Address
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('user_addresses')
    .select('id')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    return { error: 'Address not found' }
  }

  // Build update object
  const updateData: Record<string, unknown> = {}
  if (input.label !== undefined) updateData.label = input.label || null
  if (input.recipientName !== undefined) updateData.recipient_name = input.recipientName
  if (input.phone !== undefined) updateData.phone = input.phone || null
  if (input.streetAddress !== undefined) updateData.street_address = input.streetAddress
  if (input.streetAddress2 !== undefined) updateData.street_address_2 = input.streetAddress2 || null
  if (input.city !== undefined) updateData.city = input.city
  if (input.state !== undefined) updateData.state = input.state
  if (input.postalCode !== undefined) updateData.postal_code = input.postalCode
  if (input.country !== undefined) updateData.country = input.country

  // Handle default shipping
  if (input.isDefaultShipping === true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_addresses')
      .update({ is_default_shipping: false })
      .eq('user_id', user.id)
    updateData.is_default_shipping = true
  } else if (input.isDefaultShipping === false) {
    updateData.is_default_shipping = false
  }

  // Handle default billing
  if (input.isDefaultBilling === true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_addresses')
      .update({ is_default_billing: false })
      .eq('user_id', user.id)
    updateData.is_default_billing = true
  } else if (input.isDefaultBilling === false) {
    updateData.is_default_billing = false
  }

  // Update the address
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: address, error } = await (supabase as any)
    .from('user_addresses')
    .update(updateData)
    .eq('id', addressId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/account/addresses')
  return { address: address as Address }
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId: string): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('user_addresses')
    .select('id')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    return { error: 'Address not found' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('user_addresses')
    .delete()
    .eq('id', addressId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/account/addresses')
  return { success: true }
}

/**
 * Set an address as default shipping
 */
export async function setDefaultShippingAddress(addressId: string): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('user_addresses')
    .select('id')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    return { error: 'Address not found' }
  }

  // Unset current default
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('user_addresses')
    .update({ is_default_shipping: false })
    .eq('user_id', user.id)

  // Set new default
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('user_addresses')
    .update({ is_default_shipping: true })
    .eq('id', addressId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/account/addresses')
  return { success: true }
}
