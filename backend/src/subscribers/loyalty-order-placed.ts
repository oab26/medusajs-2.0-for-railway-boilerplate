import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { handleOrderPointsWorkflow } from "../workflows/handle-order-points"

export default async function loyaltyPaymentCapturedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    const query = container.resolve("query")

    const { data: payments } = await query.graph({
      entity: "payment",
      fields: ["id", "payment_collection.order.id"],
      filters: { id: data.id },
    })

    const orderId = payments[0]?.payment_collection?.order?.id

    if (!orderId) {
      console.log("No order found for payment:", data.id)
      return
    }

    await handleOrderPointsWorkflow(container).run({
      input: {
        order_id: orderId,
      },
    })
  } catch (error) {
    console.error("Error processing loyalty points for payment:", error)
  }
}

export const config: SubscriberConfig = {
  event: "payment.captured",
}
