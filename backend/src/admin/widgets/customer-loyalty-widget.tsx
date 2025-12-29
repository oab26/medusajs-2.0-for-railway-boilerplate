import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  toast,
  Toaster,
  Badge,
} from "@medusajs/ui"
import { DetailWidgetProps, AdminCustomer } from "@medusajs/framework/types"
import { useEffect, useState } from "react"

type LoyaltyData = {
  customer_id: string
  points: number
  discount_value: number
  currency_code: string
}

const CustomerLoyaltyWidget = ({ data }: DetailWidgetProps<AdminCustomer>) => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [adjusting, setAdjusting] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)
  const [adjustPoints, setAdjustPoints] = useState("")
  const [adjustAction, setAdjustAction] = useState<"add" | "deduct">("add")

  useEffect(() => {
    fetchLoyaltyData()
  }, [data.id])

  const fetchLoyaltyData = async () => {
    try {
      const response = await fetch(`/admin/loyalty/customers/${data.id}`, {
        credentials: "include",
      })
      const result = await response.json()
      setLoyaltyData(result)
    } catch (error) {
      console.error("Failed to fetch loyalty data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdjust = async () => {
    if (!adjustPoints || Number(adjustPoints) <= 0) {
      toast.error("Please enter a valid number of points")
      return
    }

    setAdjusting(true)
    try {
      const response = await fetch(`/admin/loyalty/customers/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          points: Number(adjustPoints),
          action: adjustAction,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to adjust points")
      }

      toast.success(`Successfully ${adjustAction === "add" ? "added" : "deducted"} ${adjustPoints} points`)
      setAdjustPoints("")
      setShowAdjust(false)
      fetchLoyaltyData()
    } catch (error: any) {
      toast.error(error.message || "Failed to adjust points")
    } finally {
      setAdjusting(false)
    }
  }

  if (loading) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Text className="text-ui-fg-subtle">Loading loyalty data...</Text>
        </div>
      </Container>
    )
  }

  return (
    <>
      <Toaster />
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Loyalty Points</Heading>
          <Badge color={loyaltyData && loyaltyData.points > 0 ? "green" : "grey"}>
            {loyaltyData?.points || 0} points
          </Badge>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="text-ui-fg-subtle text-sm">Current Balance</Text>
              <Text className="text-xl font-semibold">
                {loyaltyData?.points || 0} points
              </Text>
            </div>
            <div>
              <Text className="text-ui-fg-subtle text-sm">Discount Value</Text>
              <Text className="text-xl font-semibold">
                {loyaltyData?.discount_value || 0} {loyaltyData?.currency_code?.toUpperCase() || "PKR"}
              </Text>
            </div>
          </div>

          {!showAdjust ? (
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowAdjust(true)}
            >
              Adjust Points
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-ui-bg-subtle rounded-lg">
              <div className="flex gap-2">
                <Button
                  variant={adjustAction === "add" ? "primary" : "secondary"}
                  size="small"
                  onClick={() => setAdjustAction("add")}
                >
                  Add
                </Button>
                <Button
                  variant={adjustAction === "deduct" ? "primary" : "secondary"}
                  size="small"
                  onClick={() => setAdjustAction("deduct")}
                >
                  Deduct
                </Button>
              </div>

              <div className="space-y-1">
                <Label htmlFor="adjust_points">Points</Label>
                <Input
                  id="adjust_points"
                  type="number"
                  min="1"
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(e.target.value)}
                  placeholder="Enter points amount"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="small"
                  onClick={handleAdjust}
                  isLoading={adjusting}
                >
                  {adjustAction === "add" ? "Add Points" : "Deduct Points"}
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setShowAdjust(false)
                    setAdjustPoints("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default CustomerLoyaltyWidget
