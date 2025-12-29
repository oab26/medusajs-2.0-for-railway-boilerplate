import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type UploadReviewImagesInput = {
  files: {
    filename: string
    mimeType: string
    content: string
  }[]
}

export const uploadReviewImagesStep = createStep(
  "upload-review-images-step",
  async (input: UploadReviewImagesInput, { container }) => {
    if (!input.files || input.files.length === 0) {
      return new StepResponse({ uploadedFiles: [] }, [])
    }

    const fileModuleService = container.resolve(Modules.FILE)

    const uploadedFiles = await fileModuleService.createFiles(
      input.files.map((file) => ({
        filename: file.filename,
        mimeType: file.mimeType,
        content: file.content,
        access: "public",
      }))
    )

    const fileIds = uploadedFiles.map((f) => f.id)

    return new StepResponse({ uploadedFiles }, fileIds)
  },
  async (fileIds: string[], { container }) => {
    if (!fileIds || fileIds.length === 0) {
      return
    }

    const fileModuleService = container.resolve(Modules.FILE)
    await fileModuleService.deleteFiles(fileIds)
  }
)
