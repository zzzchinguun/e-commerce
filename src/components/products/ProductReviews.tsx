'use client'

import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Review {
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
}

interface ProductReviewsProps {
  productId: string
  reviews?: Review[]
  averageRating?: number
  totalReviews?: number
}

// Placeholder reviews
const placeholderReviews: Review[] = [
  {
    id: '1',
    author: { name: 'John D.' },
    rating: 5,
    title: 'Excellent product!',
    content: 'This product exceeded my expectations. The quality is amazing and it works exactly as described. Highly recommend to anyone looking for a reliable product.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    verified: true,
    helpful: 42,
    notHelpful: 2,
  },
  {
    id: '2',
    author: { name: 'Sarah M.' },
    rating: 4,
    title: 'Good value for money',
    content: 'Pretty good product overall. Does what it says. Shipping was fast and packaging was secure. Only giving 4 stars because the color was slightly different from the photos.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    verified: true,
    helpful: 15,
    notHelpful: 1,
  },
  {
    id: '3',
    author: { name: 'Mike R.' },
    rating: 3,
    title: 'Decent but could be better',
    content: 'The product is okay. It works but the build quality could be improved. Customer service was helpful when I had questions.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    verified: false,
    helpful: 8,
    notHelpful: 3,
  },
]

const ratingDistribution = [
  { stars: 5, percentage: 65 },
  { stars: 4, percentage: 20 },
  { stars: 3, percentage: 10 },
  { stars: 2, percentage: 3 },
  { stars: 1, percentage: 2 },
]

export function ProductReviews({
  productId,
  reviews = placeholderReviews,
  averageRating = 4.3,
  totalReviews = 127,
}: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState('helpful')
  const [showWriteReview, setShowWriteReview] = useState(false)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
      </div>

      {/* Summary Section */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Average Rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="mt-1 flex justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < Math.floor(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  )}
                />
              ))}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {totalReviews.toLocaleString()} reviews
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {ratingDistribution.map((rating) => (
              <div key={rating.stars} className="flex items-center gap-2">
                <span className="w-12 text-sm text-gray-600">{rating.stars} star</span>
                <Progress value={rating.percentage} className="h-2 flex-1" />
                <span className="w-10 text-right text-sm text-gray-500">
                  {rating.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review CTA */}
        <div className="flex flex-col items-start justify-center rounded-lg bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900">Share your thoughts</h3>
          <p className="mt-1 text-sm text-gray-500">
            If you&apos;ve purchased this product, share your thoughts with other customers
          </p>
          <Button
            className="mt-4 bg-orange-500 hover:bg-orange-600"
            onClick={() => setShowWriteReview(!showWriteReview)}
          >
            Write a Review
          </Button>
        </div>
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="rounded-lg border bg-white p-6">
          <h3 className="font-semibold text-gray-900">Write your review</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Your Rating</label>
              <div className="mt-1 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <button key={i} className="text-gray-300 hover:text-yellow-400">
                    <Star className="h-8 w-8" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Review Title</label>
              <input
                type="text"
                placeholder="Sum up your review in one line"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Your Review</label>
              <Textarea
                placeholder="What did you like or dislike about this product?"
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWriteReview(false)}>
                Cancel
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600">Submit Review</Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {/* Sort Controls */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Top Reviews</h3>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Review Items */}
        <div className="divide-y">
          {reviews.map((review) => (
            <div key={review.id} className="py-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.author.avatar} />
                  <AvatarFallback>
                    {review.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{review.author.name}</span>
                    {review.verified && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-900">{review.title}</span>
                  </div>

                  {/* Date */}
                  <p className="mt-1 text-xs text-gray-500">
                    Reviewed {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                  </p>

                  {/* Content */}
                  <p className="mt-3 text-gray-700">{review.content}</p>

                  {/* Helpful buttons */}
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-sm text-gray-500">Was this review helpful?</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{review.helpful}</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <ThumbsDown className="h-4 w-4" />
                        <span>{review.notHelpful}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center">
          <Button variant="outline" className="gap-2">
            See all {totalReviews} reviews
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
