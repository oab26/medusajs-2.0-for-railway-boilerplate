import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
  authenticate,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import multer from "multer"
import { CreateTierSchema } from "./admin/tiers/route"
import { UpdateTierSchema } from "./admin/tiers/[id]/route"
import { NextTierSchema } from "./store/customers/me/next-tier/route"
import { PostStoreReviewSchema } from "./store/reviews/route"
import { PostAdminUpdateReviewsStatusSchema } from "./admin/reviews/status/route"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

export default defineMiddlewares({
  routes: [
    // GET /admin/tiers - List tiers
    {
      matcher: "/admin/tiers",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true,
          defaults: ["id", "name", "promotion.id", "promotion.code"],
        }),
      ],
    },
    // POST /admin/tiers - Create tier
    {
      matcher: "/admin/tiers",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(CreateTierSchema)],
    },
    // GET /admin/tiers/:id - Get tier
    {
      matcher: "/admin/tiers/:id",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: false,
          defaults: ["id", "name", "promotion.id", "promotion.code", "tier_rules.*"],
        }),
      ],
    },
    // POST /admin/tiers/:id - Update tier
    {
      matcher: "/admin/tiers/:id",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(UpdateTierSchema)],
    },
    // GET /admin/tiers/:id/customers - List customers in tier
    {
      matcher: "/admin/tiers/:id/customers",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true,
          defaults: ["id", "email", "first_name", "last_name"],
        }),
      ],
    },
    {
      matcher: "/store/customers/me/next-tier",
      methods: ["GET"],
      middlewares: [validateAndTransformQuery(NextTierSchema, {})],
    },
    {
      matcher: "/admin/customers*",
      methods: ["GET"],
      middlewares: [
        (req, res, next) => {
          (req.allowed ??= []).push("tier")
          next()
        },
      ],
    },
    // POST /store/reviews - Create review with images
    {
      matcher: "/store/reviews",
      methods: ["POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
        // @ts-ignore
        upload.array("images", 3),
        validateAndTransformBody(PostStoreReviewSchema),
      ],
    },
    // GET /store/products/:id/reviews - Get product reviews
    {
      matcher: "/store/products/:id/reviews",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true,
          defaults: [
            "id",
            "title",
            "content",
            "rating",
            "first_name",
            "last_name",
            "verified_purchase",
            "created_at",
            "images.*",
          ],
        }),
      ],
    },
    // GET /admin/reviews - List reviews
    {
      matcher: "/admin/reviews",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: true,
          defaults: [
            "id",
            "title",
            "content",
            "rating",
            "status",
            "first_name",
            "last_name",
            "verified_purchase",
            "product_id",
            "customer_id",
            "created_at",
            "updated_at",
            "product.*",
            "images.*",
          ],
        }),
      ],
    },
    // POST /admin/reviews/status - Update review status
    {
      matcher: "/admin/reviews/status",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(PostAdminUpdateReviewsStatusSchema)],
    },
    // GET /admin/reviews/:id - Get single review
    {
      matcher: "/admin/reviews/:id",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          isList: false,
          defaults: [
            "id",
            "title",
            "content",
            "rating",
            "status",
            "first_name",
            "last_name",
            "verified_purchase",
            "product_id",
            "customer_id",
            "created_at",
            "updated_at",
            "product.*",
            "images.*",
          ],
        }),
      ],
    },
  ],
})

