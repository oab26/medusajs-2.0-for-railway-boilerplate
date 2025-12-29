"use client"

import { useState } from "react"
import clsx from "clsx"

type StarRatingProps = {
  rating: number
  size?: "sm" | "md" | "lg" | "xl"
  interactive?: boolean
  variant?: "filled" | "outline"
  onRatingChange?: (rating: number) => void
  className?: string
}

const sizeClasses = {
  sm: "text-sm gap-0.5",
  md: "text-xl gap-0.5",
  lg: "text-2xl gap-1",
  xl: "text-3xl gap-1",
}

export default function StarRating({
  rating,
  size = "md",
  interactive = false,
  variant = "filled",
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const displayRating = hoverRating || rating

  const getStarContent = (star: number) => {
    if (variant === "outline") {
      return star <= displayRating ? "★" : "☆"
    }
    return "★"
  }

  const getStarColor = (star: number) => {
    if (variant === "outline") {
      return star <= displayRating
        ? "text-orange-400"
        : "text-orange-300"
    }
    return star <= displayRating ? "text-orange-400" : "text-gray-200"
  }

  return (
    <div className={clsx("flex items-center", sizeClasses[size], className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={clsx(
            "transition-all duration-150",
            getStarColor(star),
            interactive && "cursor-pointer hover:scale-110"
          )}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? `Rate ${star} star${star > 1 ? "s" : ""}` : undefined}
        >
          {getStarContent(star)}
        </span>
      ))}
    </div>
  )
}
