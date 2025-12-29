import { model } from "@medusajs/framework/utils"

const ReviewImage = model.define("review_image", {
  id: model.id().primaryKey(),
  file_id: model.text(),
  url: model.text(),
  review_id: model.text().index("IDX_REVIEW_IMAGE_REVIEW_ID"),
  sort_order: model.number().default(0),
})

export default ReviewImage
