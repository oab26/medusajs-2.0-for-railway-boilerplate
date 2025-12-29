import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import LoyaltyModuleService from "../../modules/loyalty/service"
import { LOYALTY_MODULE } from "../../modules/loyalty"
import { CartData, getCartLoyaltyPromotion } from "../../utils/promo"
import { MedusaError } from "@medusajs/framework/utils"

completeCartWorkflow.hooks.validate(
  async ({ cart }, { container }) => {
    const query = container.resolve("query")
    const loyaltyModuleService: LoyaltyModuleService = container.resolve(
      LOYALTY_MODULE
    )

    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "promotions.*",
        "customer.*",
        "customer.tier.*",
        "promotions.rules.*",
        "promotions.rules.values.*",
        "promotions.application_method.*",
        "metadata"
      ],
      filters: {
        id: cart.id
      }
    }, {
      throwIfKeyNotFound: true
    })

    const detailedCart = carts[0]

    // --- Loyalty Points Validation ---
    const loyaltyPromo = getCartLoyaltyPromotion(detailedCart as unknown as CartData)

    if (loyaltyPromo) {
      const customerLoyaltyPoints = await loyaltyModuleService.getPoints(detailedCart.customer!.id)
      const requiredPoints = await loyaltyModuleService.calculatePointsFromAmount(loyaltyPromo.application_method!.value as number)

      if (customerLoyaltyPoints < requiredPoints) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Customer does not have enough loyalty points. Required: ${requiredPoints}, Available: ${customerLoyaltyPoints}`
        )
      }
    }

    // --- Tier Promotion Validation ---
    if (detailedCart?.promotions && detailedCart.promotions.length > 0) {
      const customerTier = (detailedCart.customer as any)?.tier

      const { data: allTiers } = await query.graph({
        entity: "tier",
        fields: ["id", "promo_id"],
        filters: {
          promo_id: detailedCart.promotions.map((p: any) => p?.id).filter(Boolean) as string[]
        }
      })

      for (const promotion of detailedCart.promotions) {
        const tierId = allTiers.find((t: any) => t.promo_id === (promotion as any)?.id)?.id
        if (tierId && customerTier?.id !== tierId) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Promotion ${(promotion as any)?.code || (promotion as any)?.id} can only be applied by customers in the corresponding tier.`
          )
        }
      }
    }
  }
)
