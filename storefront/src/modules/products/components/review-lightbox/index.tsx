"use client"

import { useEffect, useCallback } from "react"
import clsx from "clsx"
import Image from "next/image"
import StarRating from "../star-rating"
import ReviewAvatar from "../review-avatar"
import ReviewImageThumbnails, { ReviewImage } from "../review-image-thumbnails"

type Review = {
  id: string
  title?: string
  content: string
  rating: number
  first_name: string
  last_name: string
  verified_purchase: boolean
  created_at: string
  images?: ReviewImage[]
}

type ReviewLightboxProps = {
  review: Review
  selectedImageIndex: number
  onClose: () => void
  onImageChange: (index: number) => void
}

export default function ReviewLightbox({
  review,
  selectedImageIndex,
  onClose,
  onImageChange,
}: ReviewLightboxProps) {
  const images = review.images || []
  const currentImage = images[selectedImageIndex]

  const handlePrevious = useCallback(() => {
    if (selectedImageIndex > 0) {
      onImageChange(selectedImageIndex - 1)
    }
  }, [selectedImageIndex, onImageChange])

  const handleNext = useCallback(() => {
    if (selectedImageIndex < images.length - 1) {
      onImageChange(selectedImageIndex + 1)
    }
  }, [selectedImageIndex, images.length, onImageChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose, handlePrevious, handleNext])

  if (!currentImage) return null

  const formattedDate = new Date(review.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image Section */}
        <div className="relative flex-1 bg-gray-100 min-h-[300px] md:min-h-[500px]">
          <Image
            src={currentImage.url}
            alt={`Review image ${selectedImageIndex + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 60vw"
          />

          {/* Navigation Arrows */}
          {selectedImageIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-800/60 hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Previous image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          {selectedImageIndex < images.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-800/60 hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Next image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Review Details Section */}
        <div className="w-full md:w-[380px] p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
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
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>

          {/* Rating & Title */}
          <div className="mb-4">
            <StarRating rating={review.rating} size="md" />
            {review.title && (
              <h3 className="font-medium text-gray-900 mt-2">{review.title}</h3>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mb-4">
              <ReviewImageThumbnails
                images={images}
                selectedIndex={selectedImageIndex}
                onImageClick={onImageChange}
                size="sm"
              />
            </div>
          )}

          {/* Content */}
          <p className="text-gray-700 text-sm leading-relaxed">
            {review.content}
          </p>
        </div>
      </div>
    </div>
  )
}
