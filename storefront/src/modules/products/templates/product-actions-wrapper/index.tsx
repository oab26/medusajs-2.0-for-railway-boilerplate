import { getProductsById } from "@lib/data/products"
import { getCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [[product], customer] = await Promise.all([
    getProductsById({
      ids: [id],
      regionId: region.id,
    }),
    getCustomer(),
  ])

  if (!product) {
    return null
  }

  return <ProductActions product={product} region={region} customer={customer} />
}
