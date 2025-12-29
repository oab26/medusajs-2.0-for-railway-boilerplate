import { sdk } from "@lib/config"
import { cache } from "react"

export type ReviewImage = {
  id: string
  url: string
  file_id: string
  sort_order: number
}

export type Review = {
  id: string
  title?: string
  content: string
  rating: number
  first_name: string
  last_name: string
  verified_purchase: boolean
  created_at: string
  images: ReviewImage[]
}

export type RatingDistribution = {
  5: number
  4: number
  3: number
  2: number
  1: number
}

export type ReviewsResponse = {
  reviews: Review[]
  count: number
  limit: number
  offset: number
  average_rating: number
  rating_distribution: RatingDistribution
}

export const getProductReviews = cache(async function (
  productId: string,
  params?: { limit?: number; offset?: number }
): Promise<ReviewsResponse> {
  const query = new URLSearchParams()
  query.set("limit", String(params?.limit || 10))
  query.set("offset", String(params?.offset || 0))

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/products/${productId}/reviews?${query}`,
    {
      headers,
      next: { tags: ["reviews"] },
    }
  )

  if (!response.ok) {
    return {
      reviews: [],
      count: 0,
      limit: 10,
      offset: 0,
      average_rating: 0,
      rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    }
  }

  return response.json()
})

export async function submitReview(formData: FormData): Promise<{ review: Review }> {
  const headers: HeadersInit = {}

  if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/reviews`,
    {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to submit review")
  }

  return response.json()
}
