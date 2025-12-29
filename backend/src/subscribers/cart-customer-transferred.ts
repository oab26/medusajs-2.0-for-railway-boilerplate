import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { addTierPromotionToCartWorkflow } from "../workflows/add-tier-promotion-to-cart"

export default async function cartCustomerTransferredHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("[CART CUSTOMER TRANSFERRED] Running tier promotion workflow for cart:", data.id)
  try {
    await addTierPromotionToCartWorkflow(container).run({
      input: {
        cart_id: data.id,
      },
    })
    console.log("[CART CUSTOMER TRANSFERRED] Workflow completed successfully")
  } catch (error) {
    console.error("[CART CUSTOMER TRANSFERRED] Workflow error:", error)
  }
}

export const config: SubscriberConfig = {
  event: "cart.customer_transferred",
}
