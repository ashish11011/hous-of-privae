import ProductCarousel from "@/components/ProductCarousel";
import Carousel from "@/components/HomeCrousel";
import { Categories } from "./Categories";
import BrandStorySection from "./BrandStory";
import AppointmentSection from "./AppointmentSection";
import NotesFromJaipur from "./NoteFromJaipur";
import WatchTheMaisonSection from "./WatchTheMaisonSection";
import LandingFilmSection from "./LandingFilmSection";
import { getAllCategories } from "@/lib";

export const dynamic = "force-dynamic";

export default async function Home() {
  const restricedCategory = [
    "new-aravials",
    "clearance",
    "best-seller",
    "aarambh",
  ];
  const allCategories = await getAllCategories();
  const categories = allCategories
    .filter(
      (cat) =>
        cat.level === 1 &&
        cat.isActive &&
        !restricedCategory.includes(cat.slug),
    )
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      tagline: cat.tagline,
    }));

  return (
    <div className=" w-full">
      <Carousel />
      <Categories categories={categories} />
      <div className="reveal">
        <LandingFilmSection />
      </div>
      {/* <div className="section-rule my-2" /> */}
      {/* <VideoPlay /> */}
      {/* <Categories2 /> */}

      <ProductCarousel />
      <div className="h-12"></div>
      {/* <RevicesCarousel /> */}
      {/* <BrandValues /> */}
      {/* <CoutureSection /> */}
      {/* <div className="section-rule my-2" /> */}
      <div className="reveal">
        <WatchTheMaisonSection />
      </div>
      <div className="section-rule my-2" />
      <div className="reveal">
        <NotesFromJaipur />
      </div>
      <div className="section-rule my-2" />
      <div id="privae-studio" className="reveal">
        <AppointmentSection />
      </div>
      <div className="reveal">
        <BrandStorySection />
      </div>
      <div className="h-16"></div>
    </div>
  );
}
