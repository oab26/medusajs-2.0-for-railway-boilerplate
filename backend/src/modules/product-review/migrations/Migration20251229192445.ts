import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251229192445 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "review" ("id" text not null, "title" text null, "content" text not null, "rating" real not null, "first_name" text not null, "last_name" text not null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "product_id" text not null, "customer_id" text null, "verified_purchase" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"), constraint rating_range check (rating >= 1 AND rating <= 5));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_REVIEW_PRODUCT_ID" ON "review" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "review_image" ("id" text not null, "file_id" text not null, "url" text not null, "review_id" text not null, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_image_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_REVIEW_IMAGE_REVIEW_ID" ON "review_image" ("review_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_image_deleted_at" ON "review_image" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "review" cascade;`);

    this.addSql(`drop table if exists "review_image" cascade;`);
  }

}
