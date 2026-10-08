CREATE TABLE "loyalty_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar NOT NULL,
	"points" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"description" text NOT NULL,
	"order_id" uuid,
	"related_user_id" uuid,
	"transfer_id" uuid,
	"reference_key" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_transaction_reference_key_unique" UNIQUE("reference_key"),
	CONSTRAINT "loyalty_transaction_type_check" CHECK ("loyalty_transaction"."type" in ('order_reward', 'transfer_sent', 'transfer_received', 'redemption', 'reward_reversal', 'adjustment')),
	CONSTRAINT "loyalty_transaction_points_nonzero" CHECK ("loyalty_transaction"."points" <> 0),
	CONSTRAINT "loyalty_transaction_balance_nonnegative" CHECK ("loyalty_transaction"."balance_after" >= 0),
	CONSTRAINT "loyalty_transaction_points_direction" CHECK (
    ("loyalty_transaction"."type" in ('order_reward', 'transfer_received') and "loyalty_transaction"."points" > 0)
    or ("loyalty_transaction"."type" in ('transfer_sent', 'redemption', 'reward_reversal') and "loyalty_transaction"."points" < 0)
    or "loyalty_transaction"."type" = 'adjustment'
  )
);
--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "loyalty_points_redeemed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "loyalty_points_status" varchar DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "loyalty_transaction" ADD CONSTRAINT "loyalty_transaction_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transaction" ADD CONSTRAINT "loyalty_transaction_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_transaction" ADD CONSTRAINT "loyalty_transaction_related_user_id_users_id_fk" FOREIGN KEY ("related_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "loyalty_transaction_user_created_idx" ON "loyalty_transaction" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "loyalty_transaction_order_idx" ON "loyalty_transaction" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "loyalty_transaction_transfer_idx" ON "loyalty_transaction" USING btree ("transfer_id");--> statement-breakpoint
CREATE INDEX "order_user_loyalty_status_idx" ON "order" USING btree ("user_id","loyalty_points_status");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_loyalty_points_valid" CHECK ("order"."loyalty_points_redeemed" >= 0 and "order"."loyalty_points_redeemed" % 10 = 0);--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_loyalty_status_valid" CHECK (
    ("order"."loyalty_points_status" = 'none' and "order"."loyalty_points_redeemed" = 0)
    or ("order"."loyalty_points_status" in ('reserved', 'spent') and "order"."loyalty_points_redeemed" > 0)
  );--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_loyalty_redemption_cap" CHECK ("order"."loyalty_points_redeemed" <= ("order"."subtotal_amount" / 5) * 10);