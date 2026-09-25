CREATE TABLE "product_varient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"color" varchar NOT NULL,
	"images" varchar[],
	"banner_image" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "pricing_config" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "product_variant_id" uuid;--> statement-breakpoint
ALTER TABLE "product_varient" ADD CONSTRAINT "product_varient_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_variant_id_product_varient_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_varient"("id") ON DELETE set null ON UPDATE no action;