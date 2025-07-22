import ProductCarousel from "@/components/ProductCarousel";
import Carousel from "@/components/HomeCrousel";
import NavBar from "@/components/navbar/NavBar";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import BrandValues from "./BrandValue";
import Footer from "@/components/Footer";
import RevicesCarousel from "@/components/RevicesCarousel";
import VideoPlay from "./VideoPlayback";
import { HomeBanner } from "./HouseBanner";
import { IconCategory2 } from "@tabler/icons-react";
import { categoryTable1, categoryTable2 } from "@/const/category/table";
import Link from "next/link";

export default function Home() {
  return (
    <div className=" w-full">
      <Carousel />
      <Categories />
      <VideoPlay />
      <HomeBanner />
      <Categories2 />

      <ProductCarousel />

      <RevicesCarousel />
      <BrandValues />
    </div>
  );
}

function Categories() {
  return (
    <div className=" py-10 space-y-8">
      <p className="roboto text-4xl font2 font-bold md:font-semibold  text-center">
        Categories
      </p>
      <div className=" grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5">
        {categoryTable1.map((item, idx) => {
          return (
            <div key={idx} className="  p-0.5 w-full h-64 lg:h-96 ">
              <Link href={`category/${item.slug}`}>
                <div className="group h-full cursor-pointer w-full overflow-hidden relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={800}
                    height={800}
                    className=" h-full group-hover:scale-110 duration-300  w-full object-cover"
                  />
                  <p
                    style={{
                      fontWeight: 800,
                    }}
                    className=" absolute top-1/2 left-1/2 text-black -translate-x-1/2 -translate-y-1/2  text-2xl text-center roboto line-clamp-2"
                  >
                    {item.name}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Categories2() {
  return (
    <div className=" px-3 py-4 w-full">
      <div className=" gap-6 lg:px-6 py-4 pb-6 flex-col lg:flex-row flex items-center justify-between">
        <div className=" flex flex-col sm:flex-row lg:items-center gap-2">
          <div className=" flex gap-3 items-center">
            <ArrowRight stroke="#000" strokeWidth={2.5} size={32} />
            <p
              style={{ wordSpacing: "6px" }}
              className=" text-4xl font2 font-semibold pr-6 uppercase tracking-tight"
            >
              Get The Look
            </p>
          </div>
          <p className=" max-w-lg text-neutral-700 font-medium uppercase">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolor
            consequatur vel suscipit quisquam?
          </p>
        </div>
        <div className=" w-full md:w-fit text-center duration-300 hover:bg-neutral-800 hover:text-white py-2 md:py-3 px-4 border border-black rounded-full text-lg roboto font-medium cursor-pointer">
          See all styles
        </div>
      </div>

      <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {categoryTable2.map((item, idx) => {
          return (
            <div key={idx} className="  p-0.5 w-full h-full ">
              <Link href={`category/${item.slug}`}>
                <div className="group h-full cursor-pointer w-full overflow-hidden relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={800}
                    height={800}
                    className=" h-full group-hover:scale-110 duration-300  w-full object-cover"
                  />
                  <p className=" drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] pr-2 text-left absolute bottom-2 md:bottom-6 left-2 md:left-6 text-white roboto text-2xl   font-bold font2 line-clamp-2">
                    {item.name}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
