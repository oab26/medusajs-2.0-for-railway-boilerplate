import { MedusaService } from "@medusajs/framework/utils"
import { Review, ReviewImage } from "./models"

class ProductReviewModuleService extends MedusaService({
  Review,
  ReviewImage,
}) {
  async getAverageRating(productId: string): Promise<number> {
    const reviews = await this.listReviews({
      product_id: productId,
      status: "approved",
    })

    if (reviews.length === 0) {
      return 0
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return parseFloat((sum / reviews.length).toFixed(2))
  }

  async getReviewCount(
    productId: string,
    status?: "pending" | "approved" | "rejected"
  ): Promise<number> {
    const filters: Record<string, any> = { product_id: productId }
    if (status) {
      filters.status = status
    }

    const reviews = await this.listReviews(filters)
    return reviews.length
  }

  async getRatingDistribution(
    productId: string
  ): Promise<{ 5: number; 4: number; 3: number; 2: number; 1: number }> {
    const reviews = await this.listReviews({
      product_id: productId,
      status: "approved",
    })

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    for (const review of reviews) {
      const rating = review.rating as 1 | 2 | 3 | 4 | 5
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++
      }
    }

    return distribution
  }
}

export default ProductReviewModuleService
