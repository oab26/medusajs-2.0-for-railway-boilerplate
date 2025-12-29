"use client"

import { Badge, Button, Heading, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  getLoyaltyPoints,
  applyLoyaltyPoints,
  removeLoyaltyPoints,
  LoyaltyPointsData,
} from "@lib/data/loyalty"
import { convertToLocale } from "@lib/util/money"

type LoyaltyPointsProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const LoyaltyPoints = ({ cart }: LoyaltyPointsProps) => {
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPointsData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    getLoyaltyPoints()
      .then((points) => {
        setLoyaltyPoints(points)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [cart.customer_id])

  const handleTogglePromotion = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
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

  if (loading) {
    return (
      <div className="w-full bg-white flex flex-col">
        <div className="h-px w-full border-b border-gray-200 my-4" />
        <Text className="text-ui-fg-subtle">Loading loyalty points...</Text>
      </div>
    )
  }

  return (
    <div className="w-full bg-white flex flex-col">
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex flex-col">
        <Heading className="txt-medium mb-2">Loyalty Points</Heading>

        {loyaltyPoints === null && (
          <Link
            href="/account"
            className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
          >
            Sign in to use loyalty points
          </Link>
        )}

        {loyaltyPoints !== null && !loyaltyPoints.is_enabled && (
          <Text className="text-ui-fg-subtle">
            Loyalty program is currently disabled
          </Text>
        )}

        {loyaltyPoints !== null && loyaltyPoints.is_enabled && (
          <>
            <div className="flex items-center justify-between my-2 gap-2">
              <div className="flex flex-col">
                <Text className="txt-medium">
                  Available: <strong>{loyaltyPoints.points} points</strong>
                </Text>
                {loyaltyPoints.discount_value > 0 && (
                  <Text className="text-ui-fg-subtle text-sm">
                    Worth{" "}
                    {convertToLocale({
                      amount: loyaltyPoints.discount_value,
                      currency_code: cart.currency_code || loyaltyPoints.currency_code,
                    })}{" "}
                    discount
                  </Text>
                )}
              </div>

              {loyaltyPoints.points > 0 && (
                <Button
                  variant={isLoyaltyPointsPromoApplied ? "danger" : "secondary"}
                  size="small"
                  onClick={handleTogglePromotion}
                  disabled={applying}
                >
                  {applying
                    ? "Processing..."
                    : isLoyaltyPointsPromoApplied
                    ? "Remove Points"
                    : "Apply Points"}
                </Button>
              )}
            </div>

            {isLoyaltyPointsPromoApplied && appliedLoyaltyPromo && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-ui-bg-subtle rounded">
                <Badge color="green" size="small">
                  Applied
                </Badge>
                <Text className="text-sm">
                  {appliedLoyaltyPromo.application_method?.value !== undefined && (
                    <>
                      -{convertToLocale({
                        amount: appliedLoyaltyPromo.application_method.value,
                        currency_code:
                          appliedLoyaltyPromo.application_method.currency_code ||
                          cart.currency_code,
                      })}
                    </>
                  )}
                </Text>
              </div>
            )}

            {error && (
              <Text className="text-rose-500 text-sm mt-2">{error}</Text>
            )}

            {loyaltyPoints.points === 0 && (
              <Text className="text-ui-fg-subtle text-sm">
                Complete purchases to earn loyalty points!
              </Text>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default LoyaltyPoints
