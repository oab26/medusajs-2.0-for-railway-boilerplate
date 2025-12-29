"use client"

import { useState, useEffect, useMemo } from "react"
import { Review, ReviewsResponse, RatingDistribution } from "@lib/data/reviews"
import ReviewSummary from "../review-summary"
import ReviewFilters, { SortOption } from "../review-filters"
import ReviewCard from "../review-card"
import ReviewPagination from "../review-pagination"
import ReviewLightbox from "../review-lightbox"
import ReviewFormModal from "../review-form-modal"

type ReviewsSectionProps = {
  productId: string
  initialData: ReviewsResponse
}

const REVIEWS_PER_PAGE = 5

export default function ReviewsSection({
  productId,
  initialData,
}: ReviewsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [withMediaFilter, setWithMediaFilter] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [lightboxData, setLightboxData] = useState<{
    review: Review
    imageIndex: number
  } | null>(null)

  const {
    reviews: allReviews,
    average_rating,
    count: totalCount,
    rating_distribution,
  } = initialData

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...allReviews]

    if (ratingFilter !== null) {
      result = result.filter((r) => r.rating === ratingFilter)
    }

    if (withMediaFilter) {
      result = result.filter((r) => r.images && r.images.length > 0)
    }

    switch (sortBy) {
      case "highest":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "lowest":
        result.sort((a, b) => a.rating - b.rating)
        break
      case "with_media":
        result.sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0))
        break
      case "recent":
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }

    return result
  }, [allReviews, ratingFilter, withMediaFilter, sortBy])

  const totalPages = Math.ceil(filteredAndSortedReviews.length / REVIEWS_PER_PAGE)

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE
    return filteredAndSortedReviews.slice(start, start + REVIEWS_PER_PAGE)
  }, [filteredAndSortedReviews, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [ratingFilter, withMediaFilter, sortBy])

  const handleImageClick = (reviewId: string, imageIndex: number) => {
    const review = allReviews.find((r) => r.id === reviewId)
    if (review) {
      setLightboxData({ review, imageIndex })
    }
  }

  const handleFilterClick = (rating: number | null) => {
    setRatingFilter(rating)
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      {/* Summary Section */}
      <ReviewSummary
        averageRating={average_rating || 0}
        totalCount={totalCount}
        distribution={rating_distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }}
        onWriteReview={() => setFormModalOpen(true)}
        onFilterClick={handleFilterClick}
        activeFilter={ratingFilter}
      />

      {/* Filters */}
      <ReviewFilters
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        withMediaFilter={withMediaFilter}
        onWithMediaFilterChange={setWithMediaFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Reviews List */}
      <div className="mt-6">
        {paginatedReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {totalCount === 0
                ? "No reviews yet. Be the first to review this product!"
                : "No reviews match your filters."}
            </p>
            {totalCount === 0 && (
              <button
                onClick={() => setFormModalOpen(true)}
                className="mt-4 px-6 py-2 border-2 border-gray-800 text-gray-800 font-medium rounded hover:bg-gray-800 hover:text-white transition-colors"
              >
                Write A Review
              </button>
            )}
          </div>
        ) : (
          <div>
            {paginatedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <ReviewPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-8"
        />
      )}

      {/* Form Modal */}
      <ReviewFormModal
        productId={productId}
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
      />

      {/* Lightbox */}
      {lightboxData && (
        <ReviewLightbox
          review={lightboxData.review}
          selectedImageIndex={lightboxData.imageIndex}
          onClose={() => setLightboxData(null)}
          onImageChange={(index) =>
            setLightboxData((prev) =>
              prev ? { ...prev, imageIndex: index } : null
            )
          }
        />
      )}
    </div>
  )
}
