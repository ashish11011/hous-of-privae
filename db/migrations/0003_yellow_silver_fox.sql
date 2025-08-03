ALTER TABLE "order" RENAME COLUMN "shipping_address" TO "address_line_1";--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "address_line_2" varchar;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "city" varchar;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "state" varchar;