import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../../modules/loyalty"
import LoyaltyModuleService from "../../../../../modules/loyalty/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
    LOYALTY_MODULE
  )

  const customerId = req.auth_context.actor_id

  if (!customerId) {
    return res.status(401).json({
      message: "Not authenticated",
    })
  }

  const points = await loyaltyModuleService.getPoints(customerId)
  const settings = await loyaltyModuleService.getSettings()
  const discountValue = await loyaltyModuleService.calculateDiscountForPoints(points)

  res.json({
    points,
    discount_value: discountValue,
    currency_code: settings.currency_code,
    is_enabled: settings.is_enabled,
  })
}
