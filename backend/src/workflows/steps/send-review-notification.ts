import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"
import { ADMIN_EMAIL } from "../../lib/constants"
import { EmailTemplates } from "../../modules/email-notifications/templates"

export type SendReviewNotificationStepInput = {
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
}

export const sendReviewNotificationStep = createStep(
  "send-review-notification",
  async (input: SendReviewNotificationStepInput, { container }) => {
    const notificationService: INotificationModuleService =
      container.resolve(Modules.NOTIFICATION)

    const adminEmail = ADMIN_EMAIL || "admin@example.com"
    const backendUrl = process.env.BACKEND_URL || "http://localhost:9000"

    try {
      await notificationService.createNotifications({
        to: adminEmail,
        channel: "email",
        template: EmailTemplates.NEW_REVIEW,
        data: {
          emailOptions: {
            subject: `New Review Pending: ${input.product_title}`,
          },
          review: input.review,
          product_title: input.product_title,
          admin_url: `${backendUrl}/app/reviews`,
        },
      })

      return new StepResponse({ sent: true })
    } catch (error) {
      console.error("Failed to send review notification:", error)
      return new StepResponse({ sent: false })
    }
  }
)
