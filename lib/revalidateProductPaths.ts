import { revalidatePath } from "next/cache";
import { getCategoryBySlugOrId } from "./categoryHelper";

type ProductPathInput = {
  slug?: string | null;
  categoryId1?: string | null;
  categoryId2?: string | null;
  category_id_1?: string | null;
  category2_id_2?: string | null;
  category_id_2?: string | null;
};

export async function revalidateProductCatalogPaths(
  ...products: Array<ProductPathInput | null | undefined>
) {
  const paths = new Set(["/", "/product", "/bestsellers", "/collections", "/new-arrivals", "/search", "/admin"]);
  const categoryValues = new Set<string>();

  products.forEach((product) => {
    if (!product) return;

    if (product.slug) {
      paths.add(`/product/${product.slug}`);
    }

    [
      product.categoryId1,
      product.categoryId2,
      product.category_id_1,
      product.category2_id_2,
      product.category_id_2,
    ].forEach((value) => {
      if (value) categoryValues.add(value);
    });
  });

  for (const value of categoryValues) {
    paths.add(`/category/${value}`);

    const category = await getCategoryBySlugOrId(value);
    if (category?.id) paths.add(`/category/${category.id}`);
    if (category?.slug) paths.add(`/category/${category.slug}`);
  }

  paths.forEach((path) => revalidatePath(path));
}
