import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  StatusBadge,
  Toaster,
  toast,
} from "@medusajs/ui"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircleSolid, XCircleSolid, ArrowLeft } from "@medusajs/icons"
import { sdk } from "../../../lib/sdk"
import { Review } from "../page"

type ReviewResponse = {
  review: Review
}

const ReviewDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryFn: () =>
      sdk.client.fetch<ReviewResponse>(`/admin/reviews/${id}`, {
        method: "GET",
      }),
    queryKey: ["review", id],
  })

  const updateStatus = useMutation({
    mutationFn: (status: string) =>
      sdk.client.fetch("/admin/reviews/status", {
        method: "POST",
        body: { ids: [id], status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review", id] })
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
      toast.success("Review status updated")
    },
    onError: () => {
      toast.error("Failed to update review status")
    },
  })

  const deleteReview = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/reviews/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Review deleted")
      navigate("/reviews")
    },
    onError: () => {
      toast.error("Failed to delete review")
    },
  })

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text>Loading...</Text>
      </Container>
    )
  }

  const review = data?.review

  if (!review) {
    return (
      <Container className="p-6">
        <Text>Review not found</Text>
      </Container>
    )
  }

  const statusColor =
    review.status === "approved"
      ? "green"
      : review.status === "rejected"
      ? "red"
      : "grey"

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="transparent" onClick={() => navigate("/reviews")}>
            <ArrowLeft />
          </Button>
          <Heading level="h1">Review Details</Heading>
          <StatusBadge color={statusColor}>
            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
          </StatusBadge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => updateStatus.mutate("approved")}
            disabled={review.status === "approved"}
          >
            <CheckCircleSolid className="mr-1" /> Approve
          </Button>
          <Button
            variant="secondary"
            onClick={() => updateStatus.mutate("rejected")}
            disabled={review.status === "rejected"}
          >
            <XCircleSolid className="mr-1" /> Reject
          </Button>
          <Button variant="danger" onClick={() => deleteReview.mutate()}>
            Delete
          </Button>
        </div>
      </div>

      <div className="p-6 grid gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Text className="text-ui-fg-muted text-sm">Customer</Text>
              <Text className="font-medium">
                {review.first_name} {review.last_name}
              </Text>
              {review.verified_purchase && (
                <Badge color="green" className="mt-1">
                  <CheckCircleSolid className="w-3 h-3 mr-1" /> Verified
                  Purchase
                </Badge>
              )}
            </div>

            <div>
              <Text className="text-ui-fg-muted text-sm">Rating</Text>
              <Text className="text-xl text-yellow-500">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </Text>
            </div>

            <div>
              <Text className="text-ui-fg-muted text-sm">Product</Text>
              {review.product ? (
                <Link
                  to={`/products/${review.product.id}`}
                  className="text-ui-fg-interactive hover:underline"
                >
                  {review.product.title}
                </Link>
              ) : (
                <Text>{review.product_id}</Text>
              )}
            </div>

            <div>
              <Text className="text-ui-fg-muted text-sm">Date</Text>
              <Text>{new Date(review.created_at).toLocaleString()}</Text>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Text className="text-ui-fg-muted text-sm">Title</Text>
              <Text className="font-medium">
                {review.title || <span className="text-ui-fg-muted">-</span>}
              </Text>
            </div>

            <div>
              <Text className="text-ui-fg-muted text-sm">Content</Text>
              <div className="p-4 bg-ui-bg-subtle rounded-lg mt-1">
                <Text>{review.content}</Text>
              </div>
            </div>
          </div>
        </div>

        {review.images && review.images.length > 0 && (
          <div>
            <Text className="text-ui-fg-muted text-sm mb-2">
              Images ({review.images.length})
            </Text>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {review.images.map((image) => (
                <a
                  key={image.id}
                  href={image.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square rounded-lg overflow-hidden border border-ui-border-base hover:border-ui-border-interactive transition-colors"
                >
                  <img
                    src={image.url}
                    alt="Review image"
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
      <Toaster />
    </Container>
  )
}

export default ReviewDetailPage
