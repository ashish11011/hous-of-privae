import { TDelivery, TFabric, TFlag, THappyFace } from "@/lib/icons";

const features = [
  {
    Icon: TFabric,
    title: "Consciously Crafted",
    description:
      "Every piece is made using premium vegan fabrics - soft on you and the planet.",
  },
  {
    Icon: TDelivery,
    title: "Fast & Reliable Delivery",
    description:
      "From our studio to your wardrobe - enjoy quick, safe, and seamless delivery.",
  },
  {
    Icon: THappyFace,
    title: "Love it or Return it",
    description:
      "Easy returns and exchanges - because your comfort and happiness come first.",
  },
  {
    Icon: TFlag,
    title: "Proudly Indian",
    description:
      "Born in India, made for every body - every thread reflects local craftsmanship and care.",
  },
];

export default function BrandValues() {
  return (
    <section className=" bg-yellow-50/50  py-16">
      <div className="max-w-7xl mx-auto px-3 md:px-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="text-center px-2 py-3 md:py-6 bg-orange-50 rounded  md:shadow-sm"
          >
            {<feature.Icon size={60} stroke={1} className=" mx-auto mb-4" />}
            <h4 className=" font-semibold roboto text-lg uppercase mb-2">
              {feature.title}
            </h4>
            <p className="text-base roboto text-gray-700">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
