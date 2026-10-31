# Privae Experience gift cards

The Next.js app owns gift-card purchases, issuance, account claiming, balance history and order redemption. The supplied `haus-refined-charm` project is a local UI reference only. Its Supabase functions and manual WhatsApp payment flow are not used.

## Database and configuration

The schema declarations are in `db/giftCardSchema.ts`, exported through `db/schema.ts`. They add `gift_cards`, `gift_card_reservations` and `gift_card_transactions`. Existing order columns are reused; gift-card tender details live in the immutable order checkout snapshot. No gift-card migration has been generated or applied by this change. The schema must be applied separately before enabling purchases. Existing garment payments continue to work while these tables are absent.

Use the existing Razorpay API keys, captured-payment webhook and SES settings. The existing `/api/razorpay/webhook` processes both garment and gift-card purchases. Enable `payment.captured`, `order.paid`, `payment.authorized` and `payment.failed` and use automatic capture. The browser callback verifies its signature and reads saved status; only a captured-payment webhook can activate a purchased card.

Set `GIFT_CARD_ENCRYPTION_KEY` to a stable random secret containing at least 32 characters. If omitted, the application uses `NEXTAUTH_SECRET` when it is at least 32 characters. Keep the chosen secret stable and backed up: changing it without re-encrypting existing records prevents retrieval of their codes. It must never be a `NEXT_PUBLIC_` variable. The application stores a SHA-256 lookup hash and AES-256-GCM ciphertext; it does not store plaintext codes. Codes have 96 bits of random entropy. There is no separate PIN.

## Customer flow

1. Open `/gifting`, choose a preset value (₹10,000, ₹25,000, ₹50,000 or ₹1,00,000) or a whole-rupee custom value from ₹1,000 to ₹5,00,000. Sign in, name the recipient and sender, and optionally add a recipient email and personal message.
2. Pay with Razorpay. An unpaid purchase has no usable code or balance. On capture, the webhook issues the value once and sends the buyer and, if supplied, the recipient their card. Purchases earn no loyalty points.
3. My Account → Gift Cards (`/profile#gift-cards`) shows purchased and claimed cards, live balances, history, pending payments and email-delivery retry. Share a card privately using the share button or copy its code. Optional email delivery happens after activation; scheduled delivery is not offered.
4. The recipient signs in and claims the code in their account, or applies it during checkout. Placing an order automatically claims an unclaimed card. Once claimed, another account cannot spend it, even if it knows the code. Gift cards currently have no automatic expiration.
5. Checkout applies one card, alongside optional loyalty redemption, to the order total including delivery and gift wrapping. The server rechecks card ownership, product pricing and available balance. Any remainder is paid through Razorpay; a fully covered order is settled directly in one database transaction and never opens a zero-value Razorpay payment. Unused balance remains for future orders.

Coupon entry was removed from checkout. Historical coupon data and admin coupon records are preserved.

## Payment and balance guarantees

- Purchases and card-funded checkouts use client-generated request IDs, account locks and saved request fingerprints to make retries idempotent.
- Account, order and gift-card row locks serialize concurrent claims and spending. Reservations prevent two pending checkouts from spending the same balance. The ledger has unique purchase/order reference keys, so repeated webhooks cannot issue or debit credit twice.
- Failed or closed partial-payment attempts retain their reservation because Razorpay may still capture a delayed payment. Checkout shows the reserved credit and resumes the original gateway order and amount. Credit is not released on an untrusted browser cancellation. There is no automatic reservation expiry or cancellation/refund workflow in this change.
- On capture, the gift balance, points ledger and garment order settle in the same transaction. `totalAmountPaid` records all settled tender; `expectedAmountPaise` records only the Razorpay portion. Snapshot fields `giftCardAmount`, `giftCardSuffix` and `cashAmount` provide the breakdown in admin order details and confirmation emails.
- Separate email-delivery markers allow webhook retries to complete missing deliveries without issuing another card. As with existing SES order emails, a process failure after SES accepts an email but before its marker commits can cause an email duplicate, without duplicating gift-card value.
- Fully gift-card-funded orders return confirmation even if email fails, with a retry action in checkout. Payment status is never set from a browser assertion.
- The supplied reference's expiry, PIN, delivery-date and separate Circle rules are not copied into backend policy.

## Verification

`node tests/run-gift-card-tests.mjs` requires `TEST_DATABASE_URL` pointing to an empty, disposable local PostgreSQL database named `privae_webhook_test*`. The runner rejects remote/application database URLs. It exercises the existing garment payment suite and gift-card issuance, sharing/claiming, concurrent callbacks, split and fully funded orders, balances, rollback and authorization with mocked Razorpay and SES. No real payments or emails are made.

The new gift-card test tables are created from the ORM declarations only in that disposable database; no application migration files are generated. Run `npx tsc --noEmit`, the gift-wrap and collection test runners, and `npm run build` for the remaining checks.

Razorpay references: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/ and https://razorpay.com/docs/webhooks/payments/.
