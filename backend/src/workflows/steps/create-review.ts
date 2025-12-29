import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"

export type CreateReviewStepInput = {
  title?: string
  content: string
  rating: number
  product_id: string
  customer_id?: string
  first_name: string
  last_name: string
  status?: "pending" | "approved" | "rejected"
  verified_purchase?: boolean
}

export const createReviewStep = createStep(
  "create-review",
  async (input: CreateReviewStepInput, { container }) => {
    const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

    const review = await reviewModuleService.createReviews({
      title: input.title || null,
      content: input.content,
      rating: input.rating,
      product_id: input.product_id,
      customer_id: input.customer_id || null,
      first_name: input.first_name,
      last_name: input.last_name,
      status: input.status || "pending",
      verified_purchase: input.verified_purchase || false,
    })

    return new StepResponse(review, review.id)
  },
  async (reviewId, { container }) => {
    if (!reviewId) {
      return
    }

    const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
    await reviewModuleService.deleteReviews(reviewId)
  }
)
