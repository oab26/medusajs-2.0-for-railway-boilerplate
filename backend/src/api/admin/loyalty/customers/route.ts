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

  const { offset = 0, limit = 50 } = req.query as {
    offset?: number
    limit?: number
  }

  const loyaltyPoints = await loyaltyModuleService.listLoyaltyPoints(
    {},
    {
      skip: Number(offset),
      take: Number(limit),
    }
  )

  const count = await loyaltyModuleService.listLoyaltyPoints({})

  res.json({
    loyalty_points: loyaltyPoints,
    count: count.length,
    offset: Number(offset),
    limit: Number(limit),
  })
}
