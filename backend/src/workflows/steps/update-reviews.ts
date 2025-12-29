import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"

export type UpdateReviewsStepInput = Array<{
  id: string
  status: "pending" | "approved" | "rejected"
}>

export const updateReviewsStep = createStep(
  "update-reviews",
  async (input: UpdateReviewsStepInput, { container }) => {
    const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

    const originalReviews = await Promise.all(
      input.map(async (item) => {
        const review = await reviewModuleService.retrieveReview(item.id)
        return { id: review.id, status: review.status }
      })
    )

    const updatedReviews = await Promise.all(
      input.map((item) =>
        reviewModuleService.updateReviews({
          id: item.id,
          status: item.status,
        })
      )
    )

    return new StepResponse(updatedReviews, originalReviews)
  },
  async (originalReviews, { container }) => {
    if (!originalReviews || originalReviews.length === 0) {
      return
    }

    const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

    await Promise.all(
      originalReviews.map((review: any) =>
        reviewModuleService.updateReviews({
          id: review.id,
          status: review.status,
        })
      )
    )
  }
)
