import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import { createReviewWorkflow } from "../../../workflows/create-review"

export const PostStoreReviewSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(10, "Review content must be at least 10 characters"),
  rating: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val) : val),
    z.number().min(1).max(5)
  ),
  product_id: z.string(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
})

type PostStoreReviewReq = z.infer<typeof PostStoreReviewSchema>

export async function POST(
  req: MedusaRequest<PostStoreReviewReq>,
  res: MedusaResponse
) {
  const input = req.validatedBody
  const multerFiles = req.files as Express.Multer.File[] | undefined

  if (multerFiles && multerFiles.length > 3) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Maximum 3 images allowed per review"
    )
  }

  const files = multerFiles?.map((file) => ({
    filename: file.originalname,
    mimeType: file.mimetype,
    content: file.buffer.toString("base64"),
  }))

  const customerId = (req as any).auth_context?.actor_id

  const { result } = await createReviewWorkflow(req.scope).run({
    input: {
      ...input,
      customer_id: customerId,
      files,
    },
  })

  res.status(201).json(result)
}
