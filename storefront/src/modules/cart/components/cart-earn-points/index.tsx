"use client"

import { Badge, Button, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
import {
  getLoyaltySettings,
  getLoyaltyPoints,
  applyLoyaltyPoints,
  removeLoyaltyPoints,
  LoyaltySettings,
  LoyaltyPointsData,
} from "@lib/data/loyalty"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CartEarnPointsProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const CartEarnPoints = ({ cart }: CartEarnPointsProps) => {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null)
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPointsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLoggedIn = !!cart.customer_id

  const isLoyaltyPointsPromoApplied = useMemo(() => {
    const loyaltyPromoId = cart.metadata?.loyalty_promo_id as string | null
    if (!loyaltyPromoId) return false
    return cart.promotions?.find((promo) => promo.id === loyaltyPromoId) !== undefined
  }, [cart])

  const appliedLoyaltyPromo = useMemo(() => {
    const loyaltyPromoId = cart.metadata?.loyalty_promo_id as string | null
    if (!loyaltyPromoId) return null
    return cart.promotions?.find((promo) => promo.id === loyaltyPromoId) || null
  }, [cart])

  useEffect(() => {
    Promise.all([
      getLoyaltySettings(),
      isLoggedIn ? getLoyaltyPoints() : Promise.resolve(null),
    ])
      .then(([settingsData, pointsData]) => {
        setSettings(settingsData)
        setLoyaltyPoints(pointsData)
      })
      .finally(() => setLoading(false))
  }, [isLoggedIn, cart.customer_id])

  const handleTogglePromotion = async () => {
    setApplying(true)
    setError(null)

    try {
      if (isLoyaltyPointsPromoApplied) {
        const result = await removeLoyaltyPoints(cart.id)
        if (!result.success) {
          setError(result.message || "Failed to remove loyalty points")
        }
      } else {
        const result = await applyLoyaltyPoints(cart.id)
        if (!result.success) {
          setError(result.message || "Failed to apply loyalty points")
        }
      }
      const updatedPoints = await getLoyaltyPoints()
      setLoyaltyPoints(updatedPoints)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setApplying(false)
    }
  }

  if (loading || !settings?.is_enabled) return null

  const cartTotal = cart.total || 0
  const pointsToEarn = Math.floor(cartTotal / settings.points_per_currency)

  return (
    <div className="flex flex-col gap-3">
      {/* Points to Earn */}
      <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-xl">★</span>
          <div className="flex flex-col">
            <Text className="text-sm font-medium text-amber-900">
              You&apos;ll earn with this order
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold text-amber-700">
            {pointsToEarn.toLocaleString()}
          </span>
          <span className="text-sm text-amber-600">points</span>
        </div>
      </div>

      {/* Redeem Points Section */}
      {isLoggedIn && loyaltyPoints && loyaltyPoints.points > 0 && (
        <div className="py-3 px-4 bg-ui-bg-subtle border border-ui-border-base rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <Text className="text-sm font-medium">
                Your Points: <span className="text-amber-600">{loyaltyPoints.points.toLocaleString()}</span>
              </Text>
              {loyaltyPoints.discount_value > 0 && (
                <Text className="text-xs text-ui-fg-subtle">
                  Worth {convertToLocale({
                    amount: loyaltyPoints.discount_value,
                    currency_code: cart.currency_code || loyaltyPoints.currency_code,
                  })} discount
                </Text>
              )}
            </div>
            <Button
              variant={isLoyaltyPointsPromoApplied ? "danger" : "secondary"}
              size="small"
              onClick={handleTogglePromotion}
              disabled={applying}
            >
              {applying
                ? "..."
                : isLoyaltyPointsPromoApplied
                ? "Remove"
                : "Redeem Points"}
            </Button>
          </div>

          {isLoyaltyPointsPromoApplied && appliedLoyaltyPromo && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-ui-border-base">
              <Badge color="green" size="small">Applied</Badge>
              <Text className="text-sm text-green-700">
                -{convertToLocale({
                  amount: appliedLoyaltyPromo.application_method?.value || 0,
                  currency_code:
                    appliedLoyaltyPromo.application_method?.currency_code || cart.currency_code,
                })}
              </Text>
            </div>
          )}

          {error && (
            <Text className="text-rose-500 text-xs mt-2">{error}</Text>
          )}
        </div>
      )}

      {/* Guest CTA */}
      {!isLoggedIn && (
        <div className="flex items-center justify-between py-2 px-4 bg-ui-bg-subtle border border-ui-border-base rounded-lg">
          <Text className="text-sm text-ui-fg-subtle">
            Have points to redeem?
          </Text>
          <LocalizedClientLink
            href="/account"
            className="text-sm font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
          >
            Sign in →
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}

export default CartEarnPoints
