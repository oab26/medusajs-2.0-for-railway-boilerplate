import {
  AbstractPaymentProvider,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import {
  CreatePaymentProviderSession,
  UpdatePaymentProviderSession,
  PaymentProviderError,
  PaymentProviderSessionResponse,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/framework/types"

class CodPaymentProviderService extends AbstractPaymentProvider {
  static identifier = "cash-on-delivery"

  async capturePayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    return {
      status: "captured",
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    PaymentProviderError | { status: PaymentSessionStatus; data: Record<string, unknown> }
  > {
    return {
      status: PaymentSessionStatus.AUTHORIZED,
      data: {
        ...paymentSessionData,
      },
    }
  }

  async cancelPayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    return {
      status: "cancelled",
    }
  }

  async initiatePayment(
    context: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return {
      data: {
        id: `cod_${Date.now()}`,
      },
    }
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    return {}
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus> {
    return PaymentSessionStatus.AUTHORIZED
  }

  async refundPayment(
    paymentData: Record<string, unknown>,
    refundAmount: number
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    return {
      status: "refunded",
      refund_amount: refundAmount,
    }
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    return paymentSessionData
  }

  async updatePayment(
    context: UpdatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return {
      data: context.data,
    }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    return {
      action: PaymentActions.NOT_SUPPORTED,
    }
  }
}

export default CodPaymentProviderService
