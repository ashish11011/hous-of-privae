# Manage orders

Open `/admin/orders` while signed in with an account whose database `users.user_type` is `1`.

Each row has **View details** and **Update status** links beside the order reference. They open `/admin/orders/<order-id>`, where admins can see:

- Customer contact information and shipping address.
- Purchased items, quantities, sizes, colors, variants, and saved purchase prices.
- Order totals, paid amount, and Razorpay references.
- Current fulfillment/payment status and the history of admin status changes.

The status control appears at the top of the details page. **Update & email customer** saves the new fulfillment status and sends the customer a status email through SES. If SES fails, the new status remains saved and the history shows **Retry email**. Retry the pending email before advancing to another status. Ordinary duplicate requests do not resend email. As with other SES notifications, a crash after SES accepts mail but before the delivery timestamp commits can cause a repeated email.

The server checks the database admin role for details, updates, and email retries. The existing browser PIN alone does not grant these permissions. Payment confirmation remains exclusively controlled by the verified Razorpay webhook. Fulfillment requires a paid order, or a legacy order with a recorded paid amount. Cancellation and return statuses do not issue refunds.

Orders with no original price snapshot show “Not recorded” for item prices instead of using today's catalog prices.

Required schema: migration `0008_order_status_notifications.sql` (on top of the Razorpay payment migration). The configured database was checked and already contains this table. Other environments must apply the migration before using these controls.

Verification: `TEST_DATABASE_URL=postgres://USER@127.0.0.1:5432/privae_webhook_test node tests/run-razorpay-tests.mjs` uses a fresh disposable local database and mocks email/Razorpay. It covers authorization, item snapshots, status changes, stale requests, concurrent requests, email failures/retries, and payment webhook behavior. It sends no real emails.
