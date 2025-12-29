import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type CheckVerifiedPurchaseStepInput = {
  customer_id: string
  product_id: string
}

export const checkVerifiedPurchaseStep = createStep(
  "check-verified-purchase",
  async (input: CheckVerifiedPurchaseStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    try {
      const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "items.variant.product_id"],
        filters: {
          customer_id: input.customer_id,
        },
      })

      const hasOrdered = orders.some((order: any) =>
        order.items?.some((item: any) => item.variant?.product_id === input.product_id)
      )

      return new StepResponse({ verified: hasOrdered })
    } catch (error) {
      return new StepResponse({ verified: false })
    }
  }
)
