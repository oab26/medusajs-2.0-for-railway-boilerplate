import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { updateCustomerTierOnOrderWorkflow } from "../workflows/update-customer-tier-on-order"

export default async function tierOrderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  try {
    await updateCustomerTierOnOrderWorkflow(container).run({
      input: {
        order_id: data.id,
      },
    })
  } catch (error) {
    logger.error("Error updating customer tier:", error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
