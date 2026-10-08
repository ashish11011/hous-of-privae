# Loyalty points at checkout

Signed-in customers can use points for up to 20% of the item subtotal, excluding delivery. Ten points are worth ₹1. Redemption uses whole rupees, so the requested points must be a nonnegative multiple of 10. The limit is the smaller of the cart cap and the customer's available points.

For a ₹1,00,000 cart, a customer with at least 2,00,000 available points can redeem them for ₹20,000 off and pay ₹80,000. A customer with 50,000 available points can use ₹5,000 instead. New rewards are calculated on the amount paid through Razorpay after the points discount, including delivery.

## Payment and history

- The server calculates prices from the catalog and validates points against the signed-in account ID. A checkout email cannot select someone else's balance.
- Starting a checkout reserves the requested points without deducting the balance. Available points exclude reservations, including when transferring points to another customer. There can be one pending checkout using points per account.
- The order, reservation, and gateway order ID are saved together. Gateway creation failure rolls back the database transaction.
- The captured-payment webhook deducts the reserved points, awards new points, and appends `redemption` and `order_reward` transactions with their resulting balances. These changes commit together with payment confirmation. Existing order locking prevents duplicate webhook events from repeating them.
- Transfers record matching `transfer_sent` and `transfer_received` transactions and use consistent account lock ordering.
- Emails and admin order details include the points used and discount.

## Interrupted payments

Closing the popup or receiving a failed payment attempt does not spend points. The reservation remains, and checkout offers **Resume payment for pending order**, including when the current cart is empty. Resume uses the saved order amount and is restricted to the account that placed the order. If the current cart differs from the saved order, paying the saved order preserves the current cart.

There is no automatic reservation expiry or cancellation in this change. Razorpay orders allow multiple payment attempts, so releasing points on a popup close or failed attempt could let a later successful payment use points already spent elsewhere. See [Razorpay order payment attempts](https://github.com/razorpay/markdown-docs/blob/master/api/orders/create.md). An abandoned checkout keeps its reservation until that order is paid; manual resolution must account for any payment that can still be captured.

## Database setup pending

Only TypeScript definitions have been added. No migration or SQL files were generated, and no application migrations were run. Before deploying this code, the database needs the `loyalty_transaction` table and the order's `loyalty_points_redeemed` and `loyalty_points_status` columns with the indexes and constraints in their definitions. Existing orders should receive the defaults of zero points and status `none`. Historical rewards and transfers are not backfilled.

Database and browser tests were not run at the user's request.
