# Razorpay webhook setup

Endpoint: `POST https://<your-live-domain>/api/razorpay/webhook`.
For the Haus of Privae domain, use `https://www.hausofprivae.com/api/razorpay/webhook` once this code is deployed there. Use the canonical domain directly, without a redirect.

## Activate

1. Apply `db/migrations/0007_razorpay_webhook.sql` to the existing application database before deploying this code. It adds payment IDs/status, an immutable checkout snapshot and email-delivery timestamps; existing orders retain their status and get payment status `unknown`. It does not retroactively confirm or email old orders.
2. Configure these environment variables on the application:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`: a separate random secret, matching the webhook's Secret field in Razorpay. Never prefix this with `NEXT_PUBLIC_`.
   - Existing SES email settings: `NEXT_PUBLIC_S3_ACCESS_KEY`, `NEXT_S3_SECRET_KEY`, `NEXT_PUBLIC_S3_REGION`, and optionally `ADMIN_EMAIL_ID`.
3. Deploy. In Razorpay Dashboard, add the public HTTPS endpoint under Webhooks and select `payment.captured`, `order.paid`, `payment.failed`, and `payment.authorized`.
4. Configure automatic payment capture in Razorpay. Authorization alone does not confirm an order or send email.
5. Test with matching Razorpay test keys and a Test-mode webhook first. Live mode requires its own matching configuration. Ensure SES can send from `no-reply@hausofprivae.com` to your customers (SES sandbox restrictions still apply).

For an existing database whose earlier migrations are already applied, the new additive migration can also be applied directly:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0007_razorpay_webhook.sql
```

Use your normal migration tracking process; do not apply the same migration twice. The existing historical migration chain contains `variant` in both 0001 and 0004, so check that history before running all migrations against a fresh database.

## Behavior

- `/api/razorpay/create-order` now accepts customer/address details and cart product IDs, quantities, sizes, colors and variants. It calculates prices and shipping from the database, saves an unpaid internal order and its items, then creates and links the Razorpay order. Client-supplied totals are ignored. The current checkout has no active coupon discount implementation.
- The webhook verifies HMAC-SHA256 over the raw request body using `X-Razorpay-Signature`, then checks saved order ID, amount and currency.
- `payment.authorized`: payment `authorized`, order `pending_payment`, no email/rewards.
- `payment.failed`: payment `failed`, order `payment_failed`, no email/rewards. It cannot overwrite an authorized or paid state.
- `payment.captured` / `order.paid`: payment `paid`, order `confirmed`, paid amount and payment ID saved; loyalty rewards awarded atomically once. Existing fulfillment status is preserved on replay.
- Only the webhook sends customer confirmation and admin order email. The old `/api/order/create` endpoint returns 410. `/api/razorpay/verify-payment` checks the checkout signature and reads status; it cannot confirm or send mail.
- The checkout polls for up to roughly 30 seconds and otherwise shows a pending confirmation message. Closing the browser does not prevent webhook processing.
- Duplicate/concurrent success events are serialized using PostgreSQL row locks. Separate customer/admin sent timestamps prevent ordinary duplicate emails, including partial email failures. Database or SES errors return 500 so Razorpay can retry; successful payment/reward updates are not rolled back by an email failure.
- SES does not support a transaction shared with PostgreSQL: a crash or ambiguous network timeout after SES accepts mail but before the timestamp commits can result in a repeated email. Payment and loyalty updates remain idempotent.
- Unknown Razorpay order IDs return 500 for retry/investigation. This endpoint handles orders created by the new checkout; old checkout orders did not persist their Razorpay IDs.
- Refund events are ignored; refund processing is outside this payment-confirmation flow.

## Tests

The integration suite uses real PostgreSQL transactions and row locks, with mocked Razorpay creation and SES delivery. It never sends real email or creates real payments.

Create an empty disposable **local** PostgreSQL database named `privae_webhook_test` (or a name with that prefix), then run:

```sh
TEST_DATABASE_URL=postgres://USER@127.0.0.1:5432/privae_webhook_test node tests/run-razorpay-tests.mjs
npx tsc --noEmit --incremental false
```

The runner refuses non-local URLs and database names outside that prefix. Use a fresh empty database for each run. Expected rejection/retry cases print error logs.

Official references: [signature validation and event ordering](https://razorpay.com/docs/webhooks/validate-test/) and [payment events](https://razorpay.com/docs/webhooks/payments).
