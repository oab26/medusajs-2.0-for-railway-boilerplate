import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addTierPromotionToCartWorkflow } from "../../../../../workflows/add-tier-promotion-to-cart"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params

  console.log("[APPLY TIER PROMO API] Cart:", id)

  try {
    await addTierPromotionToCartWorkflow(req.scope).run({
      input: {
        cart_id: id,
      },
    })
    console.log("[APPLY TIER PROMO API] Workflow completed successfully")
    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error("[APPLY TIER PROMO API] Error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
}
