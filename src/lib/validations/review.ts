import { z } from 'zod'

export const createReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  content: z.string().max(2000, 'Review must be less than 2000 characters').optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
})

export const updateReviewSchema = createReviewSchema.partial().omit({ productId: true })

export const reviewVoteSchema = z.object({
  reviewId: z.string().uuid('Invalid review ID'),
  isHelpful: z.boolean(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type ReviewVoteInput = z.infer<typeof reviewVoteSchema>
