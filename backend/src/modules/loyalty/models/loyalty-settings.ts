import { model } from "@medusajs/framework/utils"

const LoyaltySettings = model.define("loyalty_settings", {
  id: model.id().primaryKey(),
  points_per_currency: model.number().default(1),
  redemption_rate: model.number().default(1),
  currency_code: model.text().default("pkr"),
  is_enabled: model.boolean().default(true),
})

export default LoyaltySettings
