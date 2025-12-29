import {
  createWorkflow,
  WorkflowResponse,
  transform,
  when,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createReviewStep } from "./steps/create-review"
import { checkVerifiedPurchaseStep } from "./steps/check-verified-purchase"
import { sendReviewNotificationStep } from "./steps/send-review-notification"
import { uploadReviewImagesStep } from "./steps/upload-review-images"
import { createReviewImagesStep } from "./steps/create-review-images"

type FileInput = {
  filename: string
  mimeType: string
  content: string
}

type CreateReviewWorkflowInput = {
  title?: string
  content: string
  rating: number
  product_id: string
  customer_id?: string
  first_name: string
  last_name: string
  status?: "pending" | "approved" | "rejected"
  files?: FileInput[]
}

export const createReviewWorkflow = createWorkflow(
  "create-review-workflow",
  (input: CreateReviewWorkflowInput) => {
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: ["id", "title"],
      filters: {
        id: input.product_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    const verifiedResult = checkVerifiedPurchaseStep({
      customer_id: input.customer_id || "",
      product_id: input.product_id,
    })

    const reviewData = transform(
      { input, verifiedResult },
      ({ input, verifiedResult }) => ({
        title: input.title,
        content: input.content,
        rating: input.rating,
        product_id: input.product_id,
        customer_id: input.customer_id,
        first_name: input.first_name,
        last_name: input.last_name,
        status: input.status || "pending",
        verified_purchase: input.customer_id ? (verifiedResult?.verified || false) : false,
      })
    )

    const review = createReviewStep(reviewData)

    const filesToUpload = transform({ input }, ({ input }) => ({
      files: input.files || [],
    }))

    const { uploadedFiles } = uploadReviewImagesStep(filesToUpload)

    const createImagesInput = transform(
      { review, uploadedFiles },
      ({ review, uploadedFiles }) => ({
        review_id: review.id,
        files: uploadedFiles || [],
      })
    )

    const images = createReviewImagesStep(createImagesInput)

    const productTitle = transform(
      { products },
      ({ products }) => (products as any)[0]?.title || "Unknown Product"
    )

    const notificationData = transform(
      { review, productTitle },
      ({ review, productTitle }) => ({
        review: {
          id: review.id,
          title: review.title,
          content: review.content,
          rating: review.rating,
          first_name: review.first_name,
          last_name: review.last_name,
          verified_purchase: review.verified_purchase,
        },
        product_title: productTitle,
      })
    )

    sendReviewNotificationStep(notificationData)

    const result = transform({ review, images }, ({ review, images }) => ({
      review: {
        ...review,
        images: images || [],
      },
    }))

    return new WorkflowResponse(result)
  }
)
