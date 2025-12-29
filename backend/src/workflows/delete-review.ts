import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteReviewImagesStep } from "./steps/delete-review-images"
import { deleteReviewStep } from "./steps/delete-review"

type DeleteReviewWorkflowInput = {
  id: string
}

export const deleteReviewWorkflow = createWorkflow(
  "delete-review-workflow",
  (input: DeleteReviewWorkflowInput) => {
    deleteReviewImagesStep({ review_id: input.id })

    deleteReviewStep(input)

    return new WorkflowResponse({ deleted: true })
  }
)
