// import { ProductCard } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import {
  fallbackCategories,
  getCategoryBySlugOrId,
  getProductByCategory,
} from "@/lib";

export const revalidate = 86400;
export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await fallbackCategories())
    .filter((cat) => cat.level === 1)
    .map((cat) => ({
      categoryID: cat.slug,
    }));
}

const Page = async ({ params }: { params: any }) => {
  const categoryParam = (await params).categoryID;
  const category = await getCategoryBySlugOrId(categoryParam);
  const categoryID = category?.id ?? categoryParam;
  const productsData = await getProductByCategory(categoryID, category?.slug);

  if (!productsData || productsData.length === 0)
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="eyebrow mb-3">Collections</p>
        <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
          No Products Found
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          This edit is being prepared by the atelier.
        </p>
      </div>
    );
  return (
    <div className="py-14 md:py-20 px-4">
      <div className="text-center mb-12">
        <p className="eyebrow mb-3">Curated Edit</p>
        <h1 className="font-heading text-4xl md:text-6xl text-foreground heading-rule">
          {category?.name ?? "Collection"}
        </h1>
        {category?.tagline && (
          <p className="font-body text-sm text-muted-foreground tracking-[0.12em] uppercase mt-6">
            {category.tagline}
          </p>
        )}
      </div>
      <div className="container gap-y-16 w-full mx-auto py-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {productsData.map((item, idx) => {
          return (
            <ProductCard
              className=" w-full lg:w-full"
              product={item}
              key={idx}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Page;
