"use client";
import { motion } from "motion/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { TInfoCircle } from "@/lib/icons";
import { userWishlistStore, useStore } from "@/src/hepler/store/zustand";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { CartProduct } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { convertS3ToImageKit, formatNumberWithCommas } from "@/src/hepler";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Heart, Minus, Plus } from "lucide-react";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import TailoredFitFormModal from "@/components/productCustomization";
import SizeGuideSheet from "@/components/sizeChartSheet";
import { ShowProductPrice } from "@/lib/productHealper";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const ZoomableImage = ({ mainImage }: { mainImage: string }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  return (
    <div
      className="w-full bg-neutral-50 relative overflow-hidden cursor-crosshair"
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={(e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setPosition({ x, y });
      }}
    >
      <Image
        className="w-full h-auto object-cover block"
        src={convertS3ToImageKit(mainImage)}
        alt="Main Product Image"
        width={800}
        height={1000}
        priority
      />
      {showMagnifier && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-white overflow-hidden">
          <div
            className="w-full h-full relative"
            style={{
              transformOrigin: `${position.x}% ${position.y}%`,
              transform: "scale(2.5)",
            }}
          >
            <Image
              className="object-cover"
              src={convertS3ToImageKit(mainImage)}
              alt="Zoomed Product Image"
              fill
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProductInformation({ productData }: any) {
  const { images = [], bannerImage, ...productDetails } = productData;
  const imagesLength = images.length;

  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [mainImage, setMainImage] = useState<string>(images[0] || bannerImage);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      setMainImage(images[0]);
    } else if (bannerImage) {
      setMainImage(bannerImage);
    }
  }, [images, bannerImage]);

  const isMobile = useIsMobile();

  return (
    <>
      <div className="  grid grid-cols-12 gap-6">
        {/* Left Side - Images */}

        {isPageLoaded ? (
          !isMobile ? (
            <div className=" col-span-12 w-full md:col-span-5 flex flex-col gap-4">
              {/* Main Image */}
              {mainImage && <ZoomableImage mainImage={mainImage} />}

              {/* Thumbnail Images */}
              <div className="flex w-full flex-wrap gap-3">
                {images.map((image: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(image)}
                    className={`shrink-0 border-2 transition-all ${mainImage === image
                      ? "border-neutral-800"
                      : "border-transparent hover:border-gray-300"
                      }`}
                  >
                    <Image
                      className="w-20 md:w-24 lg:w-28 h-auto object-cover"
                      src={convertS3ToImageKit(image)}
                      alt={`Thumbnail ${idx + 1}`}
                      width={100}
                      height={100}
                      priority
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className=" col-span-12">
              <Carousel
                plugins={[
                  Autoplay({
                    delay: 2000,
                  }),
                ]}
              >
                <CarouselContent>
                  {images.map((image: string, idx: number) => (
                    <CarouselItem key={idx}>
                      <Image
                        className="w-full h-auto object-cover "
                        src={convertS3ToImageKit(image)}
                        alt={`Image ${idx + 1}`}
                        width={100}
                        height={100}
                        priority
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext className=" right-5 " />
                <CarouselPrevious className=" left-6" />
              </Carousel>
              <div className=" flex overflow-x-auto gap-3 p-3">
                {images.map((image: string, idx: number) => {
                  return (
                    <Image
                      className=" w-16 h-auto"
                      src={convertS3ToImageKit(image)}
                      alt={`Image ${idx + 1}`}
                      width={100}
                      height={100}
                      priority
                    />
                  );
                })}
              </div>
            </div>
          )
        ) : null}

        {/* Right Side - Placeholder */}
        <div className="w-full p-4 md:p-6 xl:p-10 col-span-12 md:col-span-7">
          <ProductAbout productData={productData} />
        </div>
      </div>
    </>
  );
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  fabric: string | null;
  care: string | null;
  style_note: string | null;
  customization: string | null;
  model_height: string | null;
  description: string;
  bannerImage: string;
  basePrice: number;
  semiStitchedPrice?: number;
  categoryId1: string;
  categoryId2: string | null;
  slug: string;
  images: string[];
  sizes: string[];
  colors: string[]; // hex codes
  materials: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

const ProductAbout = ({ productData }: { productData: Product }) => {
  const { addItemToStore, increaseQuantity, decreaseQuantity, productStore } =
    useStore();
  const { addItemToWishlist, productWishlist, removeItemFromWishlist } =
    userWishlistStore();
  const [selectedColor, setSelectedColor] = useState(productData.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    productData.sizes?.[0]
  );

  const router = useRouter();

  const handleAddToCart = () => {
    toast.success("Item added to cart", {});

    if (selectedColor && selectedSize) {
      const product: CartProduct = {
        id: productData.id,
        name: productData.name,
        basePrice: productData.basePrice,
        slug: productData.slug,
        quantity: 1,
        bannerImage: productData.bannerImage,
        size: selectedSize,
        color: selectedColor,
      };
      addItemToStore(product);
    }
  };

  const productExtraDetails = [
    {
      name: "care",
      value: productData.care,
      label: "Care",
    },
    {
      name: "style_note",
      value: productData.style_note,
      label: "Style Note",
    },
    {
      name: "customization",
      value: productData.customization,
      label: "Customization",
    },
    // {
    //   name: "model_height",
    //   value: productData.model_height,
    //   label: "Model Height",
    // },
  ];

  function removeWishlistHandler(id: string) {
    removeItemFromWishlist(id);
    toast.success("Removed from wishlist");
  }

  function addWishlistHandler(id: string) {
    addItemToWishlist(id);
    toast.success("Added to wishlist");
  }

  function handleBackClick() {
    router.push("/");
  }
  function getProdcutPrice() {
    if (selectedSize === "semi-stitched" && productData.semiStitchedPrice) {
      return productData.semiStitchedPrice;
    }
    return productData.basePrice;
  }

  return (
    <div className="flex flex-col gap-6 h-fit sticky top-16 text-neutral-800">
      <Toaster position="top-right" />

      {/* Header section */}
      <div>
        <div className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 uppercase w-max mb-3">New</div>
        <h1 className="text-3xl font-serif mb-1 text-neutral-800">{productData.name}</h1>
        <p className="text-xs text-neutral-400 uppercase tracking-widest mb-4">SKU: {productData.sku}</p>
        <p className="text-xl text-primary font-medium mb-4">
          <ShowProductPrice price={getProdcutPrice()} />
        </p>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {productData.description || "A whisper of lilac, drawn long and lit from within. Made to drift through unhurried evenings."}
        </p>
      </div>

      {/* Variant Selection */}
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Choose Variant</p>
        <div className="grid grid-cols-2 gap-0 border border-neutral-300">
          <button className="bg-primary text-primary-foreground py-3 text-xs tracking-widest uppercase font-medium">Stitched</button>
          <button className="bg-transparent text-neutral-500 py-3 text-xs tracking-widest uppercase font-medium">Unstitched</button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
        <div>
          <p className="text-neutral-400 font-semibold tracking-widest uppercase mb-1">Fabric</p>
          <p className="text-neutral-600">{productData.fabric || "Pure Chanderi Silk"}</p>
        </div>
        <div>
          <p className="text-neutral-400 font-semibold tracking-widest uppercase mb-1">Color</p>
          {/* <p className="text-neutral-600">{productData.colors?.[0] || "Lilac"}</p> */}
          <div style={{
            backgroundColor: productData.colors?.[0]
          }} className={` h-8 w-20 `}></div>
        </div>
        <div>
          <p className="text-neutral-400 font-semibold tracking-widest uppercase mb-1">Occasion</p>
          <p className="text-neutral-600">Festive, Pooja, Wedding Guest</p>
        </div>
        <div>
          <p className="text-neutral-400 font-semibold tracking-widest uppercase mb-1">Work</p>
          <p className="text-neutral-600">Hand Embroidery, Mirror Work</p>
        </div>
      </div>

      {/* Size Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Select Size</p>
          <div className="flex  gap-3 text-xs text-primary">
            <TailoredFitFormModal />
            {/* <span className="text-neutral-300">·</span> */}
            <SizeGuideSheet />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {productData.sizes.map((size: string) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-fit px-4 h-10 border text-xs font-medium uppercase transition ${selectedSize === size
                ? "border-primary text-primary"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Complimentary Fit Adjustment */}
      <div className="bg-[#fdfbf7] border border-[#eaddce] text-[#a68a61] text-xs py-3 px-4 flex items-center gap-2 uppercase tracking-wide">
        <span>✂</span> Complimentary fit adjustment · 14 days
      </div>

      {/* Add to Bag and Wishlist */}
      <div className="flex gap-2">
        <Button
          onClick={() => handleAddToCart()}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-none tracking-widest uppercase text-xs font-medium"
        >
          Add to Bag
        </Button>
        <Button
          onClick={() => {
            if (productWishlist.filter((item) => item.id === productData.id)[0]) {
              removeWishlistHandler(productData.id);
            } else {
              addWishlistHandler(productData.id);
            }
          }}
          variant="outline"
          className="h-12 w-12 rounded-none border-neutral-300"
        >
          <Heart className={productWishlist.filter((item) => item.id === productData.id)[0] ? "fill-primary text-primary" : "text-neutral-500"} size={18} />
        </Button>
      </div>

      <Button variant="outline" className="w-full h-12 rounded-none border-neutral-300 text-neutral-600 tracking-widest uppercase text-xs font-medium">
        🔔 Notify me when back in stock
      </Button>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-12 rounded-none border-neutral-300 text-neutral-600 tracking-widest uppercase text-xs font-medium">
          Share
        </Button>
        <Button variant="outline" className="flex-1 h-12 rounded-none border-[#eaddce] bg-[#fdfbf7] text-[#a68a61] tracking-widest uppercase text-xs font-medium">
          Privae Concierge
        </Button>
      </div>

      {/* Delivery Check */}
      <div className="bg-[#f9f9f9] p-4 space-y-3">
        <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase flex items-center gap-2">
          📍 Check Delivery (Pincode)
        </p>
        <div className="flex gap-0">
          <Input type="text" placeholder="Enter pincode" className=" rounded-none flex-1 border border-neutral-300 px-3 text-sm focus:outline-none" />
          <button className="bg-primary text-primary-foreground px-6 text-xs uppercase tracking-widest font-medium">Check</button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-neutral-500 uppercase tracking-wide">
        <div className="bg-[#f9f9f9] py-4 flex flex-col items-center gap-1">
          <span className="text-primary mb-1">🚚</span>
          <span className="font-semibold text-neutral-700">Free Shipping</span>
          <span className="text-[9px] capitalize text-neutral-400">Across India</span>
        </div>
        <div className="bg-[#f9f9f9] py-4 flex flex-col items-center gap-1">
          <span className="text-primary mb-1">↺</span>
          <span className="font-semibold text-neutral-700">7-Day Returns</span>
          <span className="text-[9px] capitalize text-neutral-400">From Delivery</span>
        </div>
        <div className="bg-[#f9f9f9] py-4 flex flex-col items-center gap-1">
          <span className="text-primary mb-1">🛡️</span>
          <span className="font-semibold text-neutral-700">Authentic</span>
          <span className="text-[9px] capitalize text-neutral-400">100% Genuine</span>
        </div>
      </div>

      {/* Care for this piece */}
      <div className="border border-[#eaddce] p-4 text-xs">
        <p className="text-[#a68a61] uppercase tracking-widest font-semibold mb-2">Care for this piece</p>
        <p className="text-neutral-600 mb-2">
          {productData.care || "Dry clean only — entrust to a couture specialist · Store flat in muslin, away from light and moisture"}
        </p>
        <a href="#" className="text-primary hover:underline font-medium">Read all care notes →</a>
      </div>

      {/* Accordions */}
      <Accordion type="single" collapsible className="w-full border-t border-neutral-200">
        <AccordionItem value="story">
          <AccordionTrigger className="text-xs uppercase tracking-widest font-semibold text-neutral-600 hover:no-underline">
            <span className="flex items-center gap-2">✨ The Story Behind</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-neutral-600 space-y-4">
            <p>Hand-rendered in hand embroidery, mirror work on pure chanderi silk — finished in our Jaipur atelier by karigars whose families have practised these crafts for generations.</p>
            <p>Conceived for festive, pooja, wedding guest — a piece meant to be remembered, not merely worn.</p>
            <p>Slow couture · Made in small batches · Numbered to its maker.</p>
            <a href="#" className="text-primary font-medium hover:underline">Learn the language of craft →</a>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="included">
          <AccordionTrigger className="text-xs uppercase tracking-widest font-semibold text-neutral-600 hover:no-underline">
            What's Included — Piece Details
          </AccordionTrigger>
          <AccordionContent className="text-sm text-neutral-600 space-y-4">
            <p>Kurta<br />Palazzo Pants<br />Dupatta</p>
            <div className="space-y-2 mt-4">
              <div><strong className="font-semibold text-neutral-800">Fabric:</strong> {productData.fabric || "Pure Chanderi Silk"}</div>
              <div><strong className="font-semibold text-neutral-800">Work:</strong> Hand embroidery with mirror work on yoke, sleeves and hemline</div>
              <div><strong className="font-semibold text-neutral-800">Lining:</strong> Cotton lining</div>
              <div><strong className="font-semibold text-neutral-800">Length:</strong> Knee length</div>
              <div><strong className="font-semibold text-neutral-800">Details:</strong> Round neckline, three-quarter sleeves, side slits</div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="care">
          <AccordionTrigger className="text-xs uppercase tracking-widest font-semibold text-neutral-600 hover:no-underline">
            Garment Care
          </AccordionTrigger>
          <AccordionContent className="text-sm text-neutral-600 space-y-2">
            <p>• Dry clean only — entrust to a couture specialist</p>
            <p>• Store flat in muslin, away from light and moisture</p>
            <p>• Iron on reverse over a soft cloth; avoid embroidery</p>
            <p>• Keep away from perfumes, deodorants and direct sunlight</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="style">
          <AccordionTrigger className="text-xs uppercase tracking-widest font-semibold text-neutral-600 hover:no-underline">
            Style Tips
          </AccordionTrigger>
          <AccordionContent className="text-sm text-neutral-600 space-y-2">
            <p>✦ Pair with gold jhumkas and a potli bag for a festive look</p>
            <p>✦ Add a statement maang tikka for wedding guest styling</p>
            <p>✦ Wear with nude heels to elongate the silhouette</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="model">
          <AccordionTrigger className="text-xs uppercase tracking-widest font-semibold text-neutral-600 hover:no-underline">
            Model Specifications
          </AccordionTrigger>
          <AccordionContent className="text-sm text-neutral-600 space-y-2">
            <p>Height: {productData.model_height || "5'7\" / 170 cm"}</p>
            <p>Wearing: Size S</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="shipping">
          <AccordionTrigger className="text-xs uppercase tracking-widest font-semibold text-neutral-600 hover:no-underline">
            Shipping & Returns
          </AccordionTrigger>
          <AccordionContent className="text-sm text-neutral-600 space-y-4">
            <p><strong>Standard Dispatch (India):</strong> 5–7 business days post payment confirmation</p>
            <p><strong>Standard Dispatch (International):</strong> 7–10 business days post payment confirmation</p>
            <p><strong>Returns & Exchange (India):</strong> Within 7 days of delivery for unworn ready-to-ship pieces in original condition</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Need Help footer */}
      <div className="bg-[#eae1d8] p-5 text-sm text-neutral-700">
        <p className="uppercase text-[10px] tracking-widest text-neutral-500 font-semibold mb-2">Need help with this piece?</p>
        <p>
          For sizing, custom requests or any query, reach our atelier on <a href="tel:+917023117408" className="text-primary hover:underline font-medium">+91 7023117408</a> or write to <a href="mailto:queries.hausofprivae@gmail.com" className="text-primary hover:underline font-medium">queries.hausofprivae@gmail.com</a>.
        </p>
      </div>

    </div>
  );
};
