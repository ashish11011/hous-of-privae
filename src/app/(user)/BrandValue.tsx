import { TDelivery, TFabric, TFlag, THappyFace } from "@/lib/icons";
import Image from "next/image";

const features = [
  {
    Icon: TFabric,
    title: "Consciously Crafted",
    description:
      "Every piece is made using premium vegan fabrics - soft on you and the planet.",
    image: "/1.jpeg",
  },
  {
    Icon: TDelivery,
    title: "Fast & Reliable Delivery",
    description:
      "From our studio to your wardrobe - enjoy quick, safe, and seamless delivery.",
    image: "/2.jpeg",
  },
  {
    Icon: THappyFace,
    title: "Love it or Return it",
    description:
      "Easy returns and exchanges - because your comfort and happiness come first.",
    image: "/3.jpeg",
  },
  {
    Icon: TFlag,
    title: "Proudly Indian",
    description:
      "Born in India, made for every body - every thread reflects local craftsmanship and care.",
    image: "/4.jpeg",
  },
];

export default function BrandValues() {
  return (
    <section className="   py-16">
      <div className="max-w-7xl mx-auto px-3 md:px-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-8">
        {features.map((feature, idx) => (
          // <div
          //   key={idx}
          //   className="text-center px-2 py-3 md:py-6 bg-orange-50 rounded  md:shadow-sm"
          // >
          //   {<feature.Icon size={60} stroke={1} className=" mx-auto mb-4" />}
          //   <h4 className=" font-semibold roboto text-lg capitalize mb-2">
          //     {feature.title}
          //   </h4>
          //   <p className="text-base roboto text-gray-700">
          //     {feature.description}
          //   </p>
          // </div>
          <div
            key={idx}
            className="border rounded-sm overflow-hidden w-full h-auto"
          >
            <Image
              src={feature.image}
              alt=""
              width={400}
              height={400}
              className=" w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
