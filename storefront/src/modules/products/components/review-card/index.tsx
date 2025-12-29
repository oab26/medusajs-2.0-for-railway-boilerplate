"use client"

import { Review } from "@lib/data/reviews"
import StarRating from "../star-rating"
import ReviewAvatar from "../review-avatar"
import ReviewImageThumbnails from "../review-image-thumbnails"

type ReviewCardProps = {
  review: Review
  onImageClick?: (reviewId: string, imageIndex: number) => void
}

export default function ReviewCard({ review, onImageClick }: ReviewCardProps) {
  const formattedDate = new Date(review.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })

  return (
    <div className="py-6 border-b border-gray-200 last:border-0">
      {/* Header Row: Avatar + Info | Stars + Title | Date */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
        {/* Avatar and Name */}
        <div className="flex items-center gap-3 sm:min-w-[150px]">
          <ReviewAvatar
            firstName={review.first_name}
            lastName={review.last_name}
            verified={review.verified_purchase}
            size="md"
          />
          <div>
            <p className="font-medium text-gray-900">
              {review.first_name} {review.last_name.charAt(0)}.
            </p>
            {review.verified_purchase && (
              <p className="text-xs text-gray-500">Verified Buyer</p>
            )}
          </div>
        </div>

        {/* Rating and Title */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            {review.title && (
              <span className="font-medium text-gray-900">{review.title}</span>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="text-sm text-gray-500 sm:text-right">
          {formattedDate}
        </div>
      </div>

      {/* Content */}
      <div className="text-gray-700 text-sm leading-relaxed mb-4">
        {review.content}
      </div>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <ReviewImageThumbnails
          images={review.images}
          onImageClick={(index) => onImageClick?.(review.id, index)}
          size="md"
        />
      )}
    </div>
  )
}
