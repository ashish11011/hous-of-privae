ALTER TABLE "order" ADD COLUMN "payment_status" varchar DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "razorpay_order_id" varchar;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "razorpay_payment_id" varchar;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "expected_amount_paise" integer;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "currency" varchar DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "checkout_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "confirmation_email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "admin_email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_razorpay_order_id_unique" UNIQUE("razorpay_order_id");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_razorpay_payment_id_unique" UNIQUE("razorpay_payment_id");