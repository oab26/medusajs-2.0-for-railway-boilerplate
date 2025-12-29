import { CustomerDTO } from "@medusajs/framework/types"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export type ValidateCustomerExistsStepInput = {
  customer: CustomerDTO | null | undefined
}

export type ValidateCustomerExistsStepOutput = {
  is_valid: boolean
  customer_id: string | null
}

export const validateCustomerExistsStep = createStep(
  "validate-customer-exists",
  async ({ customer }: ValidateCustomerExistsStepInput): Promise<StepResponse<ValidateCustomerExistsStepOutput>> => {
    if (!customer || !customer.has_account) {
      return new StepResponse({
        is_valid: false,
        customer_id: null
      })
    }

    return new StepResponse({
      is_valid: true,
      customer_id: customer.id
    })
  }
)
