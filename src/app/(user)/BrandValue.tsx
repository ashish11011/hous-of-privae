import { Delivery, Fabric, Flag, HappyFace } from "@/lib/incons";

const features = [
  {
    Icon: Fabric,
    title: "OUR FABRICS",
    description: "Made with love using only 100% vegan fabrics",
  },
  {
    Icon: Delivery,
    title: "EXPRESS DELIVERY",
    description:
      "We love getting our Muls to you as soon as you choose your favourites",
  },
  {
    Icon: HappyFace,
    title: "HAPPINESS GUARANTEED",
    description:
      "100% money back guaranteed & easy exchanges. No questions asked",
  },
  {
    Icon: Flag,
    title: "MADE IN INDIA",
    description:
      "A brand of Indian values, we are made completely in India from thought to creation",
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
