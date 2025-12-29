"use server"

import { Modules } from "@medusajs/framework/utils"
import {
  ICustomerModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

export default async function saveCustomerAddressHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER)

  try {
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ["shipping_address"],
    })

    if (!order.customer_id) {
      return
    }

    const customer = await customerModuleService.retrieveCustomer(order.customer_id, {
      relations: ["addresses"],
    })

    if (!customer.has_account) {
      return
    }

    const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(
      order.shipping_address.id
    )

    if (!shippingAddress) {
      return
    }

    const existingAddress = customer.addresses?.find(
      (addr) =>
        addr.address_1 === shippingAddress.address_1 &&
        addr.city === shippingAddress.city &&
        addr.postal_code === shippingAddress.postal_code &&
        addr.country_code === shippingAddress.country_code
    )

    if (existingAddress) {
      return
    }

    await customerModuleService.createCustomerAddresses({
      customer_id: customer.id,
      address_name: "Shipping Address",
      first_name: shippingAddress.first_name || "",
      last_name: shippingAddress.last_name || "",
      address_1: shippingAddress.address_1 || "",
      address_2: shippingAddress.address_2 || "",
      city: shippingAddress.city || "",
      country_code: shippingAddress.country_code || "",
      province: shippingAddress.province || "",
      postal_code: shippingAddress.postal_code || "",
      phone: shippingAddress.phone || "",
      company: shippingAddress.company || "",
      is_default_shipping: customer.addresses?.length === 0,
    })

    console.log(`Saved shipping address for customer ${customer.id}`)
  } catch (error) {
    console.error("Error saving customer address:", error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
