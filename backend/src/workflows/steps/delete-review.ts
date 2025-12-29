import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"

export type DeleteReviewStepInput = {
  id: string
}

export const deleteReviewStep = createStep(
  "delete-review",
  async (input: DeleteReviewStepInput, { container }) => {
    const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

    const review = await reviewModuleService.retrieveReview(input.id)

    await reviewModuleService.deleteReviews(input.id)

    return new StepResponse({ deleted: true }, review)
  },
  async (review, { container }) => {
    if (!review) {
      return
    }

    const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

    await reviewModuleService.createReviews({
      title: review.title,
      content: review.content,
      rating: review.rating,
      product_id: review.product_id,
      customer_id: review.customer_id,
      first_name: review.first_name,
      last_name: review.last_name,
      status: review.status,
      verified_purchase: review.verified_purchase,
    })
  }
)
