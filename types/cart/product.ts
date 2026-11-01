export type CartProduct = {
  id: string;
  variantId: string;
  name: string;
  basePrice: number;
  isFullPrice?: boolean;
  slug: string;
  quantity: number;
  bannerImage: string;
  size: string;
  color: string;
  variant: "stitched" | "unstitched";
};
