"use client"

import { useEffect, useState } from "react"
import { getLoyaltySettings, LoyaltySettings } from "@lib/data/loyalty"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type ProductEarnPointsProps = {
  variant?: HttpTypes.StoreProductVariant
  customer: HttpTypes.StoreCustomer | null
}

const ProductEarnPoints = ({ variant, customer }: ProductEarnPointsProps) => {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLoyaltySettings()
      .then((data) => setSettings(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !settings || !settings.is_enabled) {
    return null
  }

  const price = variant?.calculated_price?.calculated_amount
  if (!price || price <= 0) {
    return null
  }

  const pointsToEarn = Math.floor(price / settings.points_per_currency)
  if (pointsToEarn <= 0) {
    return null
  }

  const formattedPoints = pointsToEarn.toLocaleString()

  if (customer) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg">
        <span className="text-amber-600 text-lg">★</span>
        <span className="text-sm text-amber-800">
          Earn <span className="font-semibold">{formattedPoints} points</span> with this purchase
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 py-2 px-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-amber-600 text-lg">★</span>
        <span className="text-sm text-amber-800">
          Join & earn <span className="font-semibold">{formattedPoints} points</span>
        </span>
      </div>
      <LocalizedClientLink
        href="/account"
        className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
      >
        Sign up free →
      </LocalizedClientLink>
    </div>
  )
}

export default ProductEarnPoints
