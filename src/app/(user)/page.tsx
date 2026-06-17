import ProductCarousel from "@/components/ProductCarousel";
import Carousel from "@/components/HomeCrousel";
import Image from "next/image";
import BrandValues from "./BrandValue";
import Link from "next/link";
import { CATEGORY_1 } from "@/const";
import { Button } from "@/components/ui/button";
import FaqSection from "@/components/Faq";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { Categories } from "./Categories";
import BrandStorySection from "./BrandStory";
import AppointmentSection from "./AppointmentSection";
import NotesFromJaipur from "./NoteFromJaipur";
import WatchTheMaisonSection from "./WatchTheMaisonSection";

export const revalidate = 86400;

export default async function Home() {
  return (
    <div className=" w-full">
      <Carousel />

      <Categories />
      <div className="section-rule my-2" />
      {/* <VideoPlay /> */}
      {/* <Categories2 /> */}

      <ProductCarousel />
      <div className="h-12"></div>
      {/* <RevicesCarousel /> */}
      {/* <BrandValues /> */}
      {/* <CoutureSection /> */}
      {/* <div className="section-rule my-2" /> */}
      {/* <div className="reveal"><WatchTheMaisonSection /></div> */}
      {/* <div className="section-rule my-2" /> */}
      <div className="reveal"><NotesFromJaipur /></div>
      <div className="section-rule my-2" />
      <div id="privae-studio" className="reveal">
        <AppointmentSection />
      </div>
      <div className="reveal"><BrandStorySection /></div>
      <FaqSection />
      <div className="h-16"></div>
    </div>
  );
}



// function Categories2() {
//   return (
//     <div className=" px-3 py-4 w-full">
//       <div className=" gap-6 lg:px-6 py-4 pb-6 flex-col lg:flex-row flex items-center justify-between">
//         <div className=" flex flex-col sm:flex-row lg:items-center gap-2">
//           <div className=" flex gap-3 items-center">
//             <ArrowRight stroke="#000" strokeWidth={2.5} size={32} />
//             <p
//               style={{ wordSpacing: "6px" }}
//               className=" text-4xl font2 font-semibold pr-6 uppercase tracking-tight"
//             >
//               Get The Look
//             </p>
//           </div>
//           <p className=" max-w-lg text-neutral-700 font-medium uppercase">
//             Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolor
//             consequatur vel suscipit quisquam?
//           </p>
//         </div>
//         <Link href={`/product`}>
//           <div className=" w-full md:w-fit text-center duration-300 hover:bg-neutral-800 hover:text-white py-2 md:py-3 px-4 border border-black rounded-full text-lg roboto font-medium cursor-pointer">
//             See all styles
//           </div>
//         </Link>
//       </div>

//       <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
//         {CATEGORY_2.map((item, idx) => {
//           return (
//             <div key={idx} className="  p-0.5 w-full h-full ">
//               <Link href={`category/${item.slug}`}>
//                 <div className="group h-full cursor-pointer w-full overflow-hidden relative">
//                   <Image
//                     src={item.image}
//                     alt={item.name}
//                     width={800}
//                     height={800}
//                     className=" h-full group-hover:scale-110 duration-300  w-full object-cover"
//                   />
//                   <p className=" drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] pr-2 text-left absolute bottom-2 md:bottom-6 left-2 md:left-6 text-white roboto text-2xl   font-bold font2 line-clamp-2">
//                     {item.name}
//                   </p>
//                 </div>
//               </Link>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

function CoutureSection() {
  return (
    <div className="min-h-[24rem] md:min-h-[40rem] py-10 px-4  flex flex-col items-center justify-end w-full relative">
      <Image
        src="/contact%20us%20banner.jpg"
        className=" object-cover absolute inset-0 w-full h-full"
        width={800}
        height={800}
        alt="banner"
      />
      <div className=" flex space-y-8 sm:space-y-20 mb-20 flex-col z-10 h-full text-white">
        {/* <p className=" text-center text-xl md:text-5xl font-medium font2 capitalize">
          exquisite luxury, flawlessly tailored
        </p> */}
        <div className="flex flex-col md:flex-row gap-5  w-full items-center justify-center">
          <Link href="/contact-us" target="_blank">
            <Button
              className=" w-60 bg-transparent font-bold rounded-xs"
              variant={"outline"}
              size={"lg"}
            >
              Contact Us
            </Button>
          </Link>
          <Link href="https://wa.me/917023117408" target="_blank">
            <Button
              className=" w-60 bg-transparent font-bold rounded-xs"
              variant={"outline"}
              size={"lg"}
            >
              WhatsApp
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
