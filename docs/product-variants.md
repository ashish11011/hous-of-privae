# Product variants and size pricing

The application uses the schema through `0010_noisy_lizard`: shared product details and `pricing_config` live in `products`; colors, banner images, and galleries live in `product_varient` linked by `product_id`. The database spelling `product_varient` is intentionally retained.

## Admin

Open `/admin/products/create` or edit a product from `/admin`. Each product has:

- One pricing row for each size in `const/globalConstants.ts` (`SIZES`). `basePrice` is the selling price in whole rupees. Hidden sizes are not purchasable. Visible sizes require a positive price. `strikethroughPrice` is optional and shown crossed out only if higher than the selling price.
- One or more color variants. Each needs a color and a banner image; gallery images are optional. You can upload images, edit a variant without changing its ID, add variants, or remove variants.
- Shared categories, fabric, care, descriptions, materials, and stock availability.

Save operations validate all rows and update the product and variants in one transaction. Admin accounts are required for mutations. Archive hides all sizes while retaining product/order references. To restore an archived product, enable its size prices again and set stock availability.

## Storefront and checkout

Catalog/category/search/landing lists have one card per variant. A product with two variants has two cards. Card links include `?variant=<variant-id>` and open that variant's gallery. Switching color navigates to its own variant URL. Price changes with the selected visible size. Lists display the lowest visible size price.

New wishlist entries use variant IDs. Legacy product-level entries still resolve to the first variant and can be removed. Cart rows are distinguished by product ID, variant ID, size, color, and stitching choice. Old persisted carts without variant IDs are cleared on the version migration because they cannot identify the new variant records; shoppers must add those items again.

Checkout validates that the chosen variant belongs to the product and the size is visible. Prices and color come from the database, not submitted cart fields. Orders store `product_variant_id` plus immutable product/variant/size/color/price/image snapshots. Removing a variant clears its order-item foreign key, while new order snapshots retain the purchased details. Payment webhook and status-email flows continue to use the saved snapshot. Order confirmation email includes the selected color.

## Existing data and deployment

The user confirmed migrations through 0010 were applied and the earlier product data was removed. This code does not restore deleted rows or synthesize sample products. Create the new products and variants through admin. Keep the already-applied migration history unchanged. Other environments must have the matching schema before this code is deployed.

## Verification

`npx tsc --noEmit --incremental false`

The existing isolated PostgreSQL integration runner now covers variant CRUD, transaction rollback, variant ownership, two-card category results, search/pagination/wishlist identity, hidden sizes, global size validation, database-priced checkout, and existing payment/order flows. External payment and email providers are mocked.
