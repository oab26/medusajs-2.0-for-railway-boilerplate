import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { deleteReviewWorkflow } from "../../../../workflows/delete-review"
import { PRODUCT_REVIEW_MODULE } from "../../../../modules/product-review"
import ProductReviewModuleService from "../../../../modules/product-review/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const reviewService = req.scope.resolve<ProductReviewModuleService>(
    PRODUCT_REVIEW_MODULE
  )

  const { data: reviews } = await query.graph({
    entity: "review",
    filters: {
      id,
    },
    fields: [
      "id",
      "title",
      "content",
      "rating",
      "status",
      "first_name",
      "last_name",
      "verified_purchase",
      "product_id",
      "customer_id",
      "created_at",
      "updated_at",
      "product.*",
    ],
  })

  if (!reviews || reviews.length === 0) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Review not found")
  }

  const images = await reviewService.listReviewImages({
    review_id: id,
  })

  res.json({
    review: {
      ...reviews[0],
      images: images.sort((a, b) => a.sort_order - b.sort_order),
    },
  })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  await deleteReviewWorkflow(req.scope).run({
    input: { id },
  })

  res.status(204).send()
}
