import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import LoyaltyModuleService from "../../../../modules/loyalty/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
    LOYALTY_MODULE
  )

  const settings = await loyaltyModuleService.getSettings()

  res.json({
    settings,
  })
}

export async function PUT(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
    LOYALTY_MODULE
  )

  const { points_per_currency, redemption_rate, currency_code, is_enabled } =
    req.body as {
      points_per_currency?: number
      redemption_rate?: number
      currency_code?: string
      is_enabled?: boolean
    }

  const settings = await loyaltyModuleService.updateSettings({
    ...(points_per_currency !== undefined && { points_per_currency }),
    ...(redemption_rate !== undefined && { redemption_rate }),
    ...(currency_code !== undefined && { currency_code }),
    ...(is_enabled !== undefined && { is_enabled }),
  })

  res.json({
    settings,
  })
}
