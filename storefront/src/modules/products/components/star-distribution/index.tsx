"use client"

import clsx from "clsx"

type RatingDistribution = {
  5: number
  4: number
  3: number
  2: number
  1: number
}

type StarDistributionProps = {
  distribution: RatingDistribution
  totalCount: number
  onFilterClick?: (rating: number | null) => void
  activeFilter?: number | null
  className?: string
}

export default function StarDistribution({
  distribution,
  totalCount,
  onFilterClick,
  activeFilter,
  className,
}: StarDistributionProps) {
  const ratings = [5, 4, 3, 2, 1] as const

  const getPercentage = (count: number) => {
    if (totalCount === 0) return 0
    return (count / totalCount) * 100
  }

  return (
    <div className={clsx("space-y-2", className)}>
      {ratings.map((rating) => {
        const count = distribution[rating]
        const percentage = getPercentage(count)
        const isActive = activeFilter === rating

        return (
          <button
            key={rating}
            onClick={() => onFilterClick?.(isActive ? null : rating)}
            className={clsx(
              "flex items-center gap-2 w-full group",
              onFilterClick && "cursor-pointer hover:opacity-80",
              isActive && "font-medium"
            )}
          >
            <span className="flex items-center gap-1 w-8 text-sm">
              <span>{rating}</span>
              <span className="text-orange-400">★</span>
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full transition-all duration-300",
                  isActive ? "bg-orange-500" : "bg-gray-800"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-sm text-right text-gray-600">
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
