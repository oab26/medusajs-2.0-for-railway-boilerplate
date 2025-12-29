import {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { addTierPromotionToCartWorkflow } from "../workflows/add-tier-promotion-to-cart"

export default async function cartUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("[CART UPDATED SUBSCRIBER] Running tier promotion workflow for cart:", data.id)
  try {
    await addTierPromotionToCartWorkflow(container).run({
      input: {
        cart_id: data.id,
      },
    })
    console.log("[CART UPDATED SUBSCRIBER] Workflow completed successfully")
  } catch (error) {
    console.error("[CART UPDATED SUBSCRIBER] Workflow error:", error)
  }
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}

