import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateCartPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { PromotionActions } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id: cartId } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Get cart with promotions
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id", "promotions.id", "promotions.code"],
    filters: { id: cartId },
  })

  if (!carts.length) {
    return res.status(404).json({ message: "Cart not found" })
  }

  const cart = carts[0]

  // Get all tier promotion IDs
  const { data: allTiers } = await query.graph({
    entity: "tier",
    fields: ["id", "promo_id"],
  })

  const tierPromoIds = allTiers.map((t: any) => t.promo_id).filter(Boolean)

  // Find tier promotions on the cart
  const tierPromoCodes = cart.promotions
    ?.filter((p: any) => tierPromoIds.includes(p.id))
    ?.map((p: any) => p.code)
    ?.filter(Boolean) || []

  console.log("[REMOVE TIER PROMOS API] Cart:", cartId)
  console.log("[REMOVE TIER PROMOS API] Tier promo codes to remove:", tierPromoCodes)

  if (tierPromoCodes.length === 0) {
    return res.json({ success: true, removed: [] })
  }

  // Remove tier promotions
  await updateCartPromotionsWorkflow(req.scope).run({
    input: {
      cart_id: cartId,
      promo_codes: tierPromoCodes,
      action: PromotionActions.REMOVE,
    },
  })

  console.log("[REMOVE TIER PROMOS API] Removed tier promotions:", tierPromoCodes)

  return res.json({ success: true, removed: tierPromoCodes })
}
