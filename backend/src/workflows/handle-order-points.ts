import { createWorkflow, when, transform } from "@medusajs/framework/workflows-sdk"
import { updatePromotionsStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { deductPurchasePointsStep } from "./steps/deduct-purchase-points"
import { addPurchaseAsPointsStep } from "./steps/add-purchase-as-points"
import { OrderData, CartData } from "../utils/promo"
import { orderHasLoyaltyPromotion } from "../utils/promo"
import { getCartLoyaltyPromoStep } from "./steps/get-cart-loyalty-promo"

type HandleOrderPointsWorkflowInput = {
  order_id: string
}

export const handleOrderPointsWorkflow = createWorkflow(
  "handle-order-points",
  ({ order_id }: HandleOrderPointsWorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "customer.*",
        "total",
        "cart.*",
        "cart.promotions.*",
        "cart.promotions.rules.*",
        "cart.promotions.rules.values.*",
        "cart.promotions.application_method.*"
      ],
      filters: {
        id: order_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const loyaltyPointsPromotion = getCartLoyaltyPromoStep({
      cart: orders[0].cart as unknown as CartData,
    })

    const orderData = transform({ orders, loyaltyPointsPromotion }, (data) => ({
      hasLoyalty: orderHasLoyaltyPromotion(data.orders[0] as unknown as OrderData),
      customerId: data.orders[0].customer?.id,
      customerHasAccount: data.orders[0].customer?.has_account ?? false,
      total: data.orders[0].total,
      loyaltyPromoId: data.loyaltyPointsPromotion?.id,
      loyaltyPromoAmount: data.loyaltyPointsPromotion?.application_method?.value as number | undefined
    }))

    when("deduct-points-when-loyalty-used", orderData, (data) =>
      data.customerHasAccount && data.hasLoyalty && data.loyaltyPromoId !== undefined
    ).then(() => {
      deductPurchasePointsStep({
        customer_id: orderData.customerId!,
        amount: orderData.loyaltyPromoAmount!
      })

      updatePromotionsStep([
        {
          id: orderData.loyaltyPromoId!,
          status: "inactive",
        }
      ])
    })

    when("add-points-when-no-loyalty", orderData, (data) =>
      data.customerHasAccount && !data.hasLoyalty
    ).then(() => {
      addPurchaseAsPointsStep({
        customer_id: orderData.customerId!,
        amount: orderData.total
      })
    })
  }
)
