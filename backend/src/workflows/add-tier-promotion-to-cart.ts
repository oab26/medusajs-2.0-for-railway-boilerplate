import {
  createWorkflow,
  WorkflowResponse,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep, updateCartPromotionsWorkflow, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { PromotionActions } from "@medusajs/framework/utils"
import { validateTierPromotionStep } from "./steps/validate-tier-promotion"

export type AddTierPromotionToCartWorkflowInput = {
  cart_id: string
}

export const addTierPromotionToCartWorkflow = createWorkflow(
  "add-tier-promotion-to-cart",
  (input: AddTierPromotionToCartWorkflowInput) => {
    // Get cart with customer, tier, and promotions
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: [
        "id",
        "customer.id",
        "customer.has_account",
        "customer.tier.*",
        "customer.tier.promotion.id",
        "customer.tier.promotion.code",
        "customer.tier.promotion.status",
        "promotions.*",
        "promotions.code",
      ],
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    // Get all tiers to identify tier promotions
    const { data: allTiers } = useQueryGraphStep({
      entity: "tier",
      fields: ["id", "promo_id"],
    }).config({ name: "get-all-tiers" })

    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 10,
    })

    // Find tier promotion codes currently applied to cart
    const tierPromoCodesToRemove = transform({ carts, allTiers }, (data) => {
      const tierPromoIds = data.allTiers.map((t: any) => t.promo_id).filter(Boolean)
      const codes = data.carts[0].promotions
        ?.filter((p: any) => tierPromoIds.includes(p.id))
        ?.map((p: any) => p.code)
        ?.filter(Boolean) || []

      console.log("[TIER PROMO] Cart customer:", data.carts[0].customer?.id || "NONE (logged out)")
      console.log("[TIER PROMO] Tier promo IDs:", tierPromoIds)
      console.log("[TIER PROMO] Cart promotions:", data.carts[0].promotions?.map((p: any) => ({ id: p.id, code: p.code })))
      console.log("[TIER PROMO] Tier promos to remove:", codes)

      return codes
    })

    // Check if customer exists and has tier
    const validationResult = when({ carts }, (data) => !!data.carts[0].customer).then(() => {
      return validateTierPromotionStep({
        customer: {
          has_account: carts[0].customer!.has_account,
          tier: {
            promo_id: carts[0].customer!.tier!.promo_id || null,
            promotion: {
              id: carts[0].customer!.tier!.promotion!.id,
              code: carts[0].customer!.tier!.promotion!.code || null,
              // @ts-ignore
              status: carts[0].customer!.tier!.promotion!.status || null,
            },
          },
        },
      })
    })

    // Remove tier promotions if customer logged out or doesn't have matching tier
    when({ carts, tierPromoCodesToRemove, validationResult }, (data) => {
      const hasCustomer = !!data.carts[0].customer
      const customerTierCode = data.validationResult?.promotion_code || null
      const appliedTierCodes = data.tierPromoCodesToRemove as string[]

      console.log("[TIER PROMO REMOVAL CHECK] hasCustomer:", hasCustomer)
      console.log("[TIER PROMO REMOVAL CHECK] customerTierCode:", customerTierCode)
      console.log("[TIER PROMO REMOVAL CHECK] appliedTierCodes:", appliedTierCodes)

      if (appliedTierCodes.length === 0) {
        console.log("[TIER PROMO REMOVAL CHECK] No tier promos applied, skipping removal")
        return false
      }

      const shouldRemove = !hasCustomer || appliedTierCodes.some((code: string) => code !== customerTierCode)
      console.log("[TIER PROMO REMOVAL CHECK] Should remove:", shouldRemove)

      // Remove if: no customer (logged out) OR applied tier promos don't match customer's tier
      return shouldRemove
    }).then(() => {
      console.log("[TIER PROMO] REMOVING tier promotions from cart")
      return updateCartPromotionsWorkflow.runAsStep({
        input: {
          cart_id: input.cart_id,
          promo_codes: tierPromoCodesToRemove as string[],
          action: PromotionActions.REMOVE,
        },
      }).config({ name: "remove-tier-promotions" })
    })

    // Add promotion to cart if valid and not already applied
    when({ validationResult, carts }, (data) => {
      if (!data.validationResult?.promotion_code) {
        return false
      }

      const appliedPromotionCodes = data.carts[0].promotions?.map(
        (promo: any) => promo.code
      ) || []

      return (
        data.validationResult?.promotion_code !== null &&
        !appliedPromotionCodes.includes(data.validationResult?.promotion_code!)
      )
    }).then(() => {
      return updateCartPromotionsWorkflow.runAsStep({
        input: {
          cart_id: input.cart_id,
          promo_codes: [validationResult?.promotion_code!],
          action: PromotionActions.ADD,
        },
      })
    })

    releaseLockStep({
      key: input.cart_id,
    })

    return new WorkflowResponse(void 0)
  }
)

