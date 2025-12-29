import { Text, Section, Hr, Button } from "@react-email/components"
import * as React from "react"
import { Base } from "./base"

export const NEW_REVIEW = "new-review"

interface NewReviewPreviewProps {
  review: {
    id: string
    title?: string
    content: string
    rating: number
    first_name: string
    last_name: string
    verified_purchase: boolean
  }
  product_title: string
  admin_url: string
}

export interface NewReviewTemplateProps {
  review: {
    id: string
    title?: string
    content: string
    rating: number
    first_name: string
    last_name: string
    verified_purchase: boolean
  }
  product_title: string
  admin_url: string
  preview?: string
}

export const isNewReviewTemplateData = (
  data: any
): data is NewReviewTemplateProps =>
  typeof data.review === "object" && typeof data.product_title === "string"

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <Text style={{ margin: "0 0 10px", fontSize: "18px" }}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)} ({rating}/5)
    </Text>
  )
}

export const NewReviewTemplate: React.FC<NewReviewTemplateProps> & {
  PreviewProps: NewReviewPreviewProps
} = ({
  review,
  product_title,
  admin_url,
  preview = "A new review is pending approval",
}) => {
  return (
    <Base preview={preview}>
      <Section>
        <Text
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            margin: "0 0 30px",
          }}
        >
          New Review Pending Approval
        </Text>

        <Text style={{ margin: "0 0 15px" }}>
          A new review has been submitted for <strong>{product_title}</strong>{" "}
          and requires your approval.
        </Text>

        <Hr style={{ margin: "20px 0" }} />

        <Text
          style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 10px" }}
        >
          Review Details
        </Text>

        <Text style={{ margin: "0 0 5px" }}>
          <strong>Customer:</strong> {review.first_name} {review.last_name}
        </Text>

        {review.verified_purchase && (
          <Text style={{ margin: "0 0 5px", color: "#16a34a" }}>
            ✓ Verified Purchase
          </Text>
        )}

        <StarRating rating={review.rating} />

        {review.title && (
          <Text style={{ margin: "0 0 5px", fontWeight: "bold" }}>
            {review.title}
          </Text>
        )}

        <Text
          style={{
            margin: "0 0 20px",
            padding: "15px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
          }}
        >
          "{review.content}"
        </Text>

        <Hr style={{ margin: "20px 0" }} />

        <Button
          href={admin_url}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Review in Admin Dashboard
        </Button>
      </Section>
    </Base>
  )
}

NewReviewTemplate.PreviewProps = {
  review: {
    id: "test-review-id",
    title: "Great product!",
    content:
      "This is an amazing product. I highly recommend it to everyone. The quality is superb and it arrived on time.",
    rating: 5,
    first_name: "John",
    last_name: "Doe",
    verified_purchase: true,
  },
  product_title: "Premium Widget",
  admin_url: "http://localhost:9000/app/reviews",
} as NewReviewPreviewProps

export default NewReviewTemplate
