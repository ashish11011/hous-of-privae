export const ORDER_STATUS = ["stitching", "dispatched", "delivered"];
export const COLORS = [
  { value: "green", label: "Green", hex: "#008000" },
  { value: "red", label: "Red", hex: "#FF0000" },
  { value: "purple", label: "Purple", hex: "#800080" },
  { value: "gold", label: "Gold", hex: "#FFD700" },
  { value: "lavender", label: "Lavender", hex: "#E6E6FA" },
  { value: "yellow", label: "Yellow", hex: "#FFFF00" },
  { value: "sky-blue", label: "Sky Blue", hex: "#87CEEB" },
  { value: "violet", label: "Violet", hex: "#8A2BE2" }, // interpreted as light purple
  { value: "amethyst", label: "Amethyst", hex: "#9966CC" }, // also light purple-ish
  { value: "gray", label: "Gray", hex: "#808080" },
  { value: "ash-gray", label: "Ash Gray", hex: "#B2BEB5" },
  { value: "champagne", label: "Champagne", hex: "#F7E7CE" }, // golden-gray tone
];

export const MATERIALS = ["Cotton", "Wool", "Silk", "Leather", "Linen"];

export const CATEGORY_1 = [
  {
    id: "c1a1e1b1-1234-4d3a-9f0a-abc111def001",
    name: "Sarees",
    slug: "sarees",
    image: "https://ik.imagekit.io/hop/category/sarees.jpg?w=300&h=300",
    tagline: "Elegance woven in every thread",
  },
  {
    id: "c1a1e1b2-1234-4d3a-9f0a-abc111def002",
    name: "Occasion Wear",
    slug: "occasion-wear",
    image: "https://ik.imagekit.io/hop/category/occasion-wear.jpg?w=300&h=300",
    tagline: "Timeless elegance, modern silhouettes",
  },
  {
    id: "c1a1e1b5-1234-4d3a-9f0a-abc111def005",
    name: "Loungewear",
    slug: "loungewear",
    image:
      "https://ik.imagekit.io/hop/category/kurta-chunni-set.jpg?w=300&h=300",
    tagline: "Effortless style meets everyday comfort",
  },
  {
    id: "c1a1e1b9-1234-4d3a-9f0a-abc111def009",
    name: "Ready To Wear",
    slug: "ready-to-wear",
    image:
      "https://ik.imagekit.io/hop/1759177487581-Copy of 2S0A7588.webp?w=300&h=300",
    tagline: "Modern silhouettes, effortless style",
  },
];

export const moreSidebarCategories = [
  {
    id: 11,
    name: "Clearance",
    slug: "clearance",
  },
];

export const CATEGORY_2 = [
  {
    id: "7f5a8f99-fbdc-472b-b43a-cc9dc12e1ddd",
    name: "Summer Vibes",
    slug: "summer-vibes",
    image: "/categoryimage.png",
  },
  {
    id: "cbaf4d2b-9fd2-465b-b55e-9c8734ae2eee",
    name: "Trendy",
    slug: "trendy",
    image: "/categoryimage.png",
  },
  {
    id: "52b3df7c-e8b5-4f4a-b2c7-8423dd0f4fff",
    name: "Festival Season",
    slug: "festival-season",
    image: "/categoryimage.png",
  },
  {
    id: "9f2ce7f1-43aa-4a0d-8cfa-b7dc12ab1aaa",
    name: "Casual",
    slug: "casual",
    image: "/categoryimage.png",
  },
];

export const SIZES = ["s", "m", "l", "xl", "xxl", "xs"] as const;
