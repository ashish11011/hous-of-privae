CREATE TABLE "gift_card_reservations" (
	"order_id" uuid PRIMARY KEY NOT NULL,
	"gift_card_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_paise" integer NOT NULL,
	"status" varchar DEFAULT 'reserved' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gift_card_reservation_positive" CHECK ("gift_card_reservations"."amount_paise" > 0),
	CONSTRAINT "gift_card_reservation_status_valid" CHECK ("gift_card_reservations"."status" in ('reserved', 'spent'))
);
--> statement-breakpoint
CREATE TABLE "gift_card_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gift_card_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"type" varchar NOT NULL,
	"amount_paise" integer NOT NULL,
	"balance_after_paise" integer NOT NULL,
	"reference_key" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gift_card_transactions_reference_key_unique" UNIQUE("reference_key")
);
--> statement-breakpoint
CREATE TABLE "gift_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchaser_id" uuid NOT NULL,
	"claimed_by_id" uuid,
	"purchaser_email" varchar(254) NOT NULL,
	"sender_name" varchar(120) NOT NULL,
	"recipient_name" varchar(120) NOT NULL,
	"recipient_email" varchar(254),
	"message" text DEFAULT '' NOT NULL,
	"design" varchar(30) DEFAULT 'classic' NOT NULL,
	"request_hash" varchar(64) NOT NULL,
	"initial_amount_paise" integer NOT NULL,
	"balance_paise" integer DEFAULT 0 NOT NULL,
	"code_hash" varchar(64),
	"encrypted_code" text,
	"code_suffix" varchar(4),
	"payment_status" varchar DEFAULT 'pending' NOT NULL,
	"razorpay_order_id" varchar,
	"razorpay_payment_id" varchar,
	"expected_amount_paise" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"purchaser_email_sent_at" timestamp,
	"recipient_email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"activated_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gift_cards_code_hash_unique" UNIQUE("code_hash"),
	CONSTRAINT "gift_cards_razorpay_order_id_unique" UNIQUE("razorpay_order_id"),
	CONSTRAINT "gift_cards_razorpay_payment_id_unique" UNIQUE("razorpay_payment_id"),
	CONSTRAINT "gift_card_balance_valid" CHECK ("gift_cards"."balance_paise" >= 0 and "gift_cards"."balance_paise" <= "gift_cards"."initial_amount_paise"),
	CONSTRAINT "gift_card_value_valid" CHECK ("gift_cards"."initial_amount_paise" >= 100000 and "gift_cards"."initial_amount_paise" <= 50000000 and "gift_cards"."expected_amount_paise" = "gift_cards"."initial_amount_paise")
);
--> statement-breakpoint
CREATE TABLE "account_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(80) DEFAULT '' NOT NULL,
	"recipient_name" varchar(120) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"line1" varchar(300) NOT NULL,
	"line2" varchar(300) DEFAULT '' NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"pincode" varchar(20) NOT NULL,
	"country" varchar(80) DEFAULT 'India' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"service" varchar(80) NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"status" varchar DEFAULT 'requested' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_appointments_contact_id_unique" UNIQUE("contact_id")
);
--> statement-breakpoint
CREATE TABLE "account_stylist_edits" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"product_ids" uuid[] DEFAULT '{}' NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(100) DEFAULT 'My measurements' NOT NULL,
	"unit" varchar DEFAULT 'inches' NOT NULL,
	"bust" numeric(7, 2),
	"waist" numeric(7, 2),
	"hips" numeric(7, 2),
	"shoulder" numeric(7, 2),
	"sleeve_length" numeric(7, 2),
	"kurta_length" numeric(7, 2),
	"inseam" numeric(7, 2),
	"height" numeric(7, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"date_of_birth" date,
	"preferred_top_size" varchar(20) DEFAULT '' NOT NULL,
	"preferred_bottom_size" varchar(20) DEFAULT '' NOT NULL,
	"preferred_blouse_size" varchar(20) DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_referrals" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(24) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_referrals_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "account_stock_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"size" varchar(20) DEFAULT '' NOT NULL,
	"notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_wishlist" (
	"user_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_wishlist_user_id_variant_id_pk" PRIMARY KEY("user_id","variant_id")
);
--> statement-breakpoint
CREATE TABLE "bespoke_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"milestone" varchar NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"image_url" text,
	"changed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bespoke_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"full_name" varchar(120) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(40) DEFAULT '' NOT NULL,
	"country" varchar(80) DEFAULT '' NOT NULL,
	"garment_type" varchar(120) NOT NULL,
	"occasion" varchar(100) DEFAULT '' NOT NULL,
	"event_date" date,
	"budget_range" varchar(80) DEFAULT '' NOT NULL,
	"fabric_preference" varchar(120) DEFAULT '' NOT NULL,
	"color_preference" varchar(120) DEFAULT '' NOT NULL,
	"inspiration_notes" text NOT NULL,
	"status" varchar DEFAULT 'submitted' NOT NULL,
	"current_milestone" varchar DEFAULT 'received' NOT NULL,
	"estimated_delivery_date" date,
	"email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "circle_accounts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"debt_points" integer DEFAULT 0 NOT NULL,
	"lumiere_bonus_points" integer DEFAULT 0 NOT NULL,
	"royale_bonus_points" integer DEFAULT 0 NOT NULL,
	"rewards_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "circle_debt_nonnegative" CHECK ("circle_accounts"."debt_points" >= 0)
);
--> statement-breakpoint
CREATE TABLE "circle_order_rewards" (
	"order_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"tier_key" varchar NOT NULL,
	"eligible_amount" integer NOT NULL,
	"normal_points" integer NOT NULL,
	"status" varchar DEFAULT 'pending_delivery' NOT NULL,
	"qualifying_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "circle_reward_values_valid" CHECK ("circle_order_rewards"."eligible_amount" >= 0 and "circle_order_rewards"."normal_points" >= 0)
);
--> statement-breakpoint
CREATE TABLE "circle_point_lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source" varchar NOT NULL,
	"source_key" varchar NOT NULL,
	"tier_key" varchar,
	"order_id" uuid,
	"points" integer NOT NULL,
	"remaining_points" integer NOT NULL,
	"expired_points" integer DEFAULT 0 NOT NULL,
	"voided_points" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "circle_point_lots_source_key_unique" UNIQUE("source_key"),
	CONSTRAINT "circle_lot_balance_valid" CHECK ("circle_point_lots"."remaining_points" >= 0 and "circle_point_lots"."remaining_points" <= "circle_point_lots"."points" and "circle_point_lots"."voided_points" >= 0 and "circle_point_lots"."voided_points" <= "circle_point_lots"."points" and "circle_point_lots"."expired_points" >= 0 and "circle_point_lots"."expired_points" <= "circle_point_lots"."points" - "circle_point_lots"."voided_points")
);
--> statement-breakpoint
CREATE TABLE "circle_redemptions" (
	"order_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"points" integer NOT NULL,
	"status" varchar DEFAULT 'reserved' NOT NULL,
	CONSTRAINT "circle_redemptions_order_id_lot_id_pk" PRIMARY KEY("order_id","lot_id"),
	CONSTRAINT "circle_redemption_positive" CHECK ("circle_redemptions"."points" > 0)
);
--> statement-breakpoint
CREATE TABLE "circle_transfers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sender_id" uuid NOT NULL,
	"recipient_email" varchar(254) NOT NULL,
	"recipient_id" uuid,
	"points" integer NOT NULL,
	"claimed_points" integer DEFAULT 0 NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"slices" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_referral_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referee_id" uuid NOT NULL,
	"first_order_id" uuid,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_referral_redemptions_referee_id_unique" UNIQUE("referee_id"),
	CONSTRAINT "account_referral_redemptions_first_order_id_unique" UNIQUE("first_order_id"),
	CONSTRAINT "referral_not_self" CHECK ("account_referral_redemptions"."referrer_id" <> "account_referral_redemptions"."referee_id")
);
--> statement-breakpoint
ALTER TABLE "gift_card_reservations" ADD CONSTRAINT "gift_card_reservations_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_card_reservations" ADD CONSTRAINT "gift_card_reservations_gift_card_id_gift_cards_id_fk" FOREIGN KEY ("gift_card_id") REFERENCES "public"."gift_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_card_reservations" ADD CONSTRAINT "gift_card_reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_gift_card_id_gift_cards_id_fk" FOREIGN KEY ("gift_card_id") REFERENCES "public"."gift_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_purchaser_id_users_id_fk" FOREIGN KEY ("purchaser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_claimed_by_id_users_id_fk" FOREIGN KEY ("claimed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_addresses" ADD CONSTRAINT "account_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_appointments" ADD CONSTRAINT "account_appointments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_appointments" ADD CONSTRAINT "account_appointments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_stylist_edits" ADD CONSTRAINT "account_stylist_edits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_measurements" ADD CONSTRAINT "account_measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_profiles" ADD CONSTRAINT "account_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_referrals" ADD CONSTRAINT "account_referrals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_stock_alerts" ADD CONSTRAINT "account_stock_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_stock_alerts" ADD CONSTRAINT "account_stock_alerts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_wishlist" ADD CONSTRAINT "account_wishlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_wishlist" ADD CONSTRAINT "account_wishlist_variant_id_product_varient_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_varient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bespoke_milestones" ADD CONSTRAINT "bespoke_milestones_request_id_bespoke_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."bespoke_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bespoke_milestones" ADD CONSTRAINT "bespoke_milestones_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bespoke_requests" ADD CONSTRAINT "bespoke_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_accounts" ADD CONSTRAINT "circle_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_order_rewards" ADD CONSTRAINT "circle_order_rewards_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_order_rewards" ADD CONSTRAINT "circle_order_rewards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_point_lots" ADD CONSTRAINT "circle_point_lots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_point_lots" ADD CONSTRAINT "circle_point_lots_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_redemptions" ADD CONSTRAINT "circle_redemptions_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_redemptions" ADD CONSTRAINT "circle_redemptions_lot_id_circle_point_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."circle_point_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_transfers" ADD CONSTRAINT "circle_transfers_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_transfers" ADD CONSTRAINT "circle_transfers_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_referral_redemptions" ADD CONSTRAINT "account_referral_redemptions_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_referral_redemptions" ADD CONSTRAINT "account_referral_redemptions_referee_id_users_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_referral_redemptions" ADD CONSTRAINT "account_referral_redemptions_first_order_id_order_id_fk" FOREIGN KEY ("first_order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gift_card_reservations_card_status_idx" ON "gift_card_reservations" USING btree ("gift_card_id","status");--> statement-breakpoint
CREATE INDEX "gift_card_reservations_user_status_idx" ON "gift_card_reservations" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "gift_card_transactions_card_idx" ON "gift_card_transactions" USING btree ("gift_card_id");--> statement-breakpoint
CREATE INDEX "gift_cards_purchaser_idx" ON "gift_cards" USING btree ("purchaser_id");--> statement-breakpoint
CREATE INDEX "gift_cards_claimed_by_idx" ON "gift_cards" USING btree ("claimed_by_id");--> statement-breakpoint
CREATE INDEX "account_address_user_idx" ON "account_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_address_default_unique" ON "account_addresses" USING btree ("user_id") WHERE "account_addresses"."is_default" = true;--> statement-breakpoint
CREATE INDEX "account_appointment_user_idx" ON "account_appointments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_appointment_slot_idx" ON "account_appointments" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "account_measurement_user_idx" ON "account_measurements" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_stock_alert_unique" ON "account_stock_alerts" USING btree ("user_id","product_id","size");--> statement-breakpoint
CREATE INDEX "bespoke_milestone_request_idx" ON "bespoke_milestones" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "bespoke_request_user_idx" ON "bespoke_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "circle_reward_user_idx" ON "circle_order_rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "circle_lot_user_expiry_idx" ON "circle_point_lots" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "circle_transfer_recipient_idx" ON "circle_transfers" USING btree ("recipient_email");--> statement-breakpoint
CREATE INDEX "circle_transfer_sender_idx" ON "circle_transfers" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "referral_redemption_referrer_idx" ON "account_referral_redemptions" USING btree ("referrer_id");