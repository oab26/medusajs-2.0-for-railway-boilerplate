"use client"

import clsx from "clsx"
import Image from "next/image"

export type ReviewImage = {
  id: string
  url: string
  file_id: string
  sort_order: number
}

type ReviewImageThumbnailsProps = {
  images: ReviewImage[]
  onImageClick?: (index: number) => void
  selectedIndex?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-20 h-20",
}

export default function ReviewImageThumbnails({
  images,
  onImageClick,
  selectedIndex,
  size = "md",
  className,
}: ReviewImageThumbnailsProps) {
  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {images.map((image, index) => (
        <button
          key={image.id}
          onClick={() => onImageClick?.(index)}
          className={clsx(
            "relative rounded-lg overflow-hidden border-2 transition-all",
            sizeClasses[size],
            selectedIndex === index
              ? "border-gray-800"
              : "border-transparent hover:border-gray-300",
            onImageClick && "cursor-pointer"
          )}
        >
          <Image
            src={image.url}
            alt={`Review image ${index + 1}`}
            fill
            className="object-cover"
            sizes="80px"
          />
        </button>
      ))}
    </div>
  )
}
