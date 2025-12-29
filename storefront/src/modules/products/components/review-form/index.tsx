"use client"

import { useState, useRef } from "react"
import { submitReview } from "@lib/data/reviews"
import StarRating from "../star-rating"
import { useRouter } from "next/navigation"

type ReviewFormProps = {
  productId: string
  onSuccess?: () => void
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

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
      setRating(0)
      setImages([])
      formRef.current?.reset()
      onSuccess?.()
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
        <p className="font-medium">Thank you for your review!</p>
        <p className="text-sm mt-1">
          Your review has been submitted and is pending approval.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm underline mt-2"
        >
          Submit another review
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Rating *</label>
        <StarRating
          rating={rating}
          interactive
          onRatingChange={setRating}
          size="lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <input
            type="text"
            name="first_name"
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <input
            type="text"
            name="last_name"
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Title (optional)
        </label>
        <input
          type="text"
          name="title"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Summarize your review"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Review *</label>
        <textarea
          name="content"
          required
          minLength={10}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Share your experience with this product..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Images (optional, max 3)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= 3}
          className="border-2 border-dashed rounded-lg px-4 py-2 text-gray-600 hover:border-gray-400 disabled:opacity-50"
        >
          + Add Images
        </button>

        {images.length > 0 && (
          <div className="flex gap-2 mt-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full bg-black text-white py-3 rounded-lg disabled:opacity-50 hover:bg-gray-800 transition"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}
