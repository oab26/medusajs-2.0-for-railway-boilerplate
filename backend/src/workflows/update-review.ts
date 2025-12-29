import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateReviewsStep } from "./steps/update-reviews"

type UpdateReviewWorkflowInput = Array<{
  id: string
  status: "pending" | "approved" | "rejected"
}>

export const updateReviewWorkflow = createWorkflow(
  "update-review-workflow",
  (input: UpdateReviewWorkflowInput) => {
    const reviews = updateReviewsStep(input)

    return new WorkflowResponse({ reviews })
  }
)
