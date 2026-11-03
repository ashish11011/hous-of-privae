CREATE TABLE "category_priorities" (
	"category_id" uuid PRIMARY KEY NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_product_priorities" (
	"category_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "category_product_priorities_category_id_product_id_pk" PRIMARY KEY("category_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "collection_products" ADD COLUMN "priority" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "category_priorities" ADD CONSTRAINT "category_priorities_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_product_priorities" ADD CONSTRAINT "category_product_priorities_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_product_priorities" ADD CONSTRAINT "category_product_priorities_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_product_priorities_product_idx" ON "category_product_priorities" USING btree ("product_id");