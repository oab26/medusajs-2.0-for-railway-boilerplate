import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const reviewModuleService: ProductReviewModuleService =
    req.scope.resolve(PRODUCT_REVIEW_MODULE)

  const limit = parseInt(req.query.limit as string) || 10
  const offset = parseInt(req.query.offset as string) || 0

  const { data: reviews, metadata } = await query.graph({
    entity: "review",
    filters: {
      product_id: id,
      status: "approved",
    },
    fields: [
      "id",
      "title",
      "content",
      "rating",
      "first_name",
      "last_name",
      "verified_purchase",
      "created_at",
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
      const images = await reviewModuleService.listReviewImages({
        review_id: review.id,
      })
      return {
        ...review,
        images: images.sort((a, b) => a.sort_order - b.sort_order),
      }
    })
  )

  const averageRating = await reviewModuleService.getAverageRating(id)
  const totalCount = await reviewModuleService.getReviewCount(id, "approved")
  const ratingDistribution = await reviewModuleService.getRatingDistribution(id)

  res.json({
    reviews: reviewsWithImages,
    count: totalCount,
    limit,
    offset,
    average_rating: averageRating,
    rating_distribution: ratingDistribution,
  })
}
