import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import { Modules } from "@medusajs/framework/utils"

export type CreateReviewImagesStepInput = {
  review_id: string
  files: Array<{ id: string; url: string }>
}

export const createReviewImagesStep = createStep(
  "create-review-images",
  async (input: CreateReviewImagesStepInput, { container }) => {
    const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

    const images = await Promise.all(
      input.files.map((file, index) =>
        reviewModuleService.createReviewImages({
          file_id: file.id,
          url: file.url,
          review_id: input.review_id,
          sort_order: index,
        })
      )
    )

    return new StepResponse(
      images,
      { review_id: input.review_id, file_ids: input.files.map((f) => f.id) }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
    const fileModuleService = container.resolve(Modules.FILE)

    const images = await reviewModuleService.listReviewImages({
      review_id: compensationData.review_id,
    })

    for (const image of images) {
      await reviewModuleService.deleteReviewImages(image.id)
    }

    await fileModuleService.deleteFiles(compensationData.file_ids)
  }
)
