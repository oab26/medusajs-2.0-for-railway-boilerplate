"use client"

import { Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"
import { getLoyaltySettings, LoyaltySettings } from "@lib/data/loyalty"

type LineItemPointsProps = {
  item: HttpTypes.StoreCartLineItem
}

const LineItemPoints = ({ item }: LineItemPointsProps) => {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null)

  useEffect(() => {
    getLoyaltySettings().then(setSettings)
  }, [])

  if (!settings?.is_enabled) return null

  const itemTotal = item.subtotal || 0
  const points = Math.floor(itemTotal / settings.points_per_currency)

  if (points <= 0) return null

  return (
    <Text className="text-xs text-amber-600">
      +{points.toLocaleString()} pts
    </Text>
  )
}

export default LineItemPoints
