# Loyalty points at checkout

The Vite Privae Circle programme now governs new signed-in checkouts once the Circle schema exists. See [account-dashboard.md](account-dashboard.md) for tier rates, delivery qualification, 24-month expiry, milestone bonuses, referrals, transfers and returns.

Ten points equal ₹1. Redeem at least 1,000 points in increments of 100, up to 20% of full-price merchandise. Sale pieces, delivery and gift wrapping are excluded. Gift-card funding is also excluded from the amount earning new rewards. The server uses catalogue prices and the authenticated account ID, never a submitted email or balance.

Checkout reserves requested points without spending them. Available points exclude reservations, including during transfers. Capture deducts the exact reserved point lots and creates pending rewards in the same transaction as the payment confirmation. Rewards become available five days after delivery. Repeated captured-payment webhooks cannot repeat settlement.

Closing a popup or receiving a failed attempt does not spend or release the reserved points: Razorpay can still capture another attempt against that order. Checkout offers **Resume payment for pending order** even when the current cart is empty. Resume uses the saved order amount and is restricted to its owner. Point lots backing these reservations are protected from expiry until settlement. There is no automatic abandonment cancellation.

Existing balances are retained. Orders created under the previous programme retain their original settlement rules. While the new Circle tables are absent, existing checkout continues its previous rules: redemption in multiples of 10, capped at 20% of item subtotal, and the original reward calculation at capture.

Only TypeScript schema declarations have been added; no application migration was generated or run. Account/payment integration tests use disposable local databases with mocked payment and email services. See the account dashboard document for the test runner and schema activation details.
