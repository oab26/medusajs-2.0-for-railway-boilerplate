import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  applyLoyaltyPointsWorkflow,
  removeLoyaltyPointsWorkflow,
} from "../../../../../workflows/apply-loyalty-points"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id: cartId } = req.params

  const customerId = req.auth_context.actor_id

  if (!customerId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    })
  }

  try {
    const { result } = await applyLoyaltyPointsWorkflow(req.scope).run({
      input: {
        cart_id: cartId,
      },
    })

    res.json({
      success: true,
      cart: result,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to apply loyalty points",
    })
  }
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id: cartId } = req.params

  const customerId = req.auth_context.actor_id

  if (!customerId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    })
  }

  try {
    const { result } = await removeLoyaltyPointsWorkflow(req.scope).run({
      input: {
        cart_id: cartId,
      },
    })

    res.json({
      success: true,
      cart: result,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to remove loyalty points",
    })
  }
}
