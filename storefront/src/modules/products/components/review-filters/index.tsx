"use client"

import { useState } from "react"
import clsx from "clsx"

export type SortOption = "recent" | "highest" | "lowest" | "with_media"

type ReviewFiltersProps = {
  ratingFilter: number | null
  onRatingFilterChange: (rating: number | null) => void
  withMediaFilter: boolean
  onWithMediaFilterChange: (value: boolean) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  className?: string
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
  { value: "with_media", label: "With Media" },
]

export default function ReviewFilters({
  ratingFilter,
  onRatingFilterChange,
  withMediaFilter,
  onWithMediaFilterChange,
  sortBy,
  onSortChange,
  className,
}: ReviewFiltersProps) {
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  return (
    <div
      className={clsx(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-y border-gray-200",
        className
      )}
    >
      {/* Left side filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Rating Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRatingDropdownOpen(!ratingDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:border-gray-400 transition-colors"
          >
            <span className="text-sm">
              {ratingFilter ? `${ratingFilter} Star${ratingFilter > 1 ? "s" : ""}` : "Rating"}
            </span>
            <svg
              className={clsx(
                "w-4 h-4 transition-transform",
                ratingDropdownOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {ratingDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onRatingFilterChange(null)
                  setRatingDropdownOpen(false)
                }}
                className={clsx(
                  "w-full px-4 py-2 text-left text-sm hover:bg-gray-50",
                  !ratingFilter && "bg-gray-50 font-medium"
                )}
              >
                All Ratings
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => {
                    onRatingFilterChange(rating)
                    setRatingDropdownOpen(false)
                  }}
                  className={clsx(
                    "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-1",
                    ratingFilter === rating && "bg-gray-50 font-medium"
                  )}
                >
                  <span>{rating}</span>
                  <span className="text-orange-400">★</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* With Media Toggle */}
        <button
          onClick={() => onWithMediaFilterChange(!withMediaFilter)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 border rounded transition-colors",
            withMediaFilter
              ? "border-gray-800 bg-gray-800 text-white"
              : "border-gray-300 hover:border-gray-400"
          )}
        >
          <span className="text-sm">With media</span>
          <div
            className={clsx(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
              withMediaFilter ? "border-white" : "border-gray-400"
            )}
          >
            {withMediaFilter && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
        </button>
      </div>

      {/* Right side sort */}
      <div className="relative">
        <button
          onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
          className="flex items-center gap-2 text-sm"
        >
          <span className="text-gray-500">Sort by:</span>
          <span className="font-medium">
            {sortOptions.find((o) => o.value === sortBy)?.label}
          </span>
          <svg
            className={clsx(
              "w-4 h-4 transition-transform",
              sortDropdownOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {sortDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[150px]">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value)
                  setSortDropdownOpen(false)
                }}
                className={clsx(
                  "w-full px-4 py-2 text-left text-sm hover:bg-gray-50",
                  sortBy === option.value && "bg-gray-50 font-medium"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
