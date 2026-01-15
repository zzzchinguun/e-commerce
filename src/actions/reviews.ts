'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Review {
  id: string
  author: {
    name: string
    avatar?: string
  }
  rating: number
  title: string
  content: string
  createdAt: Date
  verified: boolean
  helpful: number
  notHelpful: number
  userVote?: 'helpful' | 'unhelpful' | null
}

export interface RatingDistribution {
  stars: number
  count: number
  percentage: number
}

export async function getProductReviews(
  productId: string,
  options?: {
    sort?: 'helpful' | 'recent' | 'highest' | 'lowest'
    limit?: number
    offset?: number
  }
): Promise<{
  reviews: Review[]
  ratingDistribution: RatingDistribution[]
  averageRating: number
  totalReviews: number
  error?: string
}> {
  const supabase = await createClient()

  // Get current user for checking their votes
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Build query
  let query = supabase
    .from('product_reviews')
    .select(`
      id,
      rating,
      title,
      content,
      is_verified_purchase,
      helpful_votes,
      unhelpful_votes,
      created_at,
      users (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('product_id', productId)
    .eq('is_approved', true)

  // Apply sorting
  switch (options?.sort) {
    case 'recent':
      query = query.order('created_at', { ascending: false })
      break
    case 'highest':
      query = query.order('rating', { ascending: false })
      break
    case 'lowest':
      query = query.order('rating', { ascending: true })
      break
    case 'helpful':
    default:
      query = query.order('helpful_votes', { ascending: false })
      break
  }

  // Apply pagination
  const limit = options?.limit || 10
  const offset = options?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data: reviewsData, error } = await query

  if (error) {
    return {
      reviews: [],
      ratingDistribution: [],
      averageRating: 0,
      totalReviews: 0,
      error: error.message,
    }
  }

  // Get user's votes if logged in
  let userVotes: Record<string, 'helpful' | 'unhelpful'> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewsList = reviewsData as any[]
  if (user && reviewsList && reviewsList.length > 0) {
    const reviewIds = reviewsList.map((r) => r.id)
    const { data: votes } = await supabase
      .from('review_votes')
      .select('review_id, is_helpful')
      .eq('user_id', user.id)
      .in('review_id', reviewIds)

    if (votes) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userVotes = (votes as any[]).reduce((acc, vote) => {
        acc[vote.review_id] = vote.is_helpful ? 'helpful' : 'unhelpful'
        return acc
      }, {} as Record<string, 'helpful' | 'unhelpful'>)
    }
  }

  // Transform reviews
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews: Review[] = (reviewsData as any[])?.map((review) => ({
    id: review.id,
    author: {
      name: review.users?.full_name || 'Anonymous',
      avatar: review.users?.avatar_url || undefined,
    },
    rating: review.rating,
    title: review.title || '',
    content: review.content || '',
    createdAt: new Date(review.created_at),
    verified: review.is_verified_purchase,
    helpful: review.helpful_votes || 0,
    notHelpful: review.unhelpful_votes || 0,
    userVote: userVotes[review.id] || null,
  })) || []

  // Get rating distribution
  const { data: distributionData } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('is_approved', true)

  const ratingCounts = [0, 0, 0, 0, 0] // Index 0 = 1 star, Index 4 = 5 stars
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(distributionData as any[])?.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating - 1]++
    }
  })

  const totalReviews = distributionData?.length || 0
  const ratingDistribution: RatingDistribution[] = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: ratingCounts[stars - 1],
    percentage: totalReviews > 0 ? Math.round((ratingCounts[stars - 1] / totalReviews) * 100) : 0,
  }))

  // Calculate average rating
  const sumRatings = ratingCounts.reduce((sum, count, index) => sum + count * (index + 1), 0)
  const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0

  return {
    reviews,
    ratingDistribution,
    averageRating,
    totalReviews,
  }
}

export async function createReview(
  productId: string,
  data: {
    rating: number
    title: string
    content: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in to write a review' }
  }

  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    return { success: false, error: 'Rating must be between 1 and 5' }
  }

  // Check if user already reviewed this product
  const { data: existingReview } = await supabase
    .from('product_reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single()

  if (existingReview) {
    return { success: false, error: 'You have already reviewed this product' }
  }

  // Check if user has purchased this product (verified purchase)
  const { data: orderItemData } = await supabase
    .from('order_items')
    .select(`
      id,
      orders!inner (
        user_id,
        payment_status
      )
    `)
    .eq('product_id', productId)
    .eq('orders.user_id', user.id)
    .eq('orders.payment_status', 'paid')
    .limit(1)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderItem = orderItemData as { id: string } | null
  const isVerifiedPurchase = !!orderItem

  // Create review
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('product_reviews')
    .insert({
      product_id: productId,
      user_id: user.id,
      order_item_id: orderItem?.id || null,
      rating: data.rating,
      title: data.title,
      content: data.content,
      is_verified_purchase: isVerifiedPurchase,
      is_approved: true, // Auto-approve for now
    })

  if (error) {
    console.error('Error creating review:', error)
    return { success: false, error: 'Failed to create review' }
  }

  // Get the product slug for revalidation
  const { data: productData } = await supabase
    .from('products')
    .select('slug')
    .eq('id', productId)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = productData as { slug: string } | null
  if (product?.slug) {
    revalidatePath(`/products/${product.slug}`)
  }

  return { success: true }
}

export async function voteReview(
  reviewId: string,
  isHelpful: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be logged in to vote' }
  }

  // Check for existing vote
  const { data: existingVoteData } = await supabase
    .from('review_votes')
    .select('id, is_helpful')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingVote = existingVoteData as { id: string; is_helpful: boolean } | null

  if (existingVote) {
    // Get current review vote counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reviewData } = await (supabase as any)
      .from('product_reviews')
      .select('helpful_votes, unhelpful_votes')
      .eq('id', reviewId)
      .single()

    const currentReview = reviewData as { helpful_votes: number; unhelpful_votes: number } | null

    if (existingVote.is_helpful === isHelpful) {
      // Remove vote if clicking the same button
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('review_votes')
        .delete()
        .eq('id', existingVote.id)

      // Decrement the appropriate vote count
      if (currentReview) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('product_reviews')
          .update({
            helpful_votes: isHelpful ? Math.max(0, (currentReview.helpful_votes || 0) - 1) : currentReview.helpful_votes,
            unhelpful_votes: !isHelpful ? Math.max(0, (currentReview.unhelpful_votes || 0) - 1) : currentReview.unhelpful_votes,
          })
          .eq('id', reviewId)
      }

      return { success: true }
    } else {
      // Change vote
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('review_votes')
        .update({ is_helpful: isHelpful })
        .eq('id', existingVote.id)

      // Update vote counts (swap)
      if (currentReview) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('product_reviews')
          .update({
            helpful_votes: isHelpful ? (currentReview.helpful_votes || 0) + 1 : Math.max(0, (currentReview.helpful_votes || 0) - 1),
            unhelpful_votes: isHelpful ? Math.max(0, (currentReview.unhelpful_votes || 0) - 1) : (currentReview.unhelpful_votes || 0) + 1,
          })
          .eq('id', reviewId)
      }

      return { success: true }
    }
  }

  // Create new vote
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: voteError } = await (supabase as any)
    .from('review_votes')
    .insert({
      review_id: reviewId,
      user_id: user.id,
      is_helpful: isHelpful,
    })

  if (voteError) {
    return { success: false, error: 'Failed to record vote' }
  }

  // Update review vote count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: review } = await (supabase as any)
    .from('product_reviews')
    .select('helpful_votes, unhelpful_votes')
    .eq('id', reviewId)
    .single()

  if (review) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('product_reviews')
      .update({
        helpful_votes: isHelpful ? (review.helpful_votes || 0) + 1 : review.helpful_votes,
        unhelpful_votes: !isHelpful ? (review.unhelpful_votes || 0) + 1 : review.unhelpful_votes,
      })
      .eq('id', reviewId)
  }

  return { success: true }
}

export async function canUserReview(productId: string): Promise<{
  canReview: boolean
  hasReviewed: boolean
  hasPurchased: boolean
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { canReview: false, hasReviewed: false, hasPurchased: false }
  }

  // Check if user already reviewed
  const { data: existingReview } = await supabase
    .from('product_reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single()

  const hasReviewed = !!existingReview

  // Check if user has purchased this product
  const { data: orderItem } = await supabase
    .from('order_items')
    .select(`
      id,
      orders!inner (
        user_id,
        payment_status
      )
    `)
    .eq('product_id', productId)
    .eq('orders.user_id', user.id)
    .eq('orders.payment_status', 'paid')
    .limit(1)
    .single()

  const hasPurchased = !!orderItem

  return {
    canReview: !hasReviewed,
    hasReviewed,
    hasPurchased,
  }
}
