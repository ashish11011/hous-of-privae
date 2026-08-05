CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"image" varchar,
	"tagline" varchar,
	"level" integer DEFAULT 1 NOT NULL,
	"parent_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(20) NOT NULL,
	"description" varchar(100) NOT NULL,
	"code" varchar(20) NOT NULL,
	"discount_percentage" integer NOT NULL,
	"discount_fixed_amount" integer NOT NULL,
	"use_once" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupon_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"coupon_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "variant" varchar DEFAULT 'stitched' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "subtotal_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "delivery_charge" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "discount_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "coupon_code" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "loyalty_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "coupon_transaction" ADD CONSTRAINT "coupon_transaction_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_transaction" ADD CONSTRAINT "coupon_transaction_coupon_id_coupon_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "category_level_idx" ON "categories" USING btree ("level");