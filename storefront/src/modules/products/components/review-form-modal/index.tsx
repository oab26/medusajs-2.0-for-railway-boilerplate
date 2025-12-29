"use client"

import { useState, useRef, useEffect } from "react"
import { submitReview } from "@lib/data/reviews"
import StarRating from "../star-rating"
import { useRouter } from "next/navigation"
import clsx from "clsx"

type ReviewFormModalProps = {
  productId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ReviewFormModal({
  productId,
  isOpen,
  onClose,
  onSuccess,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState(0)
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 3) {
      setError("Maximum 3 images allowed")
      return
    }
    setImages((prev) => [...prev, ...files].slice(0, 3))
    setError(null)
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set("rating", rating.toString())
    formData.set("product_id", productId)

    images.forEach((image) => {
      formData.append("images", image)
    })

    try {
      await submitReview(formData)
      setSuccess(true)
      onSuccess?.()
      router.refresh()
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setRating(0)
        setImages([])
        formRef.current?.reset()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setRating(0)
    setImages([])
    setError(null)
    setSuccess(false)
    formRef.current?.reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={resetAndClose}
    >
      <div
        className="relative bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-medium text-center">Share your thoughts</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900">
                Thank you for your review!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Your review has been submitted and is pending approval.
              </p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate your experience <span className="text-red-500">*</span>
                </label>
                <StarRating
                  rating={rating}
                  interactive
                  variant="outline"
                  onRatingChange={setRating}
                  size="xl"
                />
              </div>

              {/* Review Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Write a review <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  required
                  minLength={10}
                  rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  placeholder="Tell us what you like or dislike"
                />
              </div>

              {/* Title/Headline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a headline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  placeholder="Summarize your experience"
                />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add photos (optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex gap-2">
                  {[0, 1, 2].map((index) => {
                    const image = images[index]
                    return (
                      <div
                        key={index}
                        className={clsx(
                          "relative w-16 h-16 border-2 border-dashed rounded flex items-center justify-center",
                          image ? "border-transparent" : "border-gray-300"
                        )}
                      >
                        {image ? (
                          <>
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-gray-700"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={images.length >= 3}
                            className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">
                  {error}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">* required fields</span>
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="px-6 py-2 border border-gray-800 text-gray-800 font-medium rounded hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
