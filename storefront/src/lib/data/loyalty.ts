"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { revalidateTag } from "next/cache"

export type LoyaltyPointsData = {
  points: number
  discount_value: number
  currency_code: string
  is_enabled: boolean
}

export type LoyaltySettings = {
  points_per_currency: number
  currency_code: string
  is_enabled: boolean
}

export type ApplyLoyaltyResult = {
  success: boolean
  promotion_id?: string
  points_used?: number
  discount_amount?: number
  message?: string
}

export const getLoyaltyPoints = async (): Promise<LoyaltyPointsData | null> => {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return null
  }

  try {
    const response = await sdk.client.fetch<LoyaltyPointsData>(
      `/store/customers/me/loyalty-points`,
      {
        method: "GET",
        headers,
      }
    )
    return response
  } catch (error) {
    console.error("Failed to fetch loyalty points:", error)
    return null
  }
}

export const getLoyaltySettings = async (): Promise<LoyaltySettings | null> => {
  try {
    const response = await sdk.client.fetch<LoyaltySettings>(
      `/store/loyalty/settings`,
      {
        method: "GET",
      }
    )
    return response
  } catch (error) {
    console.error("Failed to fetch loyalty settings:", error)
    return null
  }
}

export const applyLoyaltyPoints = async (
  cartId: string
): Promise<ApplyLoyaltyResult> => {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, message: "Not authenticated" }
  }

  try {
    const response = await sdk.client.fetch<ApplyLoyaltyResult>(
      `/store/carts/${cartId}/loyalty-points`,
      {
        method: "POST",
        headers,
      }
    )

    revalidateTag("cart")
    return response
  } catch (error: any) {
    console.error("Failed to apply loyalty points:", error)
    return {
      success: false,
      message: error.message || "Failed to apply loyalty points"
    }
  }
}

export const removeLoyaltyPoints = async (
  cartId: string
): Promise<{ success: boolean; message?: string }> => {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { success: false, message: "Not authenticated" }
  }

  try {
    const response = await sdk.client.fetch<{ success: boolean }>(
      `/store/carts/${cartId}/loyalty-points`,
      {
        method: "DELETE",
        headers,
      }
    )

    revalidateTag("cart")
    return response
  } catch (error: any) {
    console.error("Failed to remove loyalty points:", error)
    return {
      success: false,
      message: error.message || "Failed to remove loyalty points"
    }
  }
}
