import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  createPromotionsStep,
  releaseLockStep,
  updateCartPromotionsWorkflow,
  updateCartsStep,
  updatePromotionsStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { MedusaError, PromotionActions } from "@medusajs/framework/utils"
import {
  getCartLoyaltyPromoAmountStep,
  GetCartLoyaltyPromoAmountStepInput
} from "./steps/get-cart-loyalty-promo-amount"
import { CartData, CUSTOMER_ID_PROMOTION_RULE_ATTRIBUTE } from "../utils/promo"
import { CreatePromotionDTO } from "@medusajs/framework/types"
import { getCartLoyaltyPromoStep } from "./steps/get-cart-loyalty-promo"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

const validateCartCustomerStep = createStep(
  "validate-cart-customer",
  async ({ customer }: { customer: any }) => {
    if (!customer) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "You must be logged in to apply loyalty points"
      )
    }

    if (!customer.has_account) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "You must have an account to apply loyalty points"
      )
    }

    return new StepResponse({ customer_id: customer.id })
  }
)

type ApplyLoyaltyPointsWorkflowInput = {
  cart_id: string
}

const fields = [
  "id",
  "customer.*",
  "promotions.*",
  "promotions.application_method.*",
  "promotions.rules.*",
  "promotions.rules.values.*",
  "currency_code",
  "total",
  "metadata"
]

export const applyLoyaltyPointsWorkflow = createWorkflow(
  "apply-loyalty-points",
  (input: ApplyLoyaltyPointsWorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields,
      filters: {
        id: input.cart_id
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    validateCartCustomerStep({
      customer: carts[0].customer
    })

    getCartLoyaltyPromoStep({
      cart: carts[0] as unknown as CartData,
      throwErrorOn: "found"
    })

    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 10,
    })

    const amount = getCartLoyaltyPromoAmountStep({
      cart: carts[0]
    } as unknown as GetCartLoyaltyPromoAmountStepInput)

    const promoToCreate = transform({
      carts,
      amount
    }, (data) => {
      const randomStr = Math.random().toString(36).substring(2, 8)
      const uniqueId = (
        "LOYALTY-" + data.carts[0].customer?.first_name + "-" + randomStr
      ).toUpperCase()
      return {
        code: uniqueId,
        type: "standard",
        status: "active",
        application_method: {
          type: "fixed",
          value: data.amount,
          target_type: "order",
          currency_code: data.carts[0].currency_code,
          allocation: "across",
        },
        rules: [
          {
            attribute: CUSTOMER_ID_PROMOTION_RULE_ATTRIBUTE,
            operator: "eq",
            values: [data.carts[0].customer!.id]
          }
        ],
        campaign: {
          name: uniqueId,
          description: "Loyalty points promotion for " + data.carts[0].customer!.email,
          campaign_identifier: uniqueId,
          budget: {
            type: "usage",
            limit: 1
          }
        }
      }
    })

    const loyaltyPromo = createPromotionsStep([
      promoToCreate
    ] as CreatePromotionDTO[])

    const { metadata, ...updatePromoData } = transform({
      carts,
      promoToCreate,
      loyaltyPromo
    }, (data) => {
      const promos = [
        ...(data.carts[0].promotions?.map((promo) => promo?.code).filter(Boolean) || []) as string[],
        data.promoToCreate.code
      ]

      return {
        cart_id: data.carts[0].id,
        promo_codes: promos,
        action: PromotionActions.ADD,
        metadata: {
          loyalty_promo_id: data.loyaltyPromo[0].id
        }
      }
    })

    updateCartPromotionsWorkflow.runAsStep({
      input: updatePromoData
    })

    updateCartsStep([
      {
        id: input.cart_id,
        metadata
      }
    ])

    const { data: updatedCarts } = useQueryGraphStep({
      entity: "cart",
      fields,
      filters: { id: input.cart_id },
    }).config({ name: "retrieve-cart" })

    releaseLockStep({
      key: input.cart_id,
    })

    return new WorkflowResponse(updatedCarts[0])
  }
)

type RemoveLoyaltyPointsWorkflowInput = {
  cart_id: string
}

export const removeLoyaltyPointsWorkflow = createWorkflow(
  "remove-loyalty-points",
  (input: RemoveLoyaltyPointsWorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields,
      filters: {
        id: input.cart_id,
      },
      options: {
        throwIfKeyNotFound: true
      }
    })

    const loyaltyPromo = getCartLoyaltyPromoStep({
      cart: carts[0] as unknown as CartData,
      throwErrorOn: "not-found",
    })

    acquireLockStep({
      key: input.cart_id,
      timeout: 2,
      ttl: 10,
    })

    updateCartPromotionsWorkflow.runAsStep({
      input: {
        cart_id: input.cart_id,
        promo_codes: [loyaltyPromo.code!],
        action: PromotionActions.REMOVE,
      },
    })

    const newMetadata = transform({
      carts,
    }, (data) => {
      const { loyalty_promo_id, ...rest } = data.carts[0].metadata || {}

      return {
        ...rest,
        loyalty_promo_id: null,
      }
    })

    updateCartsStep([
      {
        id: input.cart_id,
        metadata: newMetadata,
      },
    ])

    updatePromotionsStep([
      {
        id: loyaltyPromo.id,
        status: "inactive",
      },
    ])

    const { data: updatedCarts } = useQueryGraphStep({
      entity: "cart",
      fields,
      filters: { id: input.cart_id },
    }).config({ name: "retrieve-cart" })

    releaseLockStep({
      key: input.cart_id,
    })

    return new WorkflowResponse(updatedCarts[0])
  }
)
