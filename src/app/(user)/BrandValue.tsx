const features = [
  {
    icon: "/about/our_farbrics.png",
    title: "OUR FABRICS",
    description: "Made with love using only 100% vegan fabrics",
  },
  {
    icon: "/about/express_delivery.png",
    title: "EXPRESS DELIVERY",
    description:
      "We love getting our Muls to you as soon as you choose your favourites",
  },
  {
    icon: "/about/happiness.png",
    title: "HAPPINESS GUARANTEED",
    description:
      "100% money back guaranteed & easy exchanges. No questions asked",
  },
  {
    icon: "/about/made_in_India.png",
    title: "MADE IN INDIA",
    description:
      "A brand of Indian values, we are made completely in India from thought to creation",
  },
];

export default function BrandValues() {
  return (
    <section className=" bg-yellow-50/50 border-y-4 border-y-gray-200 py-16">
      <div className="max-w-7xl mx-auto px-3 md:px-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="text-center px-2 py-3 md:py-6 bg-orange-50 rounded  md:shadow-sm"
          >
            <img
              src={feature.icon}
              alt={feature.title}
              className=" size-20 md:size-32 object-contain mx-auto mb-4"
            />
            <h4 className=" font-semibold amr text-lg tracking-wide uppercase mb-2">
              {feature.title}
            </h4>
            <p className="text-base text-gray-700">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
