import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import { InferTypeOf } from "@medusajs/framework/types"
import LoyaltyPoint from "./models/loyalty-point"
import LoyaltySettings from "./models/loyalty-settings"

type LoyaltyPointType = InferTypeOf<typeof LoyaltyPoint>
type LoyaltySettingsType = InferTypeOf<typeof LoyaltySettings>

class LoyaltyModuleService extends MedusaService({
  LoyaltyPoint,
  LoyaltySettings,
}) {
  async addPoints(customerId: string, points: number): Promise<LoyaltyPointType> {
    const existingPoints = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    if (existingPoints.length > 0) {
      return await this.updateLoyaltyPoints({
        id: existingPoints[0].id,
        points: existingPoints[0].points + points,
      })
    }

    return await this.createLoyaltyPoints({
      customer_id: customerId,
      points,
    })
  }

  async deductPoints(customerId: string, points: number): Promise<LoyaltyPointType> {
    const existingPoints = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    if (existingPoints.length === 0 || existingPoints[0].points < points) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Insufficient loyalty points"
      )
    }

    return await this.updateLoyaltyPoints({
      id: existingPoints[0].id,
      points: existingPoints[0].points - points,
    })
  }

  async getPoints(customerId: string): Promise<number> {
    const points = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    return points[0]?.points || 0
  }

  async getSettings(): Promise<LoyaltySettingsType> {
    const settings = await this.listLoyaltySettings({})

    if (settings.length === 0) {
      return await this.createLoyaltySettings({
        points_per_currency: 1,
        redemption_rate: 1,
        currency_code: "pkr",
        is_enabled: true,
      })
    }

    return settings[0]
  }

  async updateSettings(data: Partial<LoyaltySettingsType>): Promise<LoyaltySettingsType> {
    const settings = await this.getSettings()

    return await this.updateLoyaltySettings({
      id: settings.id,
      ...data,
    })
  }

  async calculatePointsForOrder(orderTotal: number): Promise<number> {
    const settings = await this.getSettings()
    if (!settings.is_enabled || settings.points_per_currency <= 0) {
      return 0
    }
    return Math.floor(orderTotal / settings.points_per_currency)
  }

  async calculateDiscountForPoints(points: number): Promise<number> {
    const settings = await this.getSettings()
    if (!settings.is_enabled || settings.redemption_rate <= 0) {
      return 0
    }
    return Math.floor(points / settings.redemption_rate)
  }

  async calculatePointsFromAmount(amount: number): Promise<number> {
    if (amount < 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Amount cannot be negative"
      )
    }
    const settings = await this.getSettings()
    if (!settings.is_enabled || settings.redemption_rate <= 0) {
      return Math.floor(amount)
    }
    return Math.floor(amount * settings.redemption_rate)
  }
}

export default LoyaltyModuleService
