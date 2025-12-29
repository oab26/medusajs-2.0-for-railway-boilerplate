"use client"

import clsx from "clsx"
import StarRating from "../star-rating"
import StarDistribution from "../star-distribution"

type RatingDistribution = {
  5: number
  4: number
  3: number
  2: number
  1: number
}

type ReviewSummaryProps = {
  averageRating: number
  totalCount: number
  distribution: RatingDistribution
  onWriteReview: () => void
  onFilterClick?: (rating: number | null) => void
  activeFilter?: number | null
  className?: string
}

export default function ReviewSummary({
  averageRating,
  totalCount,
  distribution,
  onWriteReview,
  onFilterClick,
  activeFilter,
  className,
}: ReviewSummaryProps) {
  return (
    <div
      className={clsx(
        "flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 py-6",
        className
      )}
    >
      {/* Rating Score */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-light">{averageRating.toFixed(1)}</span>
        </div>
        <StarRating rating={Math.round(averageRating)} size="lg" />
        <span className="text-sm text-gray-500 mt-1">
          {totalCount} review{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Vertical Divider */}
      <div className="hidden md:block w-px h-24 bg-gray-200" />

      {/* Rating Distribution */}
      <div className="flex-1 min-w-[200px] max-w-[300px]">
        <StarDistribution
          distribution={distribution}
          totalCount={totalCount}
          onFilterClick={onFilterClick}
          activeFilter={activeFilter}
        />
      </div>

      {/* Write Review Button */}
      <div className="md:ml-auto">
        <button
          onClick={onWriteReview}
          className="px-6 py-3 border-2 border-gray-800 text-gray-800 font-medium rounded hover:bg-gray-800 hover:text-white transition-colors"
        >
          Write A Review
        </button>
      </div>
    </div>
  )
}
