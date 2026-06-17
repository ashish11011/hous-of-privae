// import { useEffect, useState } from "react";

// import ImageWithSkeleton from "./ImageWithSkeleton";

// interface Pillar {
//     id: string;
//     title: string;
//     subtitle: string;
//     image_url: string;
// }

// const BrandStorySection = () => {
//     const [stories, setStories] = useState<Pillar[]>([]);

//     useEffect(() => {
//         let cancelled = false;
//         (async () => {

//         })();
//         return () => {
//             cancelled = true;
//         };
//     }, []);

//     if (stories.length === 0) return null;

//     return (
//         <section className="py-16 md:py-24 bg-background">
//             <div className="container mx-auto px-4">
//                 <div className="text-center mb-10">
//                     <p className="eyebrow mb-3">What sets us apart</p>
//                     <h2 className="font-body text-2xl md:text-4xl font-semibold text-foreground tracking-wide uppercase heading-rule">
//                         The Privae Promise
//                     </h2>
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
//                     {stories.map((story) => (
//                         <div key={story.id} className="group relative overflow-hidden rounded-sm aspect-[3/4]">
//                             <ImageWithSkeleton
//                                 wrapperClassName="absolute inset-0 w-full h-full"
//                                 src={resolveCmsSrc(story.image_url)}
//                                 alt={story.title}
//                                 className="transition-transform duration-700 group-hover:scale-105"
//                             />
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default BrandStorySection;
