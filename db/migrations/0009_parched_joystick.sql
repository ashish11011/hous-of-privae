ALTER TABLE "products" ADD COLUMN "pricing_config" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "semi_stitched_price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "banner_image";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "images";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "is_deleted";