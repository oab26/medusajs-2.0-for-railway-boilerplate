"use client"

import { useEffect, useState } from "react"
import { getLoyaltyPoints, LoyaltyPointsData } from "@lib/data/loyalty"
import { convertToLocale } from "@lib/util/money"

const AccountLoyaltyPoints = () => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPointsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLoyaltyPoints()
      .then((data) => {
        setLoyaltyData(data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-y-4">
        <h3 className="text-large-semi">Loyalty Points</h3>
        <div className="flex items-end gap-x-2">
          <span className="text-base-regular text-ui-fg-subtle">Loading...</span>
        </div>
      </div>
    )
  }

  if (!loyaltyData || !loyaltyData.is_enabled) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4">
      <h3 className="text-large-semi">Loyalty Points</h3>
      <div className="flex items-end gap-x-2">
        <span
          className="text-3xl-semi leading-none"
          data-testid="loyalty-points"
          data-value={loyaltyData.points}
        >
          {loyaltyData.points}
        </span>
        <span className="uppercase text-base-regular text-ui-fg-subtle">
          Points
        </span>
      </div>
      {loyaltyData.discount_value > 0 && (
        <span className="text-small-regular text-ui-fg-subtle">
          Worth{" "}
          {convertToLocale({
            amount: loyaltyData.discount_value,
            currency_code: loyaltyData.currency_code,
          })}{" "}
          in discounts
        </span>
      )}
    </div>
  )
}

export default AccountLoyaltyPoints
