import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import LoyaltyModuleService from "../../../../modules/loyalty/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
    LOYALTY_MODULE
  )

  const settings = await loyaltyModuleService.getSettings()

  res.json({
    points_per_currency: settings.points_per_currency,
    currency_code: settings.currency_code,
    is_enabled: settings.is_enabled,
  })
}
