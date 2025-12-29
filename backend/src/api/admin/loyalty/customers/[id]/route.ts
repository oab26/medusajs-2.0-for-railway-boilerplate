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
  const { id: customerId } = req.params

  const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
    LOYALTY_MODULE
  )

  const points = await loyaltyModuleService.getPoints(customerId)
  const settings = await loyaltyModuleService.getSettings()
  const discountValue = await loyaltyModuleService.calculateDiscountForPoints(points)

  res.json({
    customer_id: customerId,
    points,
    discount_value: discountValue,
    currency_code: settings.currency_code,
  })
}

export async function PUT(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id: customerId } = req.params

  const loyaltyModuleService: LoyaltyModuleService = req.scope.resolve(
    LOYALTY_MODULE
  )

  const { points, action } = req.body as {
    points: number
    action: "add" | "deduct" | "set"
  }

  if (typeof points !== "number" || points < 0) {
    return res.status(400).json({
      message: "Invalid points value",
    })
  }

  try {
    let result
    if (action === "add") {
      result = await loyaltyModuleService.addPoints(customerId, points)
    } else if (action === "deduct") {
      result = await loyaltyModuleService.deductPoints(customerId, points)
    } else if (action === "set") {
      const currentPoints = await loyaltyModuleService.getPoints(customerId)
      if (points > currentPoints) {
        result = await loyaltyModuleService.addPoints(
          customerId,
          points - currentPoints
        )
      } else if (points < currentPoints) {
        result = await loyaltyModuleService.deductPoints(
          customerId,
          currentPoints - points
        )
      } else {
        const existingPoints = await loyaltyModuleService.listLoyaltyPoints({
          customer_id: customerId,
        })
        result = existingPoints[0]
      }
    } else {
      return res.status(400).json({
        message: "Invalid action. Must be 'add', 'deduct', or 'set'",
      })
    }

    res.json({
      customer_id: customerId,
      points: result?.points || 0,
    })
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to update points",
    })
  }
}
