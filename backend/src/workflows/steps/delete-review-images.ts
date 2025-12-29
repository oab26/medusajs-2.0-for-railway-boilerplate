import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import { Modules } from "@medusajs/framework/utils"

export type DeleteReviewImagesStepInput = {
  review_id: string
}

export const deleteReviewImagesStep = createStep(
  "delete-review-images",
  async (input: DeleteReviewImagesStepInput, { container }) => {
    const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
    const fileModuleService = container.resolve(Modules.FILE)

    const images = await reviewModuleService.listReviewImages({
      review_id: input.review_id,
    })

    const fileIds = images.map((img: any) => img.file_id)

    for (const image of images) {
      await reviewModuleService.deleteReviewImages(image.id)
    }

    if (fileIds.length > 0) {
      try {
        await fileModuleService.deleteFiles(fileIds)
      } catch (error) {
        console.error("Failed to delete files from storage:", error)
      }
    }

    return new StepResponse({ deleted: images.length })
  }
)
