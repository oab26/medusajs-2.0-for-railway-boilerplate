import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Gift } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Input,
  Label,
  Button,
  Switch,
  toast,
  Toaster,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

type LoyaltySettings = {
  id: string
  points_per_currency: number
  redemption_rate: number
  currency_code: string
  is_enabled: boolean
}

const LoyaltySettingsPage = () => {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [pointsPerCurrency, setPointsPerCurrency] = useState("")
  const [redemptionRate, setRedemptionRate] = useState("")
  const [currencyCode, setCurrencyCode] = useState("")
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/admin/loyalty/settings", {
        credentials: "include",
      })
      const data = await response.json()
      setSettings(data.settings)
      setPointsPerCurrency(String(data.settings.points_per_currency))
      setRedemptionRate(String(data.settings.redemption_rate))
      setCurrencyCode(data.settings.currency_code)
      setIsEnabled(data.settings.is_enabled)
    } catch (error) {
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/admin/loyalty/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          points_per_currency: Number(pointsPerCurrency),
          redemption_rate: Number(redemptionRate),
          currency_code: currencyCode,
          is_enabled: isEnabled,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      const data = await response.json()
      setSettings(data.settings)
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">Loyalty Points Settings</Heading>
        </div>
        <div className="px-6 py-4">
          <Text>Loading...</Text>
        </div>
      </Container>
    )
  }

  return (
    <>
      <Toaster />
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">Loyalty Points Settings</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Configure how customers earn and redeem loyalty points
            </Text>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Loyalty Program</Label>
              <Text className="text-ui-fg-subtle text-sm">
                Turn the loyalty points program on or off
              </Text>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="points_per_currency">Points Per Currency Unit</Label>
              <Input
                id="points_per_currency"
                type="number"
                min="1"
                value={pointsPerCurrency}
                onChange={(e) => setPointsPerCurrency(e.target.value)}
                placeholder="e.g., 100"
              />
              <Text className="text-ui-fg-subtle text-sm">
                How much currency earns 1 point (e.g., 100 = 1 point per 100 PKR)
              </Text>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redemption_rate">Redemption Rate</Label>
              <Input
                id="redemption_rate"
                type="number"
                min="1"
                value={redemptionRate}
                onChange={(e) => setRedemptionRate(e.target.value)}
                placeholder="e.g., 1"
              />
              <Text className="text-ui-fg-subtle text-sm">
                How many points equal 1 currency unit in discount (e.g., 1 = 1 point = 1 PKR)
              </Text>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency_code">Currency Code</Label>
              <Input
                id="currency_code"
                type="text"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toLowerCase())}
                placeholder="e.g., pkr"
              />
              <Text className="text-ui-fg-subtle text-sm">
                The currency code for loyalty point calculations
              </Text>
            </div>
          </div>

          <div className="bg-ui-bg-subtle rounded-lg p-4">
            <Heading level="h3" className="mb-2">Example Calculation</Heading>
            <Text className="text-ui-fg-subtle">
              With current settings:
            </Text>
            <ul className="list-disc list-inside text-ui-fg-subtle mt-2 space-y-1">
              <li>
                Customer spends {Number(pointsPerCurrency) * 10} {currencyCode.toUpperCase()} → Earns 10 points
              </li>
              <li>
                Customer redeems 100 points → Gets {100 / Number(redemptionRate)} {currencyCode.toUpperCase()} discount
              </li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              isLoading={saving}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Container>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Loyalty Points",
  icon: Gift,
})

export default LoyaltySettingsPage
