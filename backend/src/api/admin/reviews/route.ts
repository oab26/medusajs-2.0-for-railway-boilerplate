import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import ProductReviewModuleService from "../../../modules/product-review/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const reviewService = req.scope.resolve<ProductReviewModuleService>(
    PRODUCT_REVIEW_MODULE
  )

  const limit = parseInt(req.query.limit as string) || 20
  const offset = parseInt(req.query.offset as string) || 0
  const status = req.query.status as string | undefined

  const filters: Record<string, any> = {}
  if (status) {
    filters.status = status
  }

  const { data: reviews, metadata } = await query.graph({
    entity: "review",
    filters,
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
    pagination: {
      skip: offset,
      take: limit,
      order: {
        created_at: "DESC",
      },
    },
  })

  const reviewsWithImages = await Promise.all(
    reviews.map(async (review: any) => {
      const images = await reviewService.listReviewImages({
        review_id: review.id,
      })
      return {
        ...review,
        images: images.sort((a, b) => a.sort_order - b.sort_order),
      }
    })
  )

  res.json({
    reviews: reviewsWithImages,
    count: metadata?.count || reviews.length,
    limit,
    offset,
  })
}
