'use client'

import { useState, useEffect, useTransition } from 'react'
import { Star, ThumbsUp, ThumbsDown, ChevronDown, Loader2 } from 'lucide-react'
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
import {
  getProductReviews,
  createReview,
  voteReview,
  canUserReview,
  type Review,
  type RatingDistribution,
} from '@/actions/reviews'
import { toast } from 'sonner'

interface ProductReviewsProps {
  productId: string
  averageRating?: number
  totalReviews?: number
}

export function ProductReviews({
  productId,
  averageRating: initialAverageRating = 0,
  totalReviews: initialTotalReviews = 0,
}: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<'helpful' | 'recent' | 'highest' | 'lowest'>('helpful')
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([])
  const [averageRating, setAverageRating] = useState(initialAverageRating)
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews)
  const [isLoading, setIsLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)

  // Review form state
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewContent, setReviewContent] = useState('')
  const [isPending, startTransition] = useTransition()

  // Fetch reviews
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const [reviewsResult, canReviewResult] = await Promise.all([
        getProductReviews(productId, { sort: sortBy }),
        canUserReview(productId),
      ])

      if (!reviewsResult.error) {
        setReviews(reviewsResult.reviews)
        setRatingDistribution(reviewsResult.ratingDistribution)
        setAverageRating(reviewsResult.averageRating)
        setTotalReviews(reviewsResult.totalReviews)
      }

      setCanReview(canReviewResult.canReview)
      setHasReviewed(canReviewResult.hasReviewed)
      setHasPurchased(canReviewResult.hasPurchased)
      setIsLoading(false)
    }

    fetchData()
  }, [productId, sortBy])

  const handleSubmitReview = () => {
    if (selectedRating === 0) {
      toast.error('Please select a rating before submitting')
      return
    }

    if (!reviewContent.trim()) {
      toast.error('Please write a review before submitting')
      return
    }

    startTransition(async () => {
      const result = await createReview(productId, {
        rating: selectedRating,
        title: reviewTitle,
        content: reviewContent,
      })

      if (result.success) {
        toast.success('Thank you for your review!')
        setShowWriteReview(false)
        setSelectedRating(0)
        setReviewTitle('')
        setReviewContent('')
        // Refresh reviews
        const reviewsResult = await getProductReviews(productId, { sort: sortBy })
        if (!reviewsResult.error) {
          setReviews(reviewsResult.reviews)
          setRatingDistribution(reviewsResult.ratingDistribution)
          setAverageRating(reviewsResult.averageRating)
          setTotalReviews(reviewsResult.totalReviews)
        }
        setHasReviewed(true)
        setCanReview(false)
      } else {
        toast.error(result.error || 'Failed to submit review')
      }
    })
  }

  const handleVote = (reviewId: string, isHelpful: boolean) => {
    startTransition(async () => {
      const result = await voteReview(reviewId, isHelpful)
      if (result.success) {
        // Refresh reviews to get updated vote counts
        const reviewsResult = await getProductReviews(productId, { sort: sortBy })
        if (!reviewsResult.error) {
          setReviews(reviewsResult.reviews)
        }
      } else {
        toast.error(result.error || 'Failed to record vote')
      }
    })
  }

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
              {totalReviews.toLocaleString()} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {ratingDistribution.length > 0 ? (
              ratingDistribution.map((rating) => (
                <div key={rating.stars} className="flex items-center gap-2">
                  <span className="w-12 text-sm text-gray-600">{rating.stars} star</span>
                  <Progress value={rating.percentage} className="h-2 flex-1" />
                  <span className="w-10 text-right text-sm text-gray-500">
                    {rating.percentage}%
                  </span>
                </div>
              ))
            ) : (
              [5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="w-12 text-sm text-gray-600">{stars} star</span>
                  <Progress value={0} className="h-2 flex-1" />
                  <span className="w-10 text-right text-sm text-gray-500">0%</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Write Review CTA */}
        <div className="flex flex-col items-start justify-center rounded-lg bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900">Share your thoughts</h3>
          <p className="mt-1 text-sm text-gray-500">
            {hasReviewed
              ? 'You have already reviewed this product'
              : hasPurchased
              ? 'You purchased this product! Share your experience.'
              : 'If you\'ve purchased this product, share your thoughts with other customers'}
          </p>
          {!hasReviewed && (
            <Button
              className="mt-4 bg-orange-500 hover:bg-orange-600"
              onClick={() => setShowWriteReview(!showWriteReview)}
              disabled={!canReview}
            >
              Write a Review
            </Button>
          )}
          {hasReviewed && (
            <p className="mt-4 text-sm text-green-600">Thank you for your review!</p>
          )}
        </div>
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="rounded-lg border bg-white p-6">
          <h3 className="font-semibold text-gray-900">Write your review</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Your Rating *</label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className="focus:outline-none"
                    onMouseEnter={() => setHoverRating(rating)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setSelectedRating(rating)}
                  >
                    <Star
                      className={cn(
                        'h-8 w-8 transition-colors',
                        (hoverRating || selectedRating) >= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
                      )}
                    />
                  </button>
                ))}
              </div>
              {selectedRating > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {selectedRating === 1 && 'Poor'}
                  {selectedRating === 2 && 'Fair'}
                  {selectedRating === 3 && 'Good'}
                  {selectedRating === 4 && 'Very Good'}
                  {selectedRating === 5 && 'Excellent'}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Review Title</label>
              <input
                type="text"
                placeholder="Sum up your review in one line"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Your Review *</label>
              <Textarea
                placeholder="What did you like or dislike about this product?"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowWriteReview(false)
                  setSelectedRating(0)
                  setReviewTitle('')
                  setReviewContent('')
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleSubmitReview}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {/* Sort Controls */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            {isLoading ? 'Loading reviews...' : `${totalReviews} Review${totalReviews !== 1 ? 's' : ''}`}
          </h3>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && reviews.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        )}

        {/* Review Items */}
        {!isLoading && reviews.length > 0 && (
          <div className="divide-y">
            {reviews.map((review) => (
              <div key={review.id} className="py-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.author.avatar} />
                    <AvatarFallback>
                      {review.author.name.charAt(0).toUpperCase()}
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
                      {review.title && (
                        <span className="font-medium text-gray-900">{review.title}</span>
                      )}
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
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'h-8 gap-1',
                            review.userVote === 'helpful' && 'bg-green-50 border-green-200'
                          )}
                          onClick={() => handleVote(review.id, true)}
                          disabled={isPending}
                        >
                          <ThumbsUp className={cn('h-4 w-4', review.userVote === 'helpful' && 'fill-green-500 text-green-500')} />
                          <span>{review.helpful}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'h-8 gap-1',
                            review.userVote === 'unhelpful' && 'bg-red-50 border-red-200'
                          )}
                          onClick={() => handleVote(review.id, false)}
                          disabled={isPending}
                        >
                          <ThumbsDown className={cn('h-4 w-4', review.userVote === 'unhelpful' && 'fill-red-500 text-red-500')} />
                          <span>{review.notHelpful}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {!isLoading && reviews.length > 0 && reviews.length < totalReviews && (
          <div className="flex justify-center">
            <Button variant="outline" className="gap-2">
              See all {totalReviews} reviews
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
