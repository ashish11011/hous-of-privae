const testimonials = [
  {
    name: "Zaara Gidwani",
    image: "/testimonials/zaara.jpg",
    quote:
      "Picked this for a house puja and ended up twirling in it all day. Loved how soft the fabric was—and it photographed beautifully too!",
  },
  {
    name: "Asma",
    image: "/testimonials/asma.jpg",
    quote: "Pretty in pink! Loved how light and flattering it felt.",
  },
  {
    name: "Pooja Singh",
    image: "/testimonials/pooja.jpg",
    quote:
      "Obsessed with the detailing. This outfit made my day feel extra special!",
  },
  {
    name: "Amelia Waney",
    image: "/testimonials/amelia.jpg",
    quote:
      "Chose this deep indigo lehenga for a destination sangeet and it turned heads all night. Can’t get over how rich and detailed the embroidery is!",
  },
  {
    name: "Astha Mittal",
    image: "/testimonials/astha.jpg",
    quote:
      "It’s so pretty I totally loved it. Looking forward to my next order.",
  },
];

export default function Testimonials() {
  return (
    <section className=" py-16 text-center">
      <h2 className="text-3xl font-semibold mb-2">Mulmul and Me</h2>
      <p className="text-sm text-gray-600 mb-10 uppercase tracking-widest">
        Love shared by you
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-6 max-w-7xl mx-auto">
        {testimonials.map((t, i) => (
          <div key={i} className="flex bg-[#fdf7f2] flex-col items-center">
            <img
              src={t.image}
              alt={t.name}
              className="rounded-full w-36 h-36 object-cover mb-4"
            />
            <h4 className="font-medium text-lg">{t.name}</h4>
            <p className="text-sm text-gray-600 mt-2">{t.quote}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
