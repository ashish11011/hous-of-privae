# Account dashboard and Privae Circle

The dashboard follows the supplied `haus-refined-charm` account UI: Cormorant Garamond headings, Montserrat body text, membership header and horizontal navigation. Its twelve sections are Overview, For You, Orders, Privae Circle, Refer a Friend, Gift Cards, Wishlist, Addresses, Appointments, Bespoke, Measurements and Profile. Next.js account APIs and PostgreSQL own the data; reference Supabase endpoints and demo balances are not used.

## Database activation

`db/accountSchema.ts`, exported by `db/schema.ts`, declares the account, atelier, referral and Circle tables, indexes and constraints. **No application migration files were generated and no application database migrations were run.** These declarations need to be applied separately before the new features become available. The API returns a temporary-unavailable response while the account tables are absent. Existing checkout retains the previous loyalty rules until the Circle tables exist.

No new environment variables are required. Referral cookies use the existing stable server-only `GIFT_CARD_ENCRYPTION_KEY` or `NEXTAUTH_SECRET`; authentication, Razorpay and SES retain their existing configuration.

## Programme rules

| Tier | Eligible spend in the preceding 24 calendar months | Points per ₹1 |
| --- | --- | --- |
| Muse | ₹0–₹49,999 | 1 |
| Eclat | ₹50,000–₹1,00,000 | 1.25 |
| Lumiere | ₹1,00,001–₹2,00,000 | 1.5 |
| Royale | ₹2,00,001 and above | 2 |

The tier and earning rate are stamped in the immutable checkout snapshot. Eligible value is full-price garment value after points discounts and gift-card funding; sale pieces, delivery and gift wrapping do not earn points. Buying a gift card does not earn points. Members receive complimentary standard shipping.

Captured garment payments create pending rewards. Rewards and eligible tier spend qualify five days after delivery and points expire 24 calendar months after that qualifying date. Lumiere awards 12,500 bonus points per ₹50,000 of cumulative qualifying purchases stamped in that tier. Royale awards 25,000 per ₹50,000 stamped in Royale, replacing the Lumiere bonus on those purchases. Milestones use net eligible purchase value and are not issued retrospectively on old orders.

Ten points equal ₹1. Redemption starts at 1,000 points, uses increments of 100, and is capped at 20% of full-price merchandise value. Server catalogue prices determine eligibility. Both points and gift credit can fund an order; only the remaining eligible value earns points.

Existing balances are adopted once as nonexpiring legacy point lots. Previously created checkouts keep their original settlement calculation, with their resulting balance mirrored into the new ledger when needed.

## Transfers, referrals and returns

Members can transfer at least 1,000 whole points by email. Transfers to existing members settle immediately; invitations to nonmembers remain pending until the matching account signs in. Original point expiry dates are retained, including while awaiting membership. Transfers cannot consume checkout reservations and retries use the same request ID.

Referral links capture a signed 30-day cookie. Only a newly created account with no prior orders can claim a referral. After its first paid garment order, the friend and referrer each receive 20,000 Circle Points (₹2,000 of wardrobe credit), subject to the normal redemption cap and expiry. Self-referrals and duplicate rewards are rejected. A gift-card purchase alone does not qualify.

Returned or cancelled qualifying orders reverse normal rewards, lost milestone bonuses and referral rewards. Unused expired awards do not become debt. Already spent or transferred value is recovered from available points or future credits without making the displayed balance negative. These adjustments do not issue a cash refund or automatically refund gift credit.

Point maturity, expiry and tier recalculation run transactionally when accounts are loaded, checkout starts, transfers occur or fulfilment changes. No background scheduler is required. Points reserved against an unsettled Razorpay order remain protected after expiry until the payment settles. Abandoned reservations require manual resolution with the gateway; closing a browser popup cannot release value that could still be captured.

## Account features

Addresses support owned CRUD, one default and checkout selection. The profile dossier stores identity, date of birth and fit preferences. Measurement sets persist with explicit inches/cm units and can populate fit/customisation forms. The wishlist synchronises signed-in accounts across devices and merges guest selections at first sign-in. For You derives a cached catalogue selection from preferences, wishlist and purchases rather than static reference products.

Appointment bookings use India time, check overlapping durations, retain existing admin contacts and expose only the owner's bookings. Customers can cancel active account bookings. Bespoke submissions persist an owned commission and production timeline. Admin → Atelier Requests manages booking status and commission stages, notes, images and delivery estimates. Admin mutations use the existing admin allowlist. Back-in-stock subscriptions are account-owned and send SES email once when an admin saves a product with the requested size available.

## Validation

`tests/run-account-tests.mjs` requires an empty disposable local PostgreSQL database named `privae_account_test*` through `TEST_DATABASE_URL`. It rejects remote/application database URLs, constructs the new tables directly from their declarations only in that database, and mocks authentication, Razorpay and SES. It covers ownership, concurrent defaults/bookings/redemptions, dossier data, wishlist, recommendations, bespoke stages, tier boundaries, delivery delay, milestones, returns, expiry, transfers, referral rewards, legacy pending payments and gift-funded earning exclusions. No real payments or emails are sent.

Additional checks: TypeScript, production build, existing gift-card/payment integration, gift-wrap, collection and admin-auth runners. Browser visual review remains unverified because browser access to the local preview was declined in this session.

## Save and reload guarantees

Account and atelier writes use canonical API URLs and reject redirected writes or responses that do not explicitly confirm a mutation. Address and measurement success messages follow a successful reload of the saved record. Atelier writes return the committed commission and its complete milestone history; the admin card uses that response directly so a stale listing reload cannot turn a successful save into an error. A refresh error stays visible; retrying a newly created address or measurement updates its returned ID rather than creating a duplicate. Older responses cannot overwrite a newer reload.

The admin atelier view includes the persisted customer-visible production timeline. Empty profile phone numbers are normalised rather than rejected as null. Wishlist updates made during sign-in synchronisation are preserved and the dashboard refreshes after successful synchronisation.

`tests/run-dashboard-flow-tests.mjs` uses `TEST_DATABASE_URL` with the same local-only disposable database restriction. It mounts the real React dashboard and admin forms in jsdom, runs requests through actual authenticated API handlers and verifies PostgreSQL state and fresh page loads. Its 13 scenarios cover every tab, create/edit/delete persistence, checkout address retrieval, admin/customer milestones, stale responses, failed refreshes, malformed success responses, profile/measurement saves, transfers, referrals, gift claiming, appointments, wishlist synchronisation and order ownership. Only platform authentication and external payments/email are mocked. Separate authenticated HTTP round trips through a temporary Next.js server verify address and bespoke persistence; browser visual review remains unverified.
