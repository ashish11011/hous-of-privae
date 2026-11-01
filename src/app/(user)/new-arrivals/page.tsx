import ProductCard from "@/components/ProductCard";
import { getNewProducts } from "@/lib/productHelper";

export const metadata = {
  title: "New Arrivals | Haus of Privae",
  description: "Shop the newest pieces from the Haus of Privae atelier.",
};
export const dynamic = "force-dynamic";

export default async function NewArrivalsPage() {
  const products = await getNewProducts();
  return (
    <main className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <p className="eyebrow mb-3">The latest from our atelier</p>
        <h1 className="font-heading text-3xl md:text-5xl heading-rule">New Arrivals</h1>
      </div>
      {products.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch">
          {products.map((product) => <ProductCard key={product.variantId ?? product.id} product={product} />)}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">New pieces are on their way. Visit us again soon.</p>
      )}
    </main>
  );
}
