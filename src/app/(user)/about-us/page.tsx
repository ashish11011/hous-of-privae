import { Button } from "@/components/ui/button";
import { BadgeCheck, Gem, HandCoins, HeartHandshake } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className=" pt-2">
      <div className=" h-[28rem] border border-black">IMAGE</div>
      <div className=" max-w-7xl mt-10 mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Heading text="Dream" />
          <p className=" mt-10">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Qui nisi
            quod ut debitis iste ipsam porro. Illum assumenda doloremque quis
            distinctio saepe consequatur culpa, maxime obcaecati facilis fugit
            soluta quas.
          </p>
          <p className=" mt-10">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique
            totam a maxime voluptatibus officiis alias!
          </p>
        </div>
        <div className=" border border-black min-h-96">IMAGE</div>
      </div>

      <div className=" max-w-7xl mx-auto mt-16">
        <Heading text="the journey of the institution" />
        <p className=" mt-10">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus harum
          eaque reiciendis ipsam? Corrupti illum necessitatibus sint delectus
          maxime eum eveniet, vero officia qui repellat dolor hic architecto
          cum, inventore porro nulla similique iure. Excepturi. eaque reiciendis
          ipsam? Corrupti illum necessitatibus sint delectus maxime eum eveniet,
          vero officia qui repellat dolor hic architecto cum, inventore porro
          nulla similique iure. Excepturi.
        </p>
        <div className=" border my-6 border-black h-80">IMAGE</div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nam
          reiciendis nulla molestias iusto natus ratione unde amet sunt fuga
          dolore.
        </p>
      </div>
      <div className=" flex flex-col-reverse md:grid md:grid-cols-3 max-w-7xl gap-20 mx-auto mt-16">
        <div className=" w-full border border-black h-80">IMAGE</div>
        <div className=" w-full h-full col-span-2 flex flex-col justify-center gap-6">
          <Heading text="goal" />
          <p className="">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus harum
            eaque reiciendis ipsam? Corrupti illum necessitatibus sint delectus
            maxime eum eveniet, vero officia qui repellat dolor hic architecto
            cum, inventore porro nulla similique iure. Excepturi. eaque
            reiciendis ipsam? Corrupti illum necessitatibus sint delectus maxime
            eum eveniet, vero officia qui repellat dolor hic architecto cum,
            inventore porro nulla similique iure. Excepturi.
          </p>
        </div>
      </div>
      <div className=" flex flex-col justify-end md:grid md:grid-cols-3 max-w-7xl gap-20 mx-auto mt-16">
        <div className=" w-full h-full col-span-2 flex flex-col justify-center gap-6">
          <Heading text="objective" />
          <p className="">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus harum
            eaque reiciendis ipsam? Corrupti illum necessitatibus sint delectus
            maxime eum eveniet, vero officia qui repellat dolor hic architecto
            cum, inventore porro nulla similique iure. Excepturi. eaque
            reiciendis ipsam? Corrupti
          </p>
        </div>
        <div className=" w-full border border-black h-80">IMAGE</div>
      </div>
      <ValuesSection />
    </div>
  );
}
function Heading({ text }: { text: string }) {
  return <h3 className=" text-4xl uppercase font-medium">{text}</h3>;
}

const values = [
  {
    icon: <BadgeCheck className="text-neutral-800" />,
    label: "Quality Control",
  },
  { icon: <Gem className="text-neutral-800" />, label: "Fair Price" },
  {
    icon: <HeartHandshake className="text-neutral-800" />,
    label: "Social Responsibility.",
  },
  {
    icon: <HandCoins className="text-neutral-800" />,
    label: "Respect for Others",
  },
];

function ValuesSection() {
  return (
    <section className="w-full py-16 px-6 md:px-12 bg-[#f9f9f9]">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Text Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-gray-900">
            Rongreginee&apos;s Values are
          </h2>
          <ul className="space-y-4">
            {values.map((value, index) => (
              <li
                key={index}
                className="flex items-center space-x-3 text-lg text-gray-700"
              >
                <div className="w-6 h-6">{value.icon}</div>
                <span>{value.label}</span>
              </li>
            ))}
          </ul>

          <Link href={"category/all"}>
            <Button size={"lg"} className=" mt-10">
              Explore our category
            </Button>
          </Link>
        </div>

        {/* Right Image Section */}
        <div className=" overflow-hidden">
          <Image
            src="/4a8fbc5f-ebe9-4ee7-a67e-b06a6f16ca3b.png"
            alt="IMAGE"
            width={800}
            height={600}
            className=" border border-black"
          />
        </div>
      </div>
    </section>
  );
}
